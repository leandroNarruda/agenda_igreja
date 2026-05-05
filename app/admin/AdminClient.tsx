"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import Calendar from "@/components/Calendar";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

function SchedulingLimitPanel() {
  const { data: currentLimit } = useSettings();
  const updateSettings = useUpdateSettings();
  const [limit, setLimit] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentLimit) setLimit(currentLimit);
  }, [currentLimit]);

  function handleSave() {
    updateSettings.mutate(limit || "", {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  }

  const saving = updateSettings.isPending;

  return (
    <div
      className="w-full max-w-sm mb-6 px-5 py-4 rounded-2xl"
      style={{ background: "rgba(186,60,61,0.08)", border: "1px solid rgba(186,60,61,0.25)" }}
    >
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(186,60,61,0.8)" }}>
        ✦ Limite de agendamento
      </p>
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: "rgba(126,86,134,0.1)",
            border: "1px solid rgba(126,86,134,0.35)",
            color: "#e8f9a2",
            colorScheme: "dark",
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: saving ? "rgba(186,60,61,0.4)" : "#ba3c3d", color: "#fff" }}
        >
          {saved ? "Salvo ✓" : saving ? "…" : "Salvar"}
        </button>
      </div>
      <p className="text-xs mt-2" style={{ color: "rgba(165,170,217,0.45)" }}>
        Datas após esse limite ficam bloqueadas para agendamento.
        {!limit && " Sem limite definido."}
      </p>
    </div>
  );
}

export default function AdminClient({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <div className="relative min-h-screen bg-[#120a14] flex flex-col items-center py-14 px-4 overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(126,86,134,0.35) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(248,161,63,0.12) 0%, transparent 70%)" }}
      />

      {/* Barra de admin */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-bold"
          style={
            isSuperAdmin
              ? { background: "rgba(186,60,61,0.2)", color: "#f87171", border: "1px solid rgba(186,60,61,0.4)" }
              : { background: "rgba(126,86,134,0.25)", color: "#a5aad9", border: "1px solid rgba(126,86,134,0.35)" }
          }
        >
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
          style={{ color: "#ba3c3d", border: "1px solid rgba(186,60,61,0.3)" }}
          onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(186,60,61,0.1)"; }}
          onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          Sair
        </button>
      </div>

      <motion.header
        className="mb-10 text-center relative z-10"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7e5686] mb-3">
          ✦ Igreja do Santa Tereza✦
        </p>
        <h1
          className="text-4xl font-black mb-3 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #e8f9a2 0%, #a5aad9 100%)" }}
        >
          Agenda de Cultos
        </h1>
        <p className="text-[#a5aad9]/60 text-sm max-w-xs mx-auto leading-relaxed">
          Clique em uma quarta, sábado ou domingo para agendar ou editar.
        </p>
      </motion.header>

      <main className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {isSuperAdmin && <SchedulingLimitPanel />}
        <Calendar isAdmin isSuperAdmin={isSuperAdmin} />
      </main>
    </div>
  );
}
