namespace Cms.Auth.Jwt;

/// <summary>Configuración del emisor de JWT (sección "Jwt" de appsettings).</summary>
public sealed class JwtOptions
{
    public const string Seccion = "Jwt";

    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public string Key { get; set; } = "";
    public int MinutosVigencia { get; set; } = 120;
}
