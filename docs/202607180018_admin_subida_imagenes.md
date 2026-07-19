# 202607180018 — Editor CMS Fase 5a: subida de imágenes al /media

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Desde el editor de bloques, los campos de tipo `imagen` permiten **subir un
archivo** (además de pegar la ruta), que va a `/media` y queda servible al vuelo.

## 1. Backend

- **`AdminMediaController`** `POST /api/admin/media` (`[Authorize(Editor,Admin)]`,
  multipart): valida tamaño (≤5 MB) y extensión (jpg/png/webp/gif/svg), genera un
  nombre seguro con GUID, guarda en `Media:Ruta/<carpeta>/` y devuelve
  `{ url: "/media/<carpeta>/<archivo>" }`. La carpeta se sanea.

## 2. Frontend

- **`admin-api.subirImagen(file, carpeta)`** (FormData + Bearer).
- **`FormularioBloqueDinamico`**: el tipo `imagen` ahora es `CampoImagen` con
  input de ruta + botón **Subir** + **vista previa** (resuelta con `resolverMedia`).

## 3. Cómo se probó

Verificado el 18/07/2026 (con `admin_web1`): subir PNG → `/media/ofertas/…`,
recuperable por `/media` (200, image/png); `.txt` → 400 (formato); sin token →
401. `tsc`/`build` sin errores.

## 4. Pendiente (resto de Fase 5)

- Bandeja de **respuestas de formularios** (bloque `form`) en el admin.
- **Exportaciones** (ClosedXML/QuestPDF).
