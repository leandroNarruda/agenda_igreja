"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toLocalDateString, SERVICE_LABELS } from "@/lib/agenda";
import type { AgendaEntry } from "@/lib/agenda";

interface DayModalProps {
  date: Date | null;
  entry: AgendaEntry | null | undefined;
  onClose: () => void;
  onSave: (entry: AgendaEntry) => void;
  onDelete: (date: string) => void;
}

type Mode = "view" | "edit" | "confirm-delete";

export default function DayModal({ date, entry, onClose, onSave, onDelete }: DayModalProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [preacher, setPreacher] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (entry) setPreacher(entry.preacher);
    else setPreacher("");
    setMode("view");
  }, [entry]);

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

  async function handleSave() {
    if (!preacher.trim()) return;
    setSaving(true);
    const body: AgendaEntry = {
      date: dateKey,
      preacher: preacher.trim(),
      service,
    };
    const res = await fetch("/api/agenda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      const saved = await res.json();
      onSave({ ...saved, service });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/agenda?date=${dateKey}`, { method: "DELETE" });
    setDeleting(false);
    onDelete(dateKey);
  }

  const avatarLetter = entry
    ? entry.preacher.split(" ").slice(-1)[0][0].toUpperCase()
    : preacher.trim()
    ? preacher.trim().split(" ").slice(-1)[0][0].toUpperCase()
    : "+";

  const headerBg =
    mode === "edit"
      ? "rgba(126,86,134,0.2)"
      : mode === "confirm-delete"
      ? "rgba(186,60,61,0.2)"
      : "rgba(42,21,53,0.6)";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => { if (mode !== "view") setMode("view"); else onClose(); }}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      <motion.div
        className="relative w-full sm:max-w-md mx-0 sm:mx-4 overflow-hidden"
        style={{
          background: "#1a0d22",
          border: "1px solid rgba(126,86,134,0.4)",
          borderRadius: "1.5rem 1.5rem 0 0",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.6), 0 0 40px rgba(126,86,134,0.15)",
        }}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bottom sheet handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(126,86,134,0.5)" }} />
        </div>

        {/* Header */}
        <div
          className="px-7 pt-5 pb-4 transition-colors duration-200"
          style={{ background: headerBg }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "#f8a13f" }}
              >
                {isLoading ? "…" : service}
              </p>
              <h2 className="text-lg font-bold" style={{ color: "#e8f9a2" }}>
                {capitalizedDate}
              </h2>
            </div>

            {mode === "view" && entry && !isLoading && (
              <div className="flex gap-1 -mt-1">
                <button
                  onClick={() => { setPreacher(entry.preacher); setMode("edit"); }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "rgba(165,170,217,0.6)" }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.color = "#a5aad9"; (e.currentTarget as HTMLElement).style.background = "rgba(126,86,134,0.2)"; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(165,170,217,0.6)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  aria-label="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => setMode("confirm-delete")}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "rgba(165,170,217,0.6)" }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.color = "#ba3c3d"; (e.currentTarget as HTMLElement).style.background = "rgba(186,60,61,0.15)"; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(165,170,217,0.6)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  aria-label="Excluir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {mode === "view" && !entry && !isLoading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-5 text-2xl leading-none transition-colors"
                style={{ color: "rgba(165,170,217,0.5)" }}
                aria-label="Fechar"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="px-7 pb-8 pt-1">
          <AnimatePresence mode="wait">
            {/* VIEW MODE */}
            {mode === "view" && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
              >
                {isLoading ? (
                  <div
                    className="flex items-center gap-4 p-4 rounded-2xl mt-4 animate-pulse"
                    style={{ background: "rgba(126,86,134,0.12)", border: "1px solid rgba(126,86,134,0.2)" }}
                  >
                    <div className="w-12 h-12 rounded-full" style={{ background: "rgba(126,86,134,0.25)" }} />
                    <div className="h-4 w-40 rounded" style={{ background: "rgba(126,86,134,0.25)" }} />
                  </div>
                ) : entry ? (
                  <div
                    className="flex items-center gap-4 p-4 rounded-2xl mt-4"
                    style={{ background: "rgba(126,86,134,0.12)", border: "1px solid rgba(126,86,134,0.25)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shrink-0"
                      style={{ background: "#7e5686", color: "#e8f9a2" }}
                    >
                      {entry.preacher.split(" ").slice(-1)[0][0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: "rgba(165,170,217,0.6)" }}>Pregador</p>
                      <p className="font-bold" style={{ color: "#e8f9a2" }}>{entry.preacher}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(126,86,134,0.15)", color: "rgba(126,86,134,0.5)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm italic" style={{ color: "rgba(165,170,217,0.5)" }}>Nenhum pregador agendado</p>
                    <button
                      onClick={() => { setPreacher(""); setMode("edit"); }}
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
                  </div>
                )}

                {entry && (
                  <button
                    onClick={onClose}
                    className="mt-4 w-full py-2.5 rounded-xl font-bold transition-all text-sm"
                    style={{ background: "#7e5686", color: "#e8f9a2" }}
                    onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "#9a6aa4"; }}
                    onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = "#7e5686"; }}
                  >
                    Fechar
                  </button>
                )}

                {!entry && !isLoading && (
                  <button
                    onClick={onClose}
                    className="mt-2 w-full py-2 rounded-xl text-sm transition-colors"
                    style={{ color: "rgba(165,170,217,0.45)" }}
                  >
                    Cancelar
                  </button>
                )}
              </motion.div>
            )}

            {/* EDIT MODE */}
            {mode === "edit" && (
              <motion.div
                key="edit"
                className="space-y-4 mt-4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: "rgba(165,170,217,0.6)" }}>
                    Nome do pregador
                  </label>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{ border: "2px solid #7e5686", background: "rgba(126,86,134,0.1)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                      style={{ background: "#7e5686", color: "#e8f9a2" }}
                    >
                      {avatarLetter}
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={preacher}
                      onChange={(e) => setPreacher(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                      placeholder="Ex: Pr. João Silva"
                      className="flex-1 bg-transparent outline-none text-sm font-medium placeholder-opacity-30"
                      style={{ color: "#e8f9a2" }}
                    />
                  </div>
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
                className="space-y-4 mt-4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                <div
                  className="p-4 rounded-2xl flex items-start gap-3"
                  style={{ background: "rgba(186,60,61,0.15)", border: "1px solid rgba(186,60,61,0.35)" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(186,60,61,0.2)", color: "#ba3c3d" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-0.5" style={{ color: "#ba3c3d" }}>Remover pregador?</p>
                    <p className="text-sm" style={{ color: "rgba(186,60,61,0.8)" }}>
                      <span className="font-bold">{entry.preacher}</span> será removido deste dia.
                    </p>
                  </div>
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
        </div>
      </motion.div>
    </motion.div>
  );
}
