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
  TIPO_DNI,
  TIPO_CIP,
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
    formState: { errors, isSubmitting },
  } = useForm<RegistroInput>({
    resolver: zodResolver(registroSchema),
    defaultValues: { tipo: String(TIPO_DNI) as RegistroInput["tipo"] },
  });

  // Si cambian el tipo o el documento, hay que volver a verificar.
  const tipoW = watch("tipo");
  const docW = watch("documento");
  useEffect(() => {
    setVerificado(null);
    setErrorVerif(null);
  }, [tipoW, docW]);

  async function verificar() {
    setErrorVerif(null);
    if (!(await trigger(["tipo", "documento"]))) return;
    setVerificando(true);
    try {
      setVerificado(await verificarDocumento(getValues("documento"), Number(getValues("tipo"))));
    } catch (e) {
      setVerificado(null);
      setErrorVerif(e instanceof AuthError ? e.message : "No se pudo verificar el documento.");
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
          documento: data.documento,
          tipo: Number(data.tipo),
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
      subtitulo="Solo el personal registrado en el bazar (cliente, proveedor, concesionario o trabajador) puede crear una cuenta. Verificamos tu documento en el ERP."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Fase 1: tipo de documento + número + verificar */}
        <div>
          <label htmlFor="tipo" className="mb-1 block text-sm font-semibold text-verde-osc">
            Tipo de documento
          </label>
          <select
            id="tipo"
            className="w-full rounded-lg border border-linea bg-white px-3 py-2 text-sm focus:border-verde focus:outline-none"
            {...register("tipo")}
          >
            <option value={TIPO_DNI}>DNI</option>
            <option value={TIPO_CIP}>CIP</option>
          </select>
          {errors.tipo && <p className="mt-1 text-xs text-rojo">{errors.tipo.message}</p>}
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <CampoTexto
              id="documento"
              inputMode="numeric"
              etiqueta="Número de documento"
              error={errors.documento?.message}
              {...register("documento")}
            />
          </div>
          <button
            type="button"
            onClick={verificar}
            disabled={verificando}
            className="mb-[1px] shrink-0 rounded-lg border-2 border-verde px-4 py-2 text-sm font-bold text-verde hover:bg-papel disabled:opacity-60"
          >
            {verificando ? "Verificando…" : "Verificar"}
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
              disabled={isSubmitting}
              className="w-full rounded-lg bg-rojo px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
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
