# CLAUDE.md — Portal TuBazar (BCE)

Contexto del proyecto para Claude Code. Leer completo antes de generar código.
Idioma de trabajo: **español** (código en inglés, comentarios/docs en español).

## 1. Qué es este proyecto

CMS/portal **genérico y parametrizable para retail**. La primera instancia es
**TuBazar**, el bazar del Ejército del Perú (BCE), que reemplaza un sitio
legado en Java JSP + MySQL, pero el producto debe poder servir a otros retails.

**Regla dura de genericidad**: nada de marca en el código. Los proyectos .NET
se llaman `Cms.*` (no `TuBazar.*`); la identidad del sitio (nombre, slogan,
descripción SEO) vive en configuración (`web/.env.local`:
`NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_NAME_ACCENT`,
`NEXT_PUBLIC_SITE_SLOGAN`, `NEXT_PUBLIC_SITE_DESCRIPTION` → `web/lib/sitio.ts`
y componente `Marca`). "TuBazar" solo puede aparecer en configuración, datos
del CMS y documentación de la instancia.

El portal tiene tres partes:

1. **Sitio público** (contenido gestionado por CMS propio metadata-driven):
   ofertas, tiendas, concesionarios, noticias, páginas libres.
2. **Portal de clientes** (personal militar): registro, login, estado de cuenta,
   historial de compras.
3. **Portal de proveedores**: consulta de facturas, estados y calendario de pagos.

El sitio arranca **desde cero** (no se migra el contenido del MySQL legado).

## 2. Arquitectura (decidida — no reabrir sin consultar)

**Dos dominios de datos + una capa de lógica + una capa de presentación:**

| Capa | Tecnología | Rol |
|---|---|---|
| Dominio transaccional | **SQL Server** (ERP existente, intocable) | Clientes, compras, cuentas, facturas, pagos. Solo lectura vía SPs/vistas dedicadas |
| Dominio de contenido | **PostgreSQL** (nueva BD) | CMS metadata-driven: páginas, bloques, menú, con JSONB |
| Lógica | **ASP.NET Core 8 Web API** (C#) | Única puerta a ambas BDs. Seguridad, reglas, orquestación |
| Presentación | **Next.js (App Router) + Tailwind** | Renderiza bloques del CMS y portales |

Reglas duras:
- La lógica de negocio vive SOLO en la API. Nunca en el CMS ni en el frontend.
- El frontend NUNCA se conecta directo a una base de datos.
- El ERP se consume solo mediante stored procedures o vistas creadas para el portal.
- "Ambiente" se reserva para dev/QA/prod. Las bases son "dominios de datos".

## 3. Infraestructura (Camino A — decidido)

- Servidores propios con **IIS**.
- API .NET: corre nativa en IIS (ASP.NET Core Module).
- Next.js: corre como **servicio Node en Windows** (pm2 o servicio), e IIS hace
  **proxy inverso con ARR + URL Rewrite** hacia él.
- Imágenes/banners: carpeta de archivos servida por la API (fase 1); evaluar
  Blob/S3 si crece.

## 4. Stack y librerías

- **Backend**: ASP.NET Core 8 Web API, C#.
  - **Dapper** para llamar SPs de SQL Server (ERP).
  - **Dapper + Npgsql** para el modelo del CMS en PostgreSQL (decisión: misma
    librería de acceso en ambos dominios; se descartó EF Core).
  - **ASP.NET Identity + JWT** para autenticación; roles: `Cliente`,
    `Proveedor`, `Editor`, `Admin`. Identity vive en su propio esquema/BD.
  - Exportaciones: **ClosedXML** (Excel), **QuestPDF** (PDF).
  - Validación backend obligatoria (FluentValidation o DataAnnotations).
- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS,
  react-hook-form + zod, TanStack Table para listas transaccionales.
  ISR para contenido público.

## 5. Reglas funcionales decididas

### Ofertas (híbridas)
- El editor elige productos y sube lo editorial (imagen, orden, vigencia).
- **Producto y precio vienen del ERP** vía API (SP en SQL Server), el bloque
  del CMS guarda `codigo_producto`, nunca el precio.
- Transición: el bloque acepta `origen: "manual" | "erp"`; en manual el editor
  ingresa precio (comportamiento actual), en erp se resuelve contra la API.

### Registro y cuentas
- **Cliente**: solo puede registrarse si su CIP/DNI existe en el ERP.
  Flujo: form → API valida contra SP del ERP → si existe, crea usuario en
  Identity vinculado al código de cliente del ERP.
- **Proveedor**: cuentas creadas por un Admin desde el panel; se envía
  usuario + contraseña temporal por correo; cambio obligatorio al primer login.
- Recuperar contraseña: tokens de Identity + enlace por correo.

### Contenido: estado y vigencia (requerido)
- Toda página y bloque tiene `estado` (`borrador|publicado|archivado`) y
  `vigencia_desde` / `vigencia_hasta` (nullable).
- La Content API pública SOLO entrega publicado y vigente
  (`ahora BETWEEN vigencia_desde AND vigencia_hasta`, con nulls = sin límite).
  La publicación/expiración programada sale de este filtro, sin jobs.

## 6. Enrutamiento y menú

- Páginas de sistema como archivos en Next.js: `/registro`, `/login`,
  `/recuperar`, `/cliente/**`, `/proveedor/**`, `/admin/**`.
- Todo lo demás cae en `app/[...slug]/page.tsx` → consulta Content API por
  slug → renderiza bloques. Slug inexistente → `notFound()`.
- El menú es data del CMS: `{ etiqueta, url, tipo: "contenido"|"sistema", orden }`.
- **Slugs reservados** (validar en la API del CMS al crear páginas):
  `registro, login, recuperar, cliente, proveedor, admin, api`.

## 7. Diseño aprobado

Maqueta de referencia: `docs/propuesta-tubazar.html` (versión hero rojo — aprobada;
existe una variante hero verde descartada). Convertir sus secciones en
componentes de bloque: `HeroCartel`, `GrillaOfertas`, `ListaTiendas`,
`GrillaConcesionarios`, `GrillaNoticias`, `BandaPortales`.

Tokens (Tailwind):
- `rojo: #EC3237` (rojo BCE del logo — precios, CTAs de oferta, hero)
- `amarillo: #FFEB04` (stickers/acentos; en texto sobre blanco usar dorado `#C9A800`)
- `verde: #475D2D` y `verde-osc: #36471F` (institucional: topbar, portales, footer)
- `papel: #FAFAF6`, `texto: #1D1D1B`, `linea: #E4E3DB`
- Tipografías: **Archivo** (condensed, bold — titulares y precios) +
  **Public Sans** (cuerpo).
- Firma visual: "cartel de precio de góndola" (tarjeta rotada con sticker OFERTA).
- Responsive hasta móvil, `prefers-reduced-motion` respetado.

## 8. Estructura de repositorio propuesta

```
cms/
├── CLAUDE.md
├── docs/
│   └── propuesta-tubazar.html      # maqueta aprobada
├── api/                            # ASP.NET Core 8 (solución Cms.sln)
│   ├── src/Cms.Api/                # controllers, auth
│   ├── src/Cms.Content/            # dominio CMS (Dapper + Npgsql)
│   ├── src/Cms.Erp/                # acceso a SQL Server (Dapper + SPs)
│   └── db/
│       ├── postgres/               # migraciones/DDL del CMS
│       └── sqlserver/              # SPs y vistas para el portal
└── web/                            # Next.js App Router + TS + Tailwind
    └── app/
        ├── [...slug]/              # catch-all de contenido
        ├── (auth)/registro|login|recuperar
        ├── cliente/  proveedor/  admin/
        └── components/blocks/      # un componente por tipo de bloque
```

## 9. Convenciones de código

### SQL Server (T-SQL) — estándar del autor (obligatorio)
- Todo script inicia con bloque de cabecera con etiquetas en español:
  `Descripción breve; Input; Output; Creado por; Fec Creación (DD/MM/YYYY);
  Fec Actualización (DD/MM/YYYY); Responsable; Motivo`.
- Autor por defecto: **Alex Espinoza**.
- Cada modificación agrega una línea de historial en la cabecera; nunca se
  borra el historial previo.
- Procedimientos y funciones: patrón `IF OBJECT_ID(...) IS NOT NULL DROP ...`
  seguido de `CREATE`. **No usar** `CREATE OR ALTER`.
- Prefijos: `sp` procedimientos, `fne` funciones escalares, `fnt` funciones
  de tabla, `syn`/`Syn_` sinónimos.
- Scripts ad-hoc documentan variables de control; las BIT usan prefijo `b`
  (ej. `@bEjecutar`).

### C# y TypeScript
- C#: convenciones .NET estándar; DTOs para todo lo expuesto; nada de
  entidades EF directas en respuestas.
- TS: componentes de bloque tipados contra el JSON del CMS; validación de
  formularios con zod espejando la validación del backend.

## 10. Modelo CMS (siguiente paso — aún NO diseñado en detalle)

Diseñar en PostgreSQL: `paginas` (slug, titulo, plantilla, estado, vigencia),
`bloques` (pagina_id, tipo, orden, contenido JSONB, estado, vigencia),
`menu_items`, `tipos_bloque` (metadata que define el esquema de cada bloque —
esto es lo "metadata-driven"). Incluir formularios dinámicos como tipo de
bloque (`form` con campos JSON) y tabla de respuestas.

## 11. Documentación obligatoria por proceso

- Cada proceso/paso del roadmap que se complete debe dejar su documentación en
  la carpeta `docs/` (en la raíz del repo), en español, formato Markdown.
- Un archivo por proceso, con nombre descriptivo en kebab-case
  (ej. `docs/01-modelo-cms-postgresql.md`, `docs/02-content-api.md`).
- Contenido mínimo: qué se hizo, decisiones tomadas, cómo ejecutarlo/probarlo
  en local, y pendientes conocidos.
- La documentación se crea o actualiza en el mismo momento en que se termina
  el proceso — no se deja para después.

## 12. Roadmap acordado (migración incremental)

1. Modelo CMS en PostgreSQL + Content API + catch-all en Next.js.
2. Sitio público con bloques del diseño aprobado (contenido desde cero).
3. Autenticación (Identity + JWT) y registro con validación CIP/DNI vs ERP.
4. Portal cliente (estado de cuenta, compras) — SPs de solo lectura en ERP.
5. Portal proveedor (facturas, pagos) + alta de proveedores desde admin.
6. Reportes/exportaciones (ClosedXML, QuestPDF).
7. Despliegue IIS: API nativa + Next.js como servicio Node tras ARR.
8. Apagado del sitio JSP legado.
