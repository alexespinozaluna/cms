namespace Cms.Auth.Modelo;

/// <summary>Roles del portal (CLAUDE.md §4).</summary>
public static class Roles
{
    public const string Cliente = "Cliente";
    public const string Proveedor = "Proveedor";
    public const string Editor = "Editor";
    public const string Admin = "Admin";

    public static readonly string[] Todos = [Cliente, Proveedor, Editor, Admin];
}
