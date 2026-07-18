namespace Cms.Auth.Modelo;

/// <summary>Roles del portal. Los derivados del ERP se sincronizan en cada login.</summary>
public static class Roles
{
    // Derivados de los flags del ERP (Anexo)
    public const string Cliente = "Cliente";
    public const string Proveedor = "Proveedor";
    public const string Concesionario = "Concesionario";
    public const string Trabajador = "Trabajador";

    // Roles internos del CMS (no vienen del ERP)
    public const string Editor = "Editor";
    public const string Admin = "Admin";

    /// <summary>Roles que se resuelven contra los flags del ERP.</summary>
    public static readonly string[] DerivadosErp = [Cliente, Proveedor, Concesionario, Trabajador];

    public static readonly string[] Todos = [Cliente, Proveedor, Concesionario, Trabajador, Editor, Admin];

    /// <summary>Matriz opción → roles que la ven (constantes para [Authorize(Roles=...)]).</summary>
    public static class Ven
    {
        public const string EstadoCuenta = Cliente;
        public const string MisCompras = Cliente + "," + Proveedor + "," + Trabajador;
        public const string MisFacturas = Proveedor;
        public const string BoletaPago = Trabajador;
        public const string LiquidacionPagos = Concesionario;
    }
}
