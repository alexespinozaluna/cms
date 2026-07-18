import { forwardRef } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  error?: string;
};

/** Campo de formulario reutilizable (compatible con register de react-hook-form). */
const CampoTexto = forwardRef<HTMLInputElement, Props>(function CampoTexto(
  { etiqueta, error, id, ...rest },
  ref,
) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-verde-osc">
        {etiqueta}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        className="w-full rounded-lg border border-linea bg-white px-3 py-2 text-sm focus:border-verde focus:outline-none aria-[invalid=true]:border-rojo"
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-rojo">{error}</p>}
    </div>
  );
});

export default CampoTexto;
