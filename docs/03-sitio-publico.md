# Proceso 3 — Sitio público con el diseño aprobado

**Fecha:** 17/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (17/07/2026)

Paso 2 del roadmap: la portada pública renderiza el diseño aprobado
(`docs/propuesta-tubazar.html`, versión hero rojo) con contenido servido por
el CMS. Se hizo en tres sub-pasos.

## 1. Qué se hizo

### 2.1 Contenido de la portada (data del CMS)

- Script idempotente `api/db/postgres/contenido_inicio_tubazar.sql`: crea/actualiza
  la página `inicio` (publicada) con los 6 bloques de la maqueta —
  `hero_cartel`, `grilla_ofertas`, `lista_tiendas`, `grilla_concesionarios`,
  `grilla_noticias`, `banda_portales` — y el menú del sitio.
- Es DATA de la instancia TuBazar (el modelo/producto no cambia).

### 2.2 Servido de imágenes (`/media`)

- `Cms.Api` sirve archivos estáticos en `/media/**` desde una carpeta física
  configurable por instancia (`Media:Ruta` en `appsettings.json`, relativa al
  content root; se crea sola si no existe).
- El contenido del CMS guarda **rutas relativas** (`/media/ofertas/arroz.jpg`)
  para no acoplar la data al ambiente; la web las resuelve contra
  `NEXT_PUBLIC_CONTENT_API_URL` en `web/lib/media.ts`. Las URLs absolutas se
  respetan tal cual.
- La carpeta `media/` va ignorada en git (solo `.gitkeep`).

### 2.3 Afinado visual contra la maqueta

- **Tipografía**: se distingue `.display` (Archivo condensado pesado, **caja
  mixta**) para titulares del hero y de sección, de `.titular` (Archivo
  condensado en MAYÚSCULAS) para stickers, etiquetas y precios. La fuente
  Archivo se carga como variable con el eje de ancho (`axes: ['wdth']`) para
  que `font-stretch` reproduzca el condensado de la maqueta.
- **Hero**: kicker amarillo rotado, título en caja mixta, cartel de góndola
  inclinado (+1.6°) con sticker verde "OFERTA" arriba-izquierda, precio con
  `S/` y centavos en volado, y franja amarilla de "cartel de precio" al pie.
- **Ofertas**: tarjetas rectas con placeholder en degradado y "levantar" al
  pasar el mouse (antes iban rotadas); sticker de descuento arriba-izquierda.
- **Tiendas**: tarjetas con borde izquierdo verde y datos etiquetados
  (Ubicación / Horario / Teléfono).
- **Concesionarios**: tarjetas centradas con logo redondo verde e iniciales
  amarillas de respaldo (ignora conectores: "Café del Patio" → "CP").
- **Noticias**: media 16/9 en degradado cálido, fecha en rojo, título en caja
  mixta.
- **Portales**: banda verde con tarjetas translúcidas, rol en sticker amarillo
  y botón de contorno blanco.
- **Header**: fijo (`sticky`), con topbar verde (slogan + accesos a portales),
  logo bicolor (rojo/dorado, vía `Marca`), menú de secciones (data del CMS) y
  acciones "Iniciar sesión" / "Ver ofertas".
- **Anclas de sección**: cada bloque expone un `id` (`#ofertas`, `#tiendas`,
  `#concesionarios`, `#noticias`, `#portales`); el menú del CMS enlaza a ellas
  (`/#ofertas`, …), con `scroll-margin-top` para el header fijo y
  `scroll-behavior: smooth` respetando `prefers-reduced-motion`.

## 2. Decisiones tomadas

- **Menú = secciones de la portada** (Ofertas, Tiendas, Concesionarios,
  Noticias), como en la maqueta. El acceso a los portales se movió al topbar
  del header y a la banda de portales, fuera del menú CMS.
- Solo el cartel del hero se inclina; las tarjetas de oferta van rectas (fiel
  a la maqueta). El movimiento se anula con `prefers-reduced-motion`.
- Títulos en **caja mixta** (no MAYÚSCULAS): la maqueta usa Archivo display
  mixto; las mayúsculas quedan para stickers/etiquetas/precios.

## 3. Cómo probarlo en local

1. Aplicar el contenido (si la BD está limpia):
   `psql -d tubazar_cms -f api/db/postgres/contenido_inicio_tubazar.sql`.
2. Levantar `Cms.Api` (VS o `dotnet run`) en `http://localhost:5080`.
3. `cd web && npm run dev` → `http://localhost:3000` debe verse como la
   maqueta aprobada. Verificar: los enlaces del menú saltan a cada sección;
   el hero muestra el cartel inclinado con sticker "OFERTA"; los concesionarios
   sin logo muestran iniciales; el header queda fijo al hacer scroll.
4. Para imágenes reales: copiar archivos a `api/src/Cms.Api/media/...` y
   referenciarlos en el contenido como `/media/...`.

Verificado el 17/07/2026: `npm run build` y `tsc --noEmit` sin errores; render
en vivo con las 5 anclas de sección presentes, menú enlazando a ellas,
titulares en caja mixta (clase `display`), sticker verde "OFERTA", franja
amarilla del hero, iniciales de concesionarios y header fijo con accesos de
portal.

## 4. Pendientes conocidos

- **Imágenes/logos reales** aún no cargados: ofertas, noticias y concesionarios
  usan placeholders/iniciales hasta subir archivos a `media/`.
- **Footer**: sigue en su versión mínima; la maqueta tiene un pie de 4 columnas
  (Explorar / Portales / Contacto + legal) con enlaces que son data de la
  instancia (redes, libro de reclamaciones, términos). Pendiente de definir si
  se vuelven contenido del CMS o configuración.
- El hero no resalta en amarillo parte del título (la maqueta pinta "ahora en
  línea"): requeriría estructurar el título en el contenido; hoy es un texto
  plano.
- Falta contenido en secciones vacías de portales (`/cliente`, `/proveedor`,
  `/login`): son rutas de sistema de pasos posteriores del roadmap.
