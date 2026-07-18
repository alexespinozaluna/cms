-- ============================================================================
-- Descripción breve : Modelo de datos del CMS metadata-driven (PostgreSQL)
--                     para portales retail — dominio de contenido
--                     (genérico/parametrizable; primera instancia: TuBazar/BCE)
-- Input             : N/A (script DDL, se ejecuta una sola vez sobre BD vacía)
-- Output            : Tablas tipos_bloque, paginas, bloques, menu_items,
--                     form_respuestas; función fne_vigente; vistas públicas;
--                     índices y datos semilla de tipos de bloque
-- Creado por        : Alex Espinoza
-- Fec Creación      : 17/07/2026
-- Fec Actualización : 17/07/2026
-- Responsable       : Alex Espinoza
-- Motivo            : Creación inicial del modelo CMS
-- Historial         :
--   17/07/2026  Alex Espinoza  Versión inicial
--   17/07/2026  Alex Espinoza  fne_vigente pasa de IMMUTABLE a STABLE;
--                              FK form_respuestas->bloques con ON DELETE RESTRICT
--                              (política: archivar páginas, no borrarlas);
--                              se agrega tipo de bloque banda_portales
--   17/07/2026  Alex Espinoza  Se generaliza la descripción: el CMS es un
--                              producto genérico para retail; la marca de la
--                              instancia vive en configuración, no en código
--   17/07/2026  Alex Espinoza  hero_cartel: nuevo campo 'titulo_resaltado'
--                              (fragmento del título a resaltar en el hero)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. TIPOS_BLOQUE — el corazón metadata-driven
--    Cada fila DEFINE un tipo de bloque y el esquema de sus campos (JSONB).
--    El panel admin lee esquema_campos para pintar el formulario de edición;
--    la API valida bloques.contenido contra este esquema antes de guardar.
-- ----------------------------------------------------------------------------
CREATE TABLE tipos_bloque (
    id              SMALLSERIAL PRIMARY KEY,
    codigo          VARCHAR(50)  NOT NULL UNIQUE,     -- ej. 'grilla_ofertas'
    nombre          VARCHAR(100) NOT NULL,            -- nombre visible en admin
    descripcion     VARCHAR(300),
    esquema_campos  JSONB        NOT NULL,            -- definición de campos
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  tipos_bloque IS 'Metadata: define los tipos de bloque disponibles y el esquema de sus campos';
COMMENT ON COLUMN tipos_bloque.esquema_campos IS 'Arreglo de campos: [{nombre, tipo, etiqueta, requerido, opciones?}]';

-- ----------------------------------------------------------------------------
-- 2. PAGINAS — una fila por página del sitio (reemplaza al archivo .jsp)
-- ----------------------------------------------------------------------------
CREATE TABLE paginas (
    id              SERIAL PRIMARY KEY,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    titulo          VARCHAR(200) NOT NULL,
    descripcion_seo VARCHAR(300),
    plantilla       VARCHAR(50)  NOT NULL DEFAULT 'default',
    estado          VARCHAR(10)  NOT NULL DEFAULT 'borrador'
                    CHECK (estado IN ('borrador','publicado','archivado')),
    vigencia_desde  TIMESTAMPTZ,                      -- NULL = sin límite inferior
    vigencia_hasta  TIMESTAMPTZ,                      -- NULL = sin límite superior
    creado_por      VARCHAR(100) NOT NULL,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- Slugs reservados por rutas de sistema en Next.js (también se valida en la API)
    CONSTRAINT chk_slug_reservado CHECK (
        lower(slug) NOT IN ('registro','login','recuperar','cliente',
                            'proveedor','admin','api')
    ),
    CONSTRAINT chk_vigencia CHECK (
        vigencia_desde IS NULL OR vigencia_hasta IS NULL
        OR vigencia_desde <= vigencia_hasta
    )
);

CREATE INDEX ix_paginas_slug_publicada ON paginas (slug) WHERE estado = 'publicado';

-- ----------------------------------------------------------------------------
-- 3. BLOQUES — el contenido de cada página, ordenado, tipado y con vigencia
--    'contenido' es JSONB cuya forma la dicta tipos_bloque.esquema_campos.
-- ----------------------------------------------------------------------------
CREATE TABLE bloques (
    id              SERIAL PRIMARY KEY,
    pagina_id       INT NOT NULL REFERENCES paginas (id) ON DELETE CASCADE,
    tipo_bloque_id  SMALLINT NOT NULL REFERENCES tipos_bloque (id),
    orden           SMALLINT NOT NULL DEFAULT 0,
    contenido       JSONB    NOT NULL DEFAULT '{}'::jsonb,
    estado          VARCHAR(10) NOT NULL DEFAULT 'borrador'
                    CHECK (estado IN ('borrador','publicado','archivado')),
    vigencia_desde  TIMESTAMPTZ,
    vigencia_hasta  TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_bloque_vigencia CHECK (
        vigencia_desde IS NULL OR vigencia_hasta IS NULL
        OR vigencia_desde <= vigencia_hasta
    )
);

CREATE INDEX ix_bloques_pagina    ON bloques (pagina_id, orden);
CREATE INDEX ix_bloques_contenido ON bloques USING GIN (contenido);

-- ----------------------------------------------------------------------------
-- 4. MENU_ITEMS — el menú es data; soporta submenús con padre_id
--    tipo: 'contenido' apunta a una página del CMS; 'sistema' a una ruta fija
--    del código (login, portales). El enrutador no distingue: solo usa url.
-- ----------------------------------------------------------------------------
CREATE TABLE menu_items (
    id              SERIAL PRIMARY KEY,
    padre_id        INT REFERENCES menu_items (id) ON DELETE CASCADE,
    etiqueta        VARCHAR(80)  NOT NULL,
    url             VARCHAR(250) NOT NULL,
    tipo            VARCHAR(10)  NOT NULL DEFAULT 'contenido'
                    CHECK (tipo IN ('contenido','sistema')),
    orden           SMALLINT     NOT NULL DEFAULT 0,
    estado          VARCHAR(10)  NOT NULL DEFAULT 'publicado'
                    CHECK (estado IN ('borrador','publicado','archivado')),
    vigencia_desde  TIMESTAMPTZ,
    vigencia_hasta  TIMESTAMPTZ
);

CREATE INDEX ix_menu_orden ON menu_items (padre_id, orden);

-- ----------------------------------------------------------------------------
-- 5. FORM_RESPUESTAS — respuestas de formularios dinámicos (bloques tipo 'formulario')
-- ----------------------------------------------------------------------------
CREATE TABLE form_respuestas (
    id          BIGSERIAL PRIMARY KEY,
    -- RESTRICT deliberado: las respuestas son datos de personas y no deben
    -- desaparecer por borrar una página. Política: las páginas se ARCHIVAN
    -- (estado='archivado'), no se borran; si de verdad hay que borrar una,
    -- primero exportar/depurar sus respuestas de forma explícita.
    bloque_id   INT NOT NULL REFERENCES bloques (id) ON DELETE RESTRICT,
    datos       JSONB NOT NULL,                       -- {campo: valor} según el form
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_form_respuestas_bloque ON form_respuestas (bloque_id, creado_en DESC);

-- ----------------------------------------------------------------------------
-- 6. fne_vigente — función escalar: ¿está publicado y dentro de vigencia?
--    Centraliza la regla para páginas, bloques y menú.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fne_vigente(
    p_estado  VARCHAR,
    p_desde   TIMESTAMPTZ,
    p_hasta   TIMESTAMPTZ
) RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
    -- STABLE (no IMMUTABLE): usa now(), su resultado es constante dentro de
    -- una consulta pero varía entre consultas. Nunca usarla en índices.
    SELECT p_estado = 'publicado'
       AND (p_desde IS NULL OR p_desde <= now())
       AND (p_hasta IS NULL OR p_hasta >= now());
$$;

-- ----------------------------------------------------------------------------
-- 7. Vistas públicas — lo ÚNICO que consume la Content API pública.
--    Aplican la regla de estado+vigencia en un solo lugar.
-- ----------------------------------------------------------------------------
CREATE VIEW v_paginas_publicas AS
SELECT p.id, p.slug, p.titulo, p.descripcion_seo, p.plantilla
FROM   paginas p
WHERE  fne_vigente(p.estado, p.vigencia_desde, p.vigencia_hasta);

CREATE VIEW v_bloques_publicos AS
SELECT b.id, b.pagina_id, tb.codigo AS tipo, b.orden, b.contenido
FROM   bloques b
JOIN   tipos_bloque tb ON tb.id = b.tipo_bloque_id
WHERE  fne_vigente(b.estado, b.vigencia_desde, b.vigencia_hasta)
AND    tb.activo;

CREATE VIEW v_menu_publico AS
SELECT m.id, m.padre_id, m.etiqueta, m.url, m.tipo, m.orden
FROM   menu_items m
WHERE  fne_vigente(m.estado, m.vigencia_desde, m.vigencia_hasta);

-- ----------------------------------------------------------------------------
-- 8. Datos semilla — tipos de bloque del diseño aprobado
--    (esquema_campos = el "formulario" que el admin verá para cada bloque)
-- ----------------------------------------------------------------------------
INSERT INTO tipos_bloque (codigo, nombre, esquema_campos) VALUES
('hero_cartel', 'Hero con cartel de oferta', '[
  {"nombre":"kicker","tipo":"texto","etiqueta":"Etiqueta superior","requerido":false},
  {"nombre":"titulo","tipo":"texto","etiqueta":"Título","requerido":true},
  {"nombre":"titulo_resaltado","tipo":"texto","etiqueta":"Fragmento del título a resaltar","requerido":false},
  {"nombre":"subtitulo","tipo":"textolargo","etiqueta":"Subtítulo","requerido":false},
  {"nombre":"origen","tipo":"opcion","etiqueta":"Origen de la oferta","requerido":true,"opciones":["manual","erp"]},
  {"nombre":"codigo_producto","tipo":"texto","etiqueta":"Código de producto (ERP)","requerido":false},
  {"nombre":"producto","tipo":"texto","etiqueta":"Producto (manual)","requerido":false},
  {"nombre":"precio","tipo":"decimal","etiqueta":"Precio (manual)","requerido":false},
  {"nombre":"precio_antes","tipo":"decimal","etiqueta":"Precio anterior (manual)","requerido":false}
]'::jsonb),
('grilla_ofertas', 'Grilla de ofertas', '[
  {"nombre":"titulo","tipo":"texto","etiqueta":"Título de sección","requerido":true},
  {"nombre":"origen","tipo":"opcion","etiqueta":"Origen","requerido":true,"opciones":["manual","erp"]},
  {"nombre":"items","tipo":"lista","etiqueta":"Ofertas","requerido":true,
   "campos":[
     {"nombre":"codigo_producto","tipo":"texto","etiqueta":"Código ERP","requerido":false},
     {"nombre":"producto","tipo":"texto","etiqueta":"Producto (manual)","requerido":false},
     {"nombre":"precio","tipo":"decimal","etiqueta":"Precio (manual)","requerido":false},
     {"nombre":"precio_antes","tipo":"decimal","etiqueta":"Precio anterior","requerido":false},
     {"nombre":"etiqueta","tipo":"texto","etiqueta":"Sticker (-32%, 2×1...)","requerido":false},
     {"nombre":"imagen","tipo":"imagen","etiqueta":"Imagen","requerido":false}
   ]}
]'::jsonb),
('lista_tiendas', 'Lista de tiendas', '[
  {"nombre":"titulo","tipo":"texto","etiqueta":"Título de sección","requerido":true},
  {"nombre":"items","tipo":"lista","etiqueta":"Tiendas","requerido":true,
   "campos":[
     {"nombre":"nombre","tipo":"texto","etiqueta":"Nombre","requerido":true},
     {"nombre":"ubicacion","tipo":"texto","etiqueta":"Ubicación","requerido":true},
     {"nombre":"horario","tipo":"texto","etiqueta":"Horario","requerido":false},
     {"nombre":"telefono","tipo":"texto","etiqueta":"Teléfono","requerido":false}
   ]}
]'::jsonb),
('grilla_concesionarios', 'Grilla de concesionarios', '[
  {"nombre":"titulo","tipo":"texto","etiqueta":"Título de sección","requerido":true},
  {"nombre":"items","tipo":"lista","etiqueta":"Concesionarios","requerido":true,
   "campos":[
     {"nombre":"nombre","tipo":"texto","etiqueta":"Nombre","requerido":true},
     {"nombre":"rubro","tipo":"texto","etiqueta":"Rubro","requerido":false},
     {"nombre":"logo","tipo":"imagen","etiqueta":"Logo","requerido":false}
   ]}
]'::jsonb),
('grilla_noticias', 'Grilla de noticias', '[
  {"nombre":"titulo","tipo":"texto","etiqueta":"Título de sección","requerido":true},
  {"nombre":"items","tipo":"lista","etiqueta":"Noticias","requerido":true,
   "campos":[
     {"nombre":"fecha","tipo":"fecha","etiqueta":"Fecha","requerido":true},
     {"nombre":"titulo","tipo":"texto","etiqueta":"Titular","requerido":true},
     {"nombre":"resumen","tipo":"textolargo","etiqueta":"Resumen","requerido":false},
     {"nombre":"imagen","tipo":"imagen","etiqueta":"Imagen","requerido":false},
     {"nombre":"enlace","tipo":"texto","etiqueta":"Enlace (slug o URL)","requerido":false}
   ]}
]'::jsonb),
('banda_portales', 'Banda de acceso a portales', '[
  {"nombre":"items","tipo":"lista","etiqueta":"Tarjetas de portal","requerido":true,
   "campos":[
     {"nombre":"rol","tipo":"texto","etiqueta":"Rol (Clientes/Proveedores)","requerido":true},
     {"nombre":"titulo","tipo":"texto","etiqueta":"Título","requerido":true},
     {"nombre":"beneficios","tipo":"lista","etiqueta":"Lista de beneficios","requerido":false,
      "campos":[{"nombre":"texto","tipo":"texto","etiqueta":"Beneficio","requerido":true}]},
     {"nombre":"url","tipo":"texto","etiqueta":"URL del portal (ruta de sistema)","requerido":true},
     {"nombre":"texto_boton","tipo":"texto","etiqueta":"Texto del botón","requerido":true}
   ]}
]'::jsonb),
('texto_rico', 'Texto libre (HTML/Markdown)', '[
  {"nombre":"contenido","tipo":"richtext","etiqueta":"Contenido","requerido":true}
]'::jsonb),
('formulario', 'Formulario dinámico', '[
  {"nombre":"titulo","tipo":"texto","etiqueta":"Título","requerido":false},
  {"nombre":"destino_correo","tipo":"texto","etiqueta":"Correo de notificación","requerido":false},
  {"nombre":"campos","tipo":"lista","etiqueta":"Campos del formulario","requerido":true,
   "campos":[
     {"nombre":"nombre","tipo":"texto","etiqueta":"Nombre interno","requerido":true},
     {"nombre":"etiqueta","tipo":"texto","etiqueta":"Etiqueta visible","requerido":true},
     {"nombre":"tipo","tipo":"opcion","etiqueta":"Tipo","requerido":true,
      "opciones":["texto","textolargo","numero","fecha","opcion","correo"]},
     {"nombre":"requerido","tipo":"booleano","etiqueta":"¿Requerido?","requerido":true}
   ]}
]'::jsonb);

COMMIT;
