"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  registroSchema,
  type RegistroInput,
  type Verificacion,
  verificarDocumento,
  registrar,
  guardarSesion,
  AuthError,
} from "@/lib/auth";
import AuthShell from "@/app/components/auth/AuthShell";
import CampoTexto from "@/app/components/auth/CampoTexto";

export default function RegistroPage() {
  const router = useRouter();
  const [verificado, setVerificado] = useState<Verificacion | null>(null);
  const [errorVerif, setErrorVerif] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const enviando = useRef(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegistroInput>({
    resolver: zodResolver(registroSchema),
    mode: "onChange", // habilita/inhabilita "Crear cuenta" según validez en vivo
  });

  // Si cambia el CodUsuario, hay que volver a verificar.
  const codW = watch("codUsuario");
  useEffect(() => {
    setVerificado(null);
    setErrorVerif(null);
  }, [codW]);

  async function verificar() {
    setErrorVerif(null);
    if (!(await trigger("codUsuario"))) return;
    setVerificando(true);
    try {
      setVerificado(await verificarDocumento(getValues("codUsuario")));
    } catch (e) {
      setVerificado(null);
      setErrorVerif(e instanceof AuthError ? e.message : "No se pudo verificar el código de usuario.");
    } finally {
      setVerificando(false);
    }
  }

  async function onSubmit(data: RegistroInput) {
    if (!verificado || enviando.current) return; // guarda anti doble-envío
    enviando.current = true;
    setErrorGeneral(null);
    try {
      guardarSesion(
        await registrar({
          codUsuario: data.codUsuario,
          correo: data.correo,
          telefono: data.telefono || undefined,
          password: data.password,
          nombreCompleto: verificado.nombre,
        }),
      );
      router.push("/portal");
      router.refresh();
    } catch (e) {
      setErrorGeneral(e instanceof AuthError ? e.message : "No se pudo crear la cuenta.");
    } finally {
      enviando.current = false;
    }
  }

  return (
    <AuthShell
      titulo="Crear cuenta"
      subtitulo="Solo el personal registrado en el bazar (cliente, proveedor, concesionario o trabajador) puede crear una cuenta. Verificamos tu código de usuario (CIP) en el ERP."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Fase 1: CodUsuario + verificar (el botón se bloquea al validar) */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <CampoTexto
              id="codUsuario"
              inputMode="numeric"
              etiqueta="Código de usuario (CIP)"
              error={errors.codUsuario?.message}
              {...register("codUsuario")}
            />
          </div>
          <button
            type="button"
            onClick={verificar}
            disabled={verificando || !!verificado}
            className="mb-[1px] shrink-0 rounded-lg border-2 border-verde px-4 py-2 text-sm font-bold text-verde hover:bg-papel disabled:opacity-60"
          >
            {verificado ? "Verificado" : verificando ? "Verificando…" : "Verificar"}
          </button>
        </div>
        {errorVerif && <p className="rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{errorVerif}</p>}

        {/* Fase 2: solo cuando la persona existe en el ERP y no está registrada */}
        {verificado && (
          <>
            <div className="rounded-md border border-verde/30 bg-verde/5 px-3 py-2">
              <p className="text-sm text-verde-osc">
                <span className="font-semibold">Titular:</span> {verificado.nombre}
              </p>
              {verificado.roles.length > 0 && (
                <p className="mt-1 text-xs text-texto/60">Roles: {verificado.roles.join(", ")}</p>
              )}
            </div>

            {errorGeneral && (
              <p className="rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{errorGeneral}</p>
            )}
            <CampoTexto
              id="correo"
              type="email"
              autoComplete="email"
              etiqueta="Correo"
              error={errors.correo?.message}
              {...register("correo")}
            />
            <CampoTexto
              id="telefono"
              inputMode="tel"
              autoComplete="tel"
              etiqueta="Teléfono (opcional)"
              error={errors.telefono?.message}
              {...register("telefono")}
            />
            <CampoTexto
              id="password"
              type="password"
              autoComplete="new-password"
              etiqueta="Contraseña"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full rounded-lg bg-rojo px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </>
        )}
      </form>

      <p className="mt-5 text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-verde hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
