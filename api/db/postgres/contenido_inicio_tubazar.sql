-- ============================================================================
-- Descripción breve : Contenido inicial de la portada (página 'inicio') y menú
--                     para la instancia TuBazar, según la maqueta aprobada
--                     docs/propuesta-tubazar.html (versión hero rojo).
--                     Reemplaza el contenido de prueba del modelo.
-- Input             : BD del CMS con el modelo aplicado (cms_modelo_postgresql.sql)
-- Output            : Página 'inicio' publicada con 6 bloques (hero_cartel,
--                     grilla_ofertas, lista_tiendas, grilla_concesionarios,
--                     grilla_noticias, banda_portales) y menú definitivo
-- Creado por        : Alex Espinoza
-- Fec Creación      : 17/07/2026
-- Fec Actualización : 17/07/2026
-- Responsable       : Alex Espinoza
-- Motivo            : Paso 2 del roadmap — sitio público con el diseño aprobado
-- Historial         :
--   17/07/2026  Alex Espinoza  Versión inicial
--   17/07/2026  Alex Espinoza  Menú alineado a la maqueta: enlaces de ancla a
--                              las secciones de la portada (Ofertas, Tiendas,
--                              Concesionarios, Noticias). Los portales pasan a
--                              accesos del topbar/banda, fuera del menú CMS.
--
-- Nota de control   : el script es idempotente — puede re-ejecutarse: hace
--                     upsert de la página, borra y re-inserta sus bloques y
--                     el menú dentro de una transacción. Es DATA de la
--                     instancia TuBazar (el modelo/producto no cambia).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Página 'inicio' (upsert)
-- ----------------------------------------------------------------------------
INSERT INTO paginas (slug, titulo, descripcion_seo, plantilla, estado, creado_por)
VALUES (
    'inicio',
    'TuBazar — Inicio',
    'Ofertas, tiendas, concesionarios y noticias del Bazar Central del Ejército del Perú.',
    'default',
    'publicado',
    'Alex Espinoza'
)
ON CONFLICT (slug) DO UPDATE
SET titulo          = EXCLUDED.titulo,
    descripcion_seo = EXCLUDED.descripcion_seo,
    estado          = 'publicado',
    actualizado_en  = now();

-- ----------------------------------------------------------------------------
-- 2. Bloques de la portada (reemplazo completo)
--    El JSON de cada bloque calza con tipos_bloque.esquema_campos y con los
--    tipos de web/lib/content-api.ts.
-- ----------------------------------------------------------------------------
DELETE FROM bloques
WHERE pagina_id = (SELECT id FROM paginas WHERE slug = 'inicio');

INSERT INTO bloques (pagina_id, tipo_bloque_id, orden, contenido, estado)
SELECT p.id, tb.id, v.orden, v.contenido, 'publicado'
FROM (VALUES

  -- HERO: cartel de precio de góndola (firma visual)
  ('hero_cartel', 1, $j$
  {
    "kicker": "Ofertas de la semana",
    "titulo": "El bazar de tu unidad, ahora en línea",
    "subtitulo": "Las mismas ofertas de nuestras tiendas en los centros del Ejército del Perú, actualizadas todos los días. Revisa tu estado de cuenta y tus compras desde cualquier lugar.",
    "origen": "manual",
    "producto": "Aceite vegetal 1 L",
    "precio": 9.90,
    "precio_antes": 14.50
  }
  $j$::jsonb),

  -- OFERTAS DESTACADAS
  ('grilla_ofertas', 2, $j$
  {
    "titulo": "Ofertas destacadas",
    "origen": "manual",
    "items": [
      { "producto": "Detergente en polvo 4 kg",    "precio": 21.90, "precio_antes": 32.00, "etiqueta": "-32%" },
      { "producto": "Gaseosa 3 L — pack familiar", "precio": 12.50, "precio_antes": 25.00, "etiqueta": "2×1" },
      { "producto": "Arroz extra 5 kg",            "precio": 24.90, "precio_antes": 33.20, "etiqueta": "-25%" },
      { "producto": "Televisor LED 50\" 4K",       "precio": 1199,  "precio_antes": 1599,  "etiqueta": "Sólo hoy" }
    ]
  }
  $j$::jsonb),

  -- TIENDAS
  ('lista_tiendas', 3, $j$
  {
    "titulo": "Tiendas en los centros del Ejército",
    "items": [
      { "nombre": "Bazar Cuartel General", "ubicacion": "Cuartel General del Ejército, San Borja",           "horario": "Lun–Sáb 9:00–20:00", "telefono": "(01) 555-0110" },
      { "nombre": "Bazar Chorrillos",      "ubicacion": "Escuela Militar de Chorrillos",                     "horario": "Lun–Sáb 9:00–19:30", "telefono": "(01) 555-0120" },
      { "nombre": "Bazar Rímac",           "ubicacion": "Fuerte General de División Rafael Hoyos Rubio",     "horario": "Lun–Vie 9:00–19:00", "telefono": "(01) 555-0130" }
    ]
  }
  $j$::jsonb),

  -- CONCESIONARIOS (logos pendientes: llegarán con el manejo de imágenes)
  ('grilla_concesionarios', 4, $j$
  {
    "titulo": "Concesionarios",
    "items": [
      { "nombre": "Electro Fácil", "rubro": "Electrodomésticos y tecnología" },
      { "nombre": "Farmacia Mía",  "rubro": "Salud y cuidado personal" },
      { "nombre": "Café del Patio","rubro": "Cafetería y pastelería" },
      { "nombre": "Óptica Visión", "rubro": "Lentes y exámenes visuales" }
    ]
  }
  $j$::jsonb),

  -- NOTICIAS (imágenes pendientes por la misma razón)
  ('grilla_noticias', 5, $j$
  {
    "titulo": "Noticias",
    "items": [
      { "fecha": "2026-07-12", "titulo": "Nuevo bazar en el norte del país",
        "resumen": "Ampliamos la red de tiendas para atender a más unidades y sus familias." },
      { "fecha": "2026-07-08", "titulo": "Campaña escolar: útiles con hasta 40% de descuento",
        "resumen": "Prepara el regreso a clases con precios de cartel en cuadernos, mochilas y más." },
      { "fecha": "2026-07-01", "titulo": "Nuevo portal de proveedores: consulta tus pagos en línea",
        "resumen": "Facturas, estados y fechas de pago disponibles las 24 horas." }
    ]
  }
  $j$::jsonb),

  -- BANDA DE PORTALES
  ('banda_portales', 6, $j$
  {
    "items": [
      {
        "rol": "Clientes",
        "titulo": "Tu cuenta, siempre a la mano",
        "beneficios": [
          { "texto": "Estado de cuenta y movimientos" },
          { "texto": "Historial de compras" },
          { "texto": "Cuotas y fechas de descuento" }
        ],
        "url": "/cliente",
        "texto_boton": "Ingresar a mi cuenta"
      },
      {
        "rol": "Proveedores",
        "titulo": "Facturas y pagos en línea",
        "beneficios": [
          { "texto": "Estado de tus facturas" },
          { "texto": "Detalle y calendario de pagos" },
          { "texto": "Constancias y comprobantes" }
        ],
        "url": "/proveedor",
        "texto_boton": "Ingresar como proveedor"
      }
    ]
  }
  $j$::jsonb)

) AS v(tipo, orden, contenido)
JOIN paginas      p  ON p.slug = 'inicio'
JOIN tipos_bloque tb ON tb.codigo = v.tipo;

-- ----------------------------------------------------------------------------
-- 3. Menú definitivo (reemplazo completo)
--    Enlaces de ancla a las secciones de la portada (los componentes de bloque
--    exponen ids: #ofertas, #tiendas, #concesionarios, #noticias). El acceso a
--    los portales vive en el topbar del header y en la banda de portales.
-- ----------------------------------------------------------------------------
DELETE FROM menu_items;

INSERT INTO menu_items (etiqueta, url, tipo, orden) VALUES
    ('Ofertas',        '/#ofertas',        'contenido', 1),
    ('Tiendas',        '/#tiendas',        'contenido', 2),
    ('Concesionarios', '/#concesionarios', 'contenido', 3),
    ('Noticias',       '/#noticias',       'contenido', 4);

COMMIT;

-- Verificación rápida (solo lectura)
SELECT 'bloques inicio' AS objeto, count(*) AS total
FROM   bloques b JOIN paginas p ON p.id = b.pagina_id
WHERE  p.slug = 'inicio'
UNION ALL
SELECT 'menu_items', count(*) FROM menu_items;
