# 202607180019 — Editor CMS Fase 5b/5c: bandeja de respuestas + export Excel

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Bandeja de administración de las respuestas de los bloques de formulario, con
exportación a Excel (ClosedXML). Cierra el ciclo del bloque `form` (el envío
público ya existía).

## 1. Backend

- **`AdminFormulariosRepository`** (Dapper): lista los bloques de tipo
  `formulario` (con su página, título y total de respuestas) y las respuestas de
  uno (`form_respuestas`).
- **`AdminFormulariosController`** (`/api/admin/formularios`,
  `[Authorize(Editor,Admin)]`):
  - `GET`: formularios del sitio con su conteo.
  - `GET /{bloqueId}/respuestas`: respuestas (datos JSON + fecha).
  - `GET /{bloqueId}/respuestas/excel`: **exporta a .xlsx** (ClosedXML); columnas
    = unión de las claves de las respuestas + fecha.
- Paquete **ClosedXML 0.104.2** agregado a `Cms.Api`.

## 2. Frontend

- **`/admin/respuestas`**: elige un formulario → tabla de respuestas (columnas
  dinámicas desde `datos`) + botón **Descargar Excel** (fetch autenticado → blob).
- Enlace "Respuestas" en la nav; `admin-api` ampliado (`listarFormularios`,
  `listarRespuestas`, `descargarRespuestasExcel`).

## 3. Cómo se probó

Verificado el 18/07/2026 (con `admin_web1`, contra un formulario real "Encuesta"):
`GET formularios` lista con total; `GET respuestas` → 200; **Excel** → 200,
`application/vnd.openxmlformats...`, firma `PK` (xlsx válido, 6489 bytes); sin
token → 401. `tsc`/`build` sin errores.

## 4. Estado — Fase 5 completa

Editor de CMS terminado (Fases 0–5): acceso admin, páginas, bloques
metadata-driven, menú, usuarios/roles, subida de imágenes, formularios +
respuestas + export Excel.

**Detalles menores restantes** (no bloqueantes): restructurar layouts para que
`/admin` no use el overlay `fixed`; forzar cambio de contraseña del admin al
primer login; export a PDF (QuestPDF) donde aplique.
