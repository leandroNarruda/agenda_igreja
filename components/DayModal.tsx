"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toLocalDateString, SERVICE_LABELS } from "@/lib/agenda";
import type { AgendaEntry } from "@/lib/agenda";
import { useCreateEntry, useDeleteEntry } from "@/hooks/useAgenda";

interface DayModalProps {
  date: Date | null;
  entry: AgendaEntry | null | undefined;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  isBlocked?: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}

type Mode = "view" | "edit" | "confirm-delete";

export default function DayModal({ date, entry, isAdmin = false, isSuperAdmin = false, isBlocked = false, onClose, onSave, onDelete }: DayModalProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [preacher, setPreacher] = useState("");
  const [serviceValue, setServiceValue] = useState("");
  const [singer, setSinger] = useState("");
  const createEntry = useCreateEntry();
  const deleteEntry = useDeleteEntry();
  const saving = createEntry.isPending;
  const deleting = deleteEntry.isPending;

  useEffect(() => {
    if (entry) {
      setPreacher(entry.preacher);
      setServiceValue(entry.service);
      setSinger(entry.singer ?? "");
    } else {
      setPreacher("");
      setServiceValue(date ? (SERVICE_LABELS[date.getDay()] ?? "") : "");
      setSinger("");
    }
    setMode("view");
  }, [entry, date]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mode !== "view") setMode("view");
        else onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, mode]);

  if (!date) return null;

  const dateKey = toLocalDateString(date);
  const service = entry?.service ?? SERVICE_LABELS[date.getDay()] ?? "—";
  const formattedDate = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const isLoading = entry === undefined;

  function handleSave() {
    if (!preacher.trim()) return;
    const body: AgendaEntry = {
      date: dateKey,
      preacher: preacher.trim(),
      service: serviceValue.trim() || service,
      ...(singer.trim() && { singer: singer.trim() }),
    };
    createEntry.mutate(body, { onSuccess: () => onSave() });
  }

  function handleDelete() {
    deleteEntry.mutate(dateKey, { onSuccess: () => onDelete() });
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => { if (mode !== "view") setMode("view"); else onClose(); }}
    >
      <div className="absolute inset-0 backdrop-blur-sm" />

      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl"
        style={{
          background: "#1a0d22",
          border: "1px solid rgba(126,86,134,0.4)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(126,86,134,0.15)",
        }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">

          {/* VIEW MODE */}
          {mode === "view" && (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-7"
            >
              {/* Fechar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{ color: "rgba(165,170,217,0.45)" }}
                onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(126,86,134,0.2)"; (e.currentTarget as HTMLElement).style.color = "#a5aad9"; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(165,170,217,0.45)"; }}
                aria-label="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Service + data */}
              <div className="mb-6 pr-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: "#f8a13f" }}>
                  {isLoading ? "…" : service}
                </p>
                <p className="text-sm" style={{ color: "rgba(165,170,217,0.55)" }}>
                  {capitalizedDate}
                </p>
              </div>

              {/* Pregador — destaque principal */}
              {isLoading ? (
                <div
                  className="rounded-2xl p-6 animate-pulse space-y-3"
                  style={{ background: "rgba(126,86,134,0.12)", border: "1px solid rgba(126,86,134,0.2)" }}
                >
                  <div className="h-3 w-20 rounded" style={{ background: "rgba(126,86,134,0.3)" }} />
                  <div className="h-7 w-48 rounded" style={{ background: "rgba(126,86,134,0.3)" }} />
                </div>
              ) : entry ? (
                <div
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(126,86,134,0.22) 0%, rgba(248,161,63,0.1) 100%)",
                    border: "1px solid rgba(248,161,63,0.3)",
                  }}
                >
                  {/* Glow decorativo */}
                  <div
                    className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(248,161,63,0.18) 0%, transparent 70%)" }}
                  />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(165,170,217,0.5)" }}>
                    ✦ Pregador(a)
                  </p>
                  <p className="text-2xl font-black leading-tight" style={{ color: "#e8f9a2" }}>
                    {entry.preacher}
                  </p>
                  {entry.singer && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(248,161,63,0.2)" }}>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(165,170,217,0.5)" }}>
                        ♪ Cantor(a)
                      </p>
                      <p className="text-base font-bold" style={{ color: "#e8f9a2" }}>{entry.singer}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 gap-4">
                  <p className="text-sm italic" style={{ color: "rgba(165,170,217,0.5)" }}>
                    Nenhum pregador agendado
                  </p>
                  {isAdmin && !isBlocked && (
                    <button
                      onClick={() => { setPreacher(""); setServiceValue(SERVICE_LABELS[date!.getDay()] ?? ""); setMode("edit"); }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                      style={{ background: "#7e5686", color: "#e8f9a2" }}
                      onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "#9a6aa4"; }}
                      onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "#7e5686"; }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Agendar pregador
                    </button>
                  )}
                  {isBlocked && (
                    <p className="text-xs italic text-center" style={{ color: "rgba(186,60,61,0.6)" }}>
                      Agendamento encerrado para este período
                    </p>
                  )}
                </div>
              )}

              {/* Ações */}
              <div className="mt-5 space-y-2">
                {entry && isSuperAdmin && !isBlocked && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPreacher(entry.preacher); setServiceValue(entry.service); setSinger(entry.singer ?? ""); setMode("edit"); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors"
                      style={{ border: "1px solid rgba(126,86,134,0.35)", color: "rgba(165,170,217,0.7)", background: "transparent" }}
                      onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(126,86,134,0.15)"; (e.currentTarget as HTMLElement).style.color = "#a5aad9"; }}
                      onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(165,170,217,0.7)"; }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => setMode("confirm-delete")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors"
                      style={{ border: "1px solid rgba(186,60,61,0.3)", color: "rgba(186,60,61,0.7)", background: "transparent" }}
                      onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(186,60,61,0.1)"; (e.currentTarget as HTMLElement).style.color = "#ba3c3d"; }}
                      onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(186,60,61,0.7)"; }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Excluir
                    </button>
                  </div>
                )}
                {entry && (
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={{ background: "#7e5686", color: "#e8f9a2" }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "#9a6aa4"; }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "#7e5686"; }}
                  >
                    Fechar
                  </button>
                )}
                {!entry && !isLoading && !isAdmin && (
                  <button
                    onClick={onClose}
                    className="w-full py-2 rounded-xl text-sm transition-colors"
                    style={{ color: "rgba(165,170,217,0.45)" }}
                  >
                    Fechar
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* EDIT MODE */}
          {mode === "edit" && (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-7 space-y-4"
            >
              <div className="mb-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1" style={{ color: "#f8a13f" }}>
                  {service}
                </p>
                <p className="text-sm font-bold" style={{ color: "#e8f9a2" }}>{capitalizedDate}</p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(165,170,217,0.6)" }}>
                  Nome do pregador
                </label>
                <input
                  autoFocus
                  type="text"
                  value={preacher}
                  onChange={(e) => setPreacher(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  placeholder="Ex: Pr. João Silva"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    background: "rgba(126,86,134,0.1)",
                    border: "2px solid #7e5686",
                    color: "#e8f9a2",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(165,170,217,0.6)" }}>
                  Tipo de culto
                </label>
                <input
                  type="text"
                  value={serviceValue}
                  onChange={(e) => setServiceValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  placeholder="Ex: Culto do Dia do Senhor"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    background: "rgba(126,86,134,0.1)",
                    border: "1px solid rgba(126,86,134,0.35)",
                    color: "#e8f9a2",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#7e5686"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(126,86,134,0.35)"; }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(165,170,217,0.6)" }}>
                  Nome do cantor (opcional)
                </label>
                <input
                  type="text"
                  value={singer}
                  onChange={(e) => setSinger(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  placeholder="Ex: João Batista"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                  style={{
                    background: "rgba(126,86,134,0.1)",
                    border: "1px solid rgba(126,86,134,0.35)",
                    color: "#e8f9a2",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#7e5686"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(126,86,134,0.35)"; }}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setMode("view")}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors"
                  style={{ border: "1px solid rgba(126,86,134,0.35)", color: "rgba(165,170,217,0.7)", background: "transparent" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !preacher.trim()}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#7e5686", color: "#e8f9a2" }}
                >
                  {saving ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </motion.div>
          )}

          {/* CONFIRM DELETE MODE */}
          {mode === "confirm-delete" && entry && (
            <motion.div
              key="delete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-7 space-y-4"
            >
              <div
                className="p-5 rounded-2xl"
                style={{ background: "rgba(186,60,61,0.12)", border: "1px solid rgba(186,60,61,0.35)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(186,60,61,0.7)" }}>
                  Remover pregador?
                </p>
                <p className="text-xl font-black" style={{ color: "#e8f9a2" }}>{entry.preacher}</p>
                <p className="text-sm mt-1" style={{ color: "rgba(186,60,61,0.7)" }}>
                  será removido deste culto.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode("view")}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors"
                  style={{ border: "1px solid rgba(126,86,134,0.35)", color: "rgba(165,170,217,0.7)", background: "transparent" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#ba3c3d", color: "#ffffff" }}
                >
                  {deleting ? "Removendo…" : "Remover"}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
