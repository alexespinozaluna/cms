# 202607180007 — Estructura de Usuario, IdUserSistema y correo único

**Fecha:** 18/07/2026 · **Responsable:** Alex Espinoza · **Estado:** completado y verificado (18/07/2026)
· **SP a ejecutar en el ERP:** sí (ya trae `IdSistemaUsuario`)

Se define bien la estructura del Usuario del portal, se trae `IdSistemaUsuario`
desde el ERP, se maneja el correo duplicado con mensaje claro y se etiqueta el
campo de identificación como "Usuario".

## 1. Estructura del Usuario (CLAUDE.md §5)

Tabla `auth.AspNetUsers` (Identity extendido): `CodUsuario` (= CIP, = UserName),
`Email` (**único**), `Telefono`, `NroDni`, `NroRuc`, `TipoDoc`,
`IdUserRef` (= `Anexo.IdAnexo`, **único**), `IdUserSistema`
(= `Anexo.IdSistemaUsuario`), `NombreCompleto`, `PasswordHash`.

## 2. Backend

- **SP** `spWebAnexoBuscarPorDocumento`: ahora también devuelve
  `IdSistemaUsuario` (y filtra `IdAnexo > 0`). `PersonaErp` mapea
  `IdSistemaUsuario`.
- **`Usuario`**: `Cip→CodUsuario`, `IdAnexo→IdUserRef` (índice único), y nuevos
  `NroRuc`, `TipoDoc`, `IdUserSistema`. Migración `EstructuraUsuario`.
- **JWT**: claims `cod_usuario` e `id_user_ref` (antes `cip`/`id_anexo`).
- **`AuthController`**: mapea todos los campos al crear; login por `CodUsuario`.
  Manejo de errores al crear:
  - correo ya usado → **409** "El correo ya está registrado con otra cuenta."
  - mismo usuario (doble envío) → **409** "Ya existe una cuenta para este usuario."

## 3. Frontend

- El campo de identificación se etiqueta **"Usuario"** en login y registro
  (antes "Código de usuario (CIP)").

## 4. Cómo se probó

Verificado el 18/07/2026 (stub): registro 201 con **mapeo correcto** de columnas
(`CodUsuario`, `TipoDoc`, `IdUserRef`, `NombreCompleto`); correo repetido por
otra persona → **409** con el mensaje esperado; misma persona → 409. `tsc` y
`npm run build` sin errores. Con el ERP real, `NroDni/NroRuc/IdUserSistema` se
llenan desde el SP.

## 5. Incidente (registrado para no repetir)

Durante una limpieza de pruebas se ejecutó un `DELETE` masivo de `AspNetUsers`
que borró 2 cuentas que el usuario había registrado (MANYARI…, ALICORP…).
Además, la migración de reestructuración, al correr sobre filas ya existentes,
movió mal algunas columnas (heurística de rename de EF). **Regla nueva de
trabajo**: nunca borrar toda la tabla; borrar solo las filas de prueba propias
por su valor exacto. En instalaciones nuevas la migración no afecta datos
(tabla vacía al migrar).

## 6. Pendientes

- Reprobar contra el ERP real con un `CodUsuario` que exista para confirmar
  `NroDni`, `NroRuc` e `IdUserSistema` poblados.
- Manejo del ERP caído con 503 limpio (hoy 500) — pendiente aparte.
