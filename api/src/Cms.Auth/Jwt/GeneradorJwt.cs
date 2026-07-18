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
            new(JwtRegisteredClaimNames.UniqueName, usuario.UserName ?? ""),
            new(JwtRegisteredClaimNames.Email, usuario.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        if (usuario.IdUserRef is int idUserRef && idUserRef > 0)
            claims.Add(new Claim("id_user_ref", idUserRef.ToString()));
        if (!string.IsNullOrEmpty(usuario.CodUsuario))
            claims.Add(new Claim("cod_usuario", usuario.CodUsuario));
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
