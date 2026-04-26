"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha incorretos.");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0e0718" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-3xl"
        style={{
          background: "#1a0d22",
          border: "1px solid rgba(126,86,134,0.4)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="mb-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(126,86,134,0.25)", border: "1px solid rgba(126,86,134,0.4)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "#f8a13f" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" style={{ color: "#e8f9a2" }}>
            Área administrativa
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(165,170,217,0.6)" }}>
            Acesso restrito a administradores
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "rgba(165,170,217,0.6)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(126,86,134,0.1)",
                border: "1px solid rgba(126,86,134,0.35)",
                color: "#e8f9a2",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#7e5686"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(126,86,134,0.35)"; }}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "rgba(165,170,217,0.6)" }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(126,86,134,0.1)",
                border: "1px solid rgba(126,86,134,0.35)",
                color: "#e8f9a2",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#7e5686"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(126,86,134,0.35)"; }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              className="text-sm px-4 py-3 rounded-xl"
              style={{ background: "rgba(186,60,61,0.15)", color: "#ba3c3d", border: "1px solid rgba(186,60,61,0.3)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#7e5686", color: "#e8f9a2" }}
            onMouseOver={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#9a6aa4"; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "#7e5686"; }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs transition-colors"
            style={{ color: "rgba(165,170,217,0.45)" }}
          >
            ← Voltar ao calendário
          </Link>
        </div>
      </div>
    </div>
  );
}
