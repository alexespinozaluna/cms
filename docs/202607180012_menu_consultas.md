# 202607180012 — Menú "Consultas" y página de enlaces externos

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)

Se agrega el ítem de menú **"Consultas"** al header (data del CMS) que dirige a
la página `/consultas` con enlaces externos a herramientas de consulta y
validación. Todo es **contenido de la instancia** (no código).

## 1. Qué se hizo (contenido CMS, PostgreSQL)

- **`api/db/postgres/contenido_inicio_tubazar.sql`**: se agrega el ítem de menú
  `('Consultas', '/consultas', 'contenido', 5)`.
- **`api/db/postgres/contenido_consultas.sql`** (nuevo, idempotente): crea la
  página `consultas` (publicada) con un bloque `texto_rico` que lista los
  enlaces (todos `target="_blank" rel="noopener noreferrer"`):
  - Indicadores de Gestión — https://indicadores.tubazar.com.pe
  - Constancias de No Adeudo Online — https://micuenta.tubazar.com.pe
  - Comprobante Electrónico — http://consulta.tubazar.com.pe:81/
  - Búsqueda - Nubefact — https://www.nubefact.com/find_document
  - Valida Documento Electrónico - SUNAT — https://ww1.sunat.gob.pe/ol-ti-itconsvalicpe/ConsValiCpe.htm
  - Valida Documento Electrónico - OSE — https://20505606435.operador.pe/buscar
- La página la sirve el catch-all `app/[...slug]` (no requiere código nuevo).

## 2. Cómo se probó

Verificado el 18/07/2026: la Content API devuelve el ítem de menú y la página
con los 6 enlaces; `/consultas` renderiza 200 con los enlaces en nueva pestaña.
(El header de la portada estática toma el nuevo ítem tras un rebuild/revalidación
ISR; en `npm run dev` es inmediato.)

## 3. Notas

- Para aplicar en otra BD: ejecutar `contenido_consultas.sql` y reaplicar
  `contenido_inicio_tubazar.sql` (que define el menú).
- Los enlaces son de la instancia TuBazar (contenido editable desde el CMS),
  no van en código.
