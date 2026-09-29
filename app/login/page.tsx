"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError(response.status === 401 ? "Usuario o contraseña incorrectos." : "No se pudo iniciar sesión. Inténtalo de nuevo.");
        return;
      }

      router.replace("/player");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#111713] px-5 py-12 text-[#f2f0e8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(165,214,92,0.14),transparent_38%),linear-gradient(135deg,#111713_0%,#17241d_58%,#101411_100%)]" />
      <section className="relative w-full max-w-md">
        <div className="mb-12 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#b8e36b] text-xl text-[#172018]" aria-hidden="true">♫</span>
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Frecuencia</span>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#b8e36b]">Tu espacio, tu música</p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Vuelve a escuchar.</h1>
        <p className="mt-4 text-base text-[#a9b1aa]">Inicia sesión para entrar a tu reproductor.</p>

        <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-[#e4e8e1]">
            Usuario
            <input
              autoComplete="username"
              className="mt-2 h-12 w-full rounded-lg border border-[#39463d] bg-[#1a231d] px-4 text-base text-white outline-none transition placeholder:text-[#748078] focus:border-[#b8e36b] focus:ring-2 focus:ring-[#b8e36b]/20"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              required
              value={username}
            />
          </label>
          <label className="block text-sm font-medium text-[#e4e8e1]">
            Contraseña
            <input
              autoComplete="current-password"
              className="mt-2 h-12 w-full rounded-lg border border-[#39463d] bg-[#1a231d] px-4 text-base text-white outline-none transition placeholder:text-[#748078] focus:border-[#b8e36b] focus:ring-2 focus:ring-[#b8e36b]/20"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && <p className="text-sm text-[#ff9e8c]" role="alert">{error}</p>}
          <button
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#b8e36b] px-5 font-semibold text-[#172018] transition hover:bg-[#caef86] disabled:cursor-wait disabled:opacity-70"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </main>
  );
}