using Cms.Content;

var builder = WebApplication.CreateBuilder(args);

// Dominio de contenido (CMS PostgreSQL vía Dapper)
var cadenaCms = builder.Configuration.GetConnectionString("CmsDb")
    ?? throw new InvalidOperationException("Falta la cadena de conexión 'CmsDb'.");
builder.Services.AddDominioContenido(cadenaCms);

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
app.MapControllers();

// Sondeo de salud para IIS/ARR
app.MapGet("/health", () => Results.Ok(new { estado = "ok" }));

app.Run();
