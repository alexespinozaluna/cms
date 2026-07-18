import Link from "next/link";
import AuthShell from "@/app/components/auth/AuthShell";

/** Placeholder: el restablecimiento por correo llega con el servicio de correo. */
export default function RecuperarPage() {
  return (
    <AuthShell titulo="Recuperar contraseña">
      <p className="text-sm text-texto/80">
        El restablecimiento de contraseña por correo estará disponible próximamente. Mientras
        tanto, comunícate con la administración del bazar para recuperar tu acceso.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm text-verde hover:underline">
        Volver a iniciar sesión
      </Link>
    </AuthShell>
  );
}
