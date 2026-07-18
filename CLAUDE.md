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
    librería de acceso en ambos dominios; se descartó EF Core **para los
    dominios de datos** —CMS y ERP—).
  - **ASP.NET Identity + JWT** para autenticación; roles: `Cliente`,
    `Proveedor`, `Editor`, `Admin`. Identity vive en su propio esquema/BD
    (esquema `auth` en el mismo PostgreSQL). **EF Core se usa SOLO aquí**,
    acotado al proyecto `Cms.Auth` y sus tablas de Identity; nunca toca CMS
    ni ERP (decisión 18/07/2026: es el store estándar de Identity y evita
    escribir stores a mano). El ERP se consulta para validar CIP/DNI detrás
    de una interfaz mockeable (`Cms.Erp`) hasta tener el SP real.
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

### Registro y cuentas (login único — decisión 18/07/2026)
- **Un solo login** para todos los tipos. La persona debe existir en la tabla
  `Anexo` del ERP y estar activa (`EsDesactivado=0`) con al menos un flag de
  rol. Los roles salen de esos flags y **se combinan**: `EsCliente`,
  `EsProveedor`, `EsConcesionario`, `EsTrabajador` (este último solo si además
  `EsDomiciliado=1`). Las opciones del usuario logueado se arman según sus roles.
- **Credenciales en PostgreSQL** (concepto "AnexoWeb" = usuario de Identity
  extendido: usuario=CIP/DNI, correo, teléfono, contraseña hasheada, `IdAnexo`).
  El ERP NO se escribe: se consulta solo lectura (SP/vista sobre `Anexo`, por
  `CodAnexo` o `Documento`) para validar existencia y traer flags.
- **Registro**: form → API valida contra el ERP → si existe con algún rol, crea
  la cuenta web y asigna los roles derivados.
- **Login**: usuario (CIP/DNI) + contraseña → valida la contraseña en Postgres
  y **relee los flags del ERP en vivo** para sincronizar roles (quien pasa a
  tener otro rol lo gana sin re-registrarse).
- Recuperar contraseña: tokens de Identity + enlace por correo (pendiente,
  requiere servicio de correo).
- `SistemaUsuario` (login del ERP de escritorio) NO se usa ni se toca.

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
  `registro, login, recuperar, portal, cliente, proveedor, admin, api`.

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

## 11. Documentación obligatoria por cambio

- **Cada cambio tiene su propio documento independiente** en `docs/` (raíz del
  repo), en español y Markdown. No se acumulan varios cambios en un archivo.
- Nombre del archivo: **`yyyymmdd####_nombre_del_cambio.md`**
  - `yyyymmdd####` = fecha + secuencia del día pegadas, sin separador
    (`yyyymmdd` fecha; `####` correlativo con ceros a la izquierda: `0001`…).
  - `nombre_del_cambio` = descriptivo en `snake_case`.
  - Ej.: `docs/202607180002_login_unico_roles_erp.md`.
- Contenido mínimo: qué se hizo, decisiones tomadas, cómo ejecutarlo/probarlo
  en local, y pendientes conocidos.
- El documento se crea en el mismo momento en que se termina el cambio (junto
  con su commit), no se deja para después. Si un cambio posterior corrige otro,
  se crea un documento nuevo (no se reescribe el anterior; se enlaza).

## 12. Roadmap acordado (migración incremental)

1. Modelo CMS en PostgreSQL + Content API + catch-all en Next.js.
2. Sitio público con bloques del diseño aprobado (contenido desde cero).
3. Autenticación (Identity + JWT) y registro con validación CIP/DNI vs ERP.
4. Portal cliente (estado de cuenta, compras) — SPs de solo lectura en ERP.
5. Portal proveedor (facturas, pagos) + alta de proveedores desde admin.
6. Reportes/exportaciones (ClosedXML, QuestPDF).
7. Despliegue IIS: API nativa + Next.js como servicio Node tras ARR.
8. Apagado del sitio JSP legado.
