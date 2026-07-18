namespace Cms.Erp.Personas;

/// <summary>Criterio de búsqueda del SP genérico (coincide con @Tipo).</summary>
public enum TipoDocumentoBusqueda
{
    /// <summary>Busca por CIP o DNI.</summary>
    Ambos = 0,
    /// <summary>Busca solo por DNI (Documento).</summary>
    Dni = 1,
    /// <summary>Busca solo por CIP (CodAnexo).</summary>
    Cip = 2,
}
