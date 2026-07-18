"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registroSchema, type RegistroInput, registrar, guardarSesion, AuthError } from "@/lib/auth";
import AuthShell from "@/app/components/auth/AuthShell";
import CampoTexto from "@/app/components/auth/CampoTexto";

export default function RegistroPage() {
  const router = useRouter();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroInput>({ resolver: zodResolver(registroSchema) });

  async function onSubmit(data: RegistroInput) {
    setErrorGeneral(null);
    try {
      guardarSesion(await registrar(data));
      router.push("/");
      router.refresh();
    } catch (e) {
      setErrorGeneral(e instanceof AuthError ? e.message : "No se pudo completar el registro.");
    }
  }

  return (
    <AuthShell
      titulo="Crear cuenta"
      subtitulo="Solo el personal registrado en el bazar (cliente, proveedor, concesionario o trabajador) puede crear una cuenta. Verificamos tu CIP/DNI."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errorGeneral && (
          <p className="rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{errorGeneral}</p>
        )}
        <CampoTexto
          id="documento"
          inputMode="numeric"
          etiqueta="CIP o DNI"
          error={errors.documento?.message}
          {...register("documento")}
        />
        <CampoTexto
          id="nombreCompleto"
          etiqueta="Nombre completo (opcional)"
          error={errors.nombreCompleto?.message}
          {...register("nombreCompleto")}
        />
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
