using Cms.Auth;
using Cms.Content;
using Cms.Erp;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Dominio de contenido (CMS PostgreSQL vía Dapper)
var cadenaCms = builder.Configuration.GetConnectionString("CmsDb")
    ?? throw new InvalidOperationException("Falta la cadena de conexión 'CmsDb'.");
builder.Services.AddDominioContenido(cadenaCms);

// Identidad (EF Core + Identity, esquema auth) y acceso al ERP (validación CIP/DNI)
builder.Services.AddDominioAuth(cadenaCms, builder.Configuration);
builder.Services.AddDominioErp();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// El frontend Next.js consume la API desde otro origen en desarrollo
builder.Services.AddCors(opciones =>
    opciones.AddPolicy("Frontend", politica => politica
        .WithOrigins(builder.Configuration.GetSection("Cors:Origenes").Get<string[]>() ?? [])
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

// Imágenes/banners del CMS (fase 1): carpeta física servida en /media.
// La ruta es configurable por instancia (Media:Ruta); relativa al content root.
var rutaMedia = Path.GetFullPath(
    app.Configuration["Media:Ruta"] ?? "media", app.Environment.ContentRootPath);
Directory.CreateDirectory(rutaMedia);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(rutaMedia),
    RequestPath = "/media"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Sondeo de salud para IIS/ARR
app.MapGet("/health", () => Results.Ok(new { estado = "ok" }));

// Migraciones de Identity + roles base al arrancar
await app.Services.PrepararAuthAsync();

app.Run();
