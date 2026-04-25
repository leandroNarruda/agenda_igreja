"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AgendaEntry } from "@/lib/agenda";

interface DayModalProps {
  date: Date | null;
  entry: AgendaEntry | undefined;
  onClose: () => void;
}

export default function DayModal({ date, entry, onClose }: DayModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!date) return null;

  const formattedDate = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors text-2xl leading-none"
          aria-label="Fechar"
        >
          &times;
        </button>

        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">
            {entry?.service ?? "—"}
          </p>
          <h2 className="text-xl font-bold text-gray-800">{capitalizedDate}</h2>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shrink-0">
            {entry ? entry.preacher.split(" ").slice(-1)[0][0] : "?"}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Pregador</p>
            {entry ? (
              <p className="text-gray-900 font-semibold">{entry.preacher}</p>
            ) : (
              <p className="text-gray-400 italic">Nenhum pregador agendado</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
