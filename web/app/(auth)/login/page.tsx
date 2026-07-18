"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput, login, guardarSesion, AuthError } from "@/lib/auth";
import AuthShell from "@/app/components/auth/AuthShell";
import CampoTexto from "@/app/components/auth/CampoTexto";

export default function LoginPage() {
  const router = useRouter();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setErrorGeneral(null);
    try {
      guardarSesion(await login(data));
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next && next.startsWith("/") ? next : "/portal");
      router.refresh();
    } catch (e) {
      setErrorGeneral(e instanceof AuthError ? e.message : "No se pudo iniciar sesión.");
    }
  }

  return (
    <AuthShell titulo="Iniciar sesión" subtitulo="Ingresa con tu usuario y tu contraseña.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {errorGeneral && (
          <p className="rounded-md bg-rojo/10 px-3 py-2 text-sm text-rojo">{errorGeneral}</p>
        )}
        <CampoTexto
          id="codUsuario"
          inputMode="numeric"
          autoComplete="username"
          etiqueta="Usuario"
          error={errors.codUsuario?.message}
          {...register("codUsuario")}
        />
        <CampoTexto
          id="password"
          type="password"
          autoComplete="current-password"
          etiqueta="Contraseña"
          error={errors.password?.message}
          {...register("password")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-rojo px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
      <div className="mt-5 flex justify-between text-sm">
        <Link href="/registro" className="text-verde hover:underline">
          Crear cuenta
        </Link>
        <Link href="/recuperar" className="text-verde hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </AuthShell>
  );
}
