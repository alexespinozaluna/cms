using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cms.Auth.Modelo;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Cms.Auth.Jwt;

public interface IGeneradorJwt
{
    (string token, DateTime expira) Generar(Usuario usuario, IEnumerable<string> roles);
}

public sealed class GeneradorJwt(IOptions<JwtOptions> opciones) : IGeneradorJwt
{
    private readonly JwtOptions _o = opciones.Value;

    public (string token, DateTime expira) Generar(Usuario usuario, IEnumerable<string> roles)
    {
        var expira = DateTime.UtcNow.AddMinutes(_o.MinutosVigencia);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id),
            new(JwtRegisteredClaimNames.Email, usuario.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        if (!string.IsNullOrEmpty(usuario.CodigoClienteErp))
            claims.Add(new Claim("codigo_cliente_erp", usuario.CodigoClienteErp));
        if (!string.IsNullOrEmpty(usuario.CodigoProveedor))
            claims.Add(new Claim("codigo_proveedor", usuario.CodigoProveedor));
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var credenciales = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_o.Key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _o.Issuer,
            audience: _o.Audience,
            claims: claims,
            expires: expira,
            signingCredentials: credenciales);

        return (new JwtSecurityTokenHandler().WriteToken(token), expira);
    }
}
