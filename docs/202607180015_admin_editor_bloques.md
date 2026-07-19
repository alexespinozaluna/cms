# 202607180015 — Editor CMS Fase 2: editor de bloques (metadata-driven)

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

El corazón del CMS: por página, gestionar bloques con **formularios generados
dinámicamente** desde `tipos_bloque.esquema_campos`.

## 1. Backend

- **`AdminBloquesRepository`** (Dapper): `tipos_bloque` (con `esquema_campos`) y
  `bloques` de una página (listar, obtener, crear con orden auto, actualizar
  contenido/estado/vigencia, reordenar, eliminar). JSONB se lee/escribe como texto.
- **`AdminBloquesController`** (`/api/admin`, `[Authorize(Editor,Admin)]`):
  `GET tipos-bloque`, `GET/POST paginas/{id}/bloques`, `GET/PUT/DELETE bloques/{id}`,
  `PUT paginas/{id}/bloques/orden`. **Validación del contenido contra el esquema**
  (campos requeridos de nivel superior presentes y no vacíos; listas requeridas
  no vacías) — devuelve el mensaje del campo faltante.

## 2. Frontend

- **`FormularioBloqueDinamico`**: renderiza inputs según `esquema_campos`
  (`texto`, `textolargo`, `opcion`→select, `decimal`→number, `imagen`, `fecha`,
  y `lista`→grupo repetible con sub-campos anidados). Sin acoplar a ningún tipo
  concreto.
- **`/admin/paginas/[id]/bloques`**: lista de bloques con **reordenar** (▲▼),
  editar, eliminar; agregar bloque eligiendo el tipo; panel de edición con estado
  + el formulario dinámico.
- Enlace "Bloques" desde el listado de páginas. `admin-api` ampliado (tipos,
  bloques, reordenar…).

## 3. Cómo se probó

Verificado el 18/07/2026 (con `admin_web1`): `GET tipos-bloque` devuelve los 8
tipos con su esquema; crear `texto_rico` → 201; crear `hero_cartel` sin `titulo`
(requerido) → **400 "El campo 'Título' es obligatorio."**; listar y eliminar OK.
`tsc` y `npm run build` sin errores.

## 4. Pendiente

- Fase 3: gestión del menú (`menu_items`).
- Validación de esquema más profunda (tipos/formatos de sub-campos), vista previa
  del bloque, y subida de imágenes a `/media` desde el editor.
