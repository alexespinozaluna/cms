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
--   17/07/2026  Alex Espinoza  Hero con 'titulo_resaltado'; se agrega ese campo
--                              al esquema de hero_cartel; páginas legales
--                              (términos, libro de reclamaciones) para el footer.
--   17/07/2026  Alex Espinoza  Datos reales de tiendas (8) y concesionarios
--                              (selección por rubro) desde los Excel de la
--                              instancia (docs/Tiendas, docs/Concesionario).
--   18/07/2026  Alex Espinoza  Login único: los CTA de la banda de portales
--                              apuntan a /login (un solo acceso).
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
    "titulo_resaltado": "ahora en línea",
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
          {
              "nombre": "Tienda N° 01",
              "ubicacion": "Av. Escuela Militar S/N Villa Militar Oeste (Villa Militar) Lima Lima Chorrillos",
              "horario": "Lun - Dom: 07:00 am a 22:00 pm",
              "telefono": "644-9284 Anexo 301"
          },
          {
              "nombre": "Tienda N° 02",
              "ubicacion": "Av. Prolg. Paseo La Republica S/N Villa Militar Matellini (Alt.De Metro) Lima Lima Chorrillos",
              "horario": "Lun - Dom: 07:00 am a 22:00 pm",
              "telefono": "644-9284 Anexo 302"
          },
          {
              "nombre": "Tienda N° 03",
              "ubicacion": "Av. Escuela Militar S/N Villa Militar Este (Villa Militar) Lima Lima Chorrillos",
              "horario": "Lun - Dom: 07:00 am a 22:00 pm",
              "telefono": "644-9284 Anexo 303"
          },
          {
              "nombre": "Tienda N° 04",
              "ubicacion": "Cal. Escuela Militar 222 (Espalda Del Caem) Lima Lima Chorrillos",
              "horario": "Lun - Sab: 07:00 am a 22:00 pm",
              "telefono": "644-9284 Anexo 304"
          },
          {
              "nombre": "Tienda N° 06",
              "ubicacion": "Jr. General Recavarren Nº 1300 Tda 2 Urb. Limatambo - Surquillo",
              "horario": "Lun - Dom: 07:00 am a 21:00 pm",
              "telefono": "644-9284 Anexo 306"
          },
          {
              "nombre": "Tienda N° 07",
              "ubicacion": "Av. Chorrillos Cuadra 2 Nro. S/N (Costado De La Clinica Maison De Sante)",
              "horario": "Lun - Dom: 07:00 am a 22:00 pm",
              "telefono": "644-9284 Anexo 307"
          },
          {
              "nombre": "Tienda N° 08",
              "ubicacion": "Av. Boulevar S/N Cuartel General (Cuartel General Del Ejercito) Lima Lima San Borja",
              "horario": "Lun - Dom: 07:00 am a 21:00 pm",
              "telefono": "644-9284 Anexo 300"
          },
          {
              "nombre": "Tienda N° 10",
              "ubicacion": "Av. Tupac Amaru S/N Entrada Al Cuartel Hoyos Rubio - Rimac",
              "horario": "Lun - Dom: 07:00 am a 21:00 pm",
              "telefono": "644-9284 Anexo 309"
          }
      ]
  }
  $j$::jsonb),

  -- CONCESIONARIOS (datos reales; sin logo se muestran iniciales de respaldo)
  ('grilla_concesionarios', 4, $j$
  {
      "titulo": "Concesionarios",
      "items": [
          {
              "nombre": "Soto Brito, Erick Ferrer",
              "rubro": "Abarrotes"
          },
          {
              "nombre": "Armeria Charles X Tactical",
              "rubro": "Armas Y Accesorios"
          },
          {
              "nombre": "Advanced Net S.A.C.",
              "rubro": "Artefactos"
          },
          {
              "nombre": "B.Hogar Center S.A.C.",
              "rubro": "Articulos Para El Hogar"
          },
          {
              "nombre": "Bm Eventos Productora Eirl",
              "rubro": "Articulos Para Eventos Especiales"
          },
          {
              "nombre": "Bobadilla Chumacero, Mariza Angelica",
              "rubro": "Belleza Y Cuidado Personal"
          },
          {
              "nombre": "Nacarino Mendez, Susan Veronica",
              "rubro": "Boutique"
          },
          {
              "nombre": "Vallas Y Gigantografias De Peru S.A",
              "rubro": "Comunicaciones"
          }
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
        "url": "/login",
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
        "url": "/login",
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

-- ----------------------------------------------------------------------------
-- 4. Metadata: se agrega el campo 'titulo_resaltado' al esquema de hero_cartel
--    (idempotente; el modelo base también lo incluye para instalaciones nuevas).
-- ----------------------------------------------------------------------------
UPDATE tipos_bloque
SET esquema_campos = esquema_campos ||
    '[{"nombre":"titulo_resaltado","tipo":"texto","etiqueta":"Fragmento del título a resaltar","requerido":false}]'::jsonb
WHERE codigo = 'hero_cartel'
  AND NOT (esquema_campos @> '[{"nombre":"titulo_resaltado"}]'::jsonb);

-- ----------------------------------------------------------------------------
-- 5. Páginas legales enlazadas desde el footer (contenido texto_rico).
--    Evitan enlaces muertos y ejercitan el catch-all con páginas secundarias.
-- ----------------------------------------------------------------------------
INSERT INTO paginas (slug, titulo, descripcion_seo, plantilla, estado, creado_por) VALUES
    ('terminos-y-condiciones', 'Términos y condiciones',
     'Términos y condiciones de uso del portal TuBazar.', 'default', 'publicado', 'Alex Espinoza'),
    ('libro-de-reclamaciones', 'Libro de reclamaciones',
     'Libro de reclamaciones del portal TuBazar.', 'default', 'publicado', 'Alex Espinoza')
ON CONFLICT (slug) DO UPDATE
SET titulo = EXCLUDED.titulo, estado = 'publicado', actualizado_en = now();

DELETE FROM bloques
WHERE pagina_id IN (SELECT id FROM paginas WHERE slug IN ('terminos-y-condiciones','libro-de-reclamaciones'));

INSERT INTO bloques (pagina_id, tipo_bloque_id, orden, contenido, estado)
SELECT p.id, tb.id, 1, v.contenido, 'publicado'
FROM (VALUES
  ('terminos-y-condiciones', $j$
  {"contenido": "<h2>Términos y condiciones</h2><p>Contenido preliminar. El texto legal definitivo será provisto por la administración de TuBazar y editado desde el CMS.</p>"}
  $j$::jsonb),
  ('libro-de-reclamaciones', $j$
  {"contenido": "<h2>Libro de reclamaciones</h2><p>Contenido preliminar. Aquí irá el acceso al libro de reclamaciones conforme a la normativa vigente, gestionado desde el CMS.</p>"}
  $j$::jsonb)
) AS v(slug, contenido)
JOIN paginas      p  ON p.slug = v.slug
JOIN tipos_bloque tb ON tb.codigo = 'texto_rico';

COMMIT;

-- Verificación rápida (solo lectura)
SELECT 'bloques inicio' AS objeto, count(*) AS total
FROM   bloques b JOIN paginas p ON p.id = b.pagina_id
WHERE  p.slug = 'inicio'
UNION ALL
SELECT 'menu_items', count(*) FROM menu_items
UNION ALL
SELECT 'paginas publicadas', count(*) FROM paginas WHERE estado = 'publicado';
