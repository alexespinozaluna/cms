using System.Text.Json;

namespace Cms.Content.Dtos;

/// <summary>Página publicada y vigente (proyección de v_paginas_publicas).</summary>
public sealed class PaginaPublicaDto
{
    public int Id { get; init; }
    public string Slug { get; init; } = string.Empty;
    public string Titulo { get; init; } = string.Empty;
    public string? DescripcionSeo { get; init; }
    public string Plantilla { get; init; } = "default";
}

/// <summary>Página con sus bloques listos para renderizar en el catch-all de Next.js.</summary>
public sealed class PaginaDetalleDto
{
    public string Slug { get; init; } = string.Empty;
    public string Titulo { get; init; } = string.Empty;
    public string? DescripcionSeo { get; init; }
    public string Plantilla { get; init; } = "default";
    public IReadOnlyList<BloquePublicoDto> Bloques { get; init; } = [];
}

/// <summary>Bloque publicado y vigente (proyección de v_bloques_publicos).</summary>
public sealed class BloquePublicoDto
{
    public int Id { get; init; }

    /// <summary>Código del tipo de bloque (ej. 'grilla_ofertas'); el frontend elige el componente con esto.</summary>
    public string Tipo { get; init; } = string.Empty;

    public int Orden { get; init; }

    /// <summary>JSONB del bloque tal cual; su forma la dicta tipos_bloque.esquema_campos.</summary>
    public JsonElement Contenido { get; init; }
}

/// <summary>Ítem de menú publicado y vigente, con sus hijos (submenú).</summary>
public sealed class MenuItemPublicoDto
{
    public int Id { get; init; }
    public string Etiqueta { get; init; } = string.Empty;
    public string Url { get; init; } = string.Empty;

    /// <summary>'contenido' = página del CMS; 'sistema' = ruta fija del código. El enrutador solo usa Url.</summary>
    public string Tipo { get; init; } = "contenido";

    public int Orden { get; init; }
    public List<MenuItemPublicoDto> Hijos { get; init; } = [];
}
