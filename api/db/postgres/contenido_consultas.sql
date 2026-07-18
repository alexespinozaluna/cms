-- ============================================================================
-- Descripción breve : Página "Consultas" (/consultas) del portal TuBazar: enlaces
--                     externos a herramientas de consulta y validación.
--                     Contenido de la instancia (bloque texto_rico).
-- Input             : BD del CMS con el modelo aplicado.
-- Output            : Página 'consultas' publicada con un bloque texto_rico.
-- Creado por        : Alex Espinoza
-- Fec Creación      : 18/07/2026
-- Fec Actualización : 18/07/2026
-- Responsable       : Alex Espinoza
-- Motivo            : Nuevo ítem de menú "Consultas" con enlaces externos.
-- Historial         :
--   18/07/2026  Alex Espinoza  Versión inicial.
--
-- Nota: idempotente (upsert de la página + reemplazo del bloque). El ítem de
-- menú se agrega en contenido_inicio_tubazar.sql.
-- ============================================================================

BEGIN;

INSERT INTO paginas (slug, titulo, descripcion_seo, plantilla, estado, creado_por)
VALUES ('consultas', 'Consultas',
        'Accesos a herramientas de consulta y validación de comprobantes.',
        'default', 'publicado', 'Alex Espinoza')
ON CONFLICT (slug) DO UPDATE
SET titulo = EXCLUDED.titulo, estado = 'publicado', actualizado_en = now();

DELETE FROM bloques WHERE pagina_id = (SELECT id FROM paginas WHERE slug = 'consultas');

INSERT INTO bloques (pagina_id, tipo_bloque_id, orden, contenido, estado)
SELECT p.id, tb.id, 1, $j$
{
  "contenido": "<h2>Consultas</h2><p>Accesos a herramientas de consulta y validación.</p><ul><li><a href='https://indicadores.tubazar.com.pe' target='_blank' rel='noopener noreferrer'>Indicadores de Gestión</a></li><li><a href='https://micuenta.tubazar.com.pe' target='_blank' rel='noopener noreferrer'>Constancias de No Adeudo Online</a></li><li><a href='http://consulta.tubazar.com.pe:81/' target='_blank' rel='noopener noreferrer'>Comprobante Electrónico</a></li><li><a href='https://www.nubefact.com/find_document' target='_blank' rel='noopener noreferrer'>Búsqueda - Nubefact</a></li><li><a href='https://ww1.sunat.gob.pe/ol-ti-itconsvalicpe/ConsValiCpe.htm' target='_blank' rel='noopener noreferrer'>Valida Documento Electrónico - SUNAT</a></li><li><a href='https://20505606435.operador.pe/buscar' target='_blank' rel='noopener noreferrer'>Valida Documento Electrónico - OSE</a></li></ul>"
}
$j$::jsonb, 'publicado'
FROM   paginas p
JOIN   tipos_bloque tb ON tb.codigo = 'texto_rico'
WHERE  p.slug = 'consultas';

COMMIT;

SELECT 'consultas bloques' AS objeto, count(*) AS total
FROM   bloques b JOIN paginas p ON p.id = b.pagina_id
WHERE  p.slug = 'consultas';
