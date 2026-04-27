"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactCalendar from "react-calendar";
import type { TileArgs } from "react-calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { isAllowedDay, toLocalDateString } from "@/lib/agenda";
import DayModal from "./DayModal";
import { useMonthAgenda, useDayEntry } from "@/hooks/useAgenda";
import { useAgendaRealtime } from "@/hooks/useAgendaRealtime";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

function todayInBrasilia(): string {
  const now = new Date();
  const brasilia = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const y = brasilia.getFullYear();
  const m = String(brasilia.getMonth() + 1).padStart(2, "0");
  const d = String(brasilia.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatEntryDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const formatted = format(date, "EEE, d 'de' MMM", { locale: ptBR });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function Calendar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState<Value>(new Date());
  const [activeStartDate, setActiveStartDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const year = activeStartDate.getFullYear();
  const month = activeStartDate.getMonth() + 1;

  useAgendaRealtime();

  const { data: monthData } = useMonthAgenda(year, month);
  const monthEntries = (monthData?.entries ?? []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const scheduledDates = new Set(monthEntries.map((e) => e.date));
  const schedulingLimit = monthData?.schedulingLimit ?? null;

  const { data: dayEntry, isLoading: isDayLoading } = useDayEntry(isModalOpen ? selectedDateStr : null);

  function isDateBlocked(dateStr: string): boolean {
    return !!schedulingLimit && dateStr > schedulingLimit;
  }

  function handleDayClick(date: Date) {
    if (!isAllowedDay(date)) return;
    setSelectedDateStr(toLocalDateString(date));
    setIsModalOpen(true);
  }

  function isCurrentMonth(date: Date): boolean {
    return (
      date.getMonth() === activeStartDate.getMonth() &&
      date.getFullYear() === activeStartDate.getFullYear()
    );
  }

  function tileDisabled({ date, view }: TileArgs) {
    if (view !== "month") return false;
    return !isAllowedDay(date) || !isCurrentMonth(date);
  }

  function tileContent({ date, view }: TileArgs) {
    if (view !== "month") return null;
    if (!isAllowedDay(date)) return null;
    const key = toLocalDateString(date);
    const blocked = isDateBlocked(key);
    if (blocked) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 mx-auto mt-0.5" viewBox="0 0 20 20" fill="rgba(186,60,61,0.7)">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524L13.477 14.89zm1.414-1.414L6.524 5.11A6 6 0 0114.89 13.476zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
      );
    }
    if (!scheduledDates.has(key)) return null;
    const isPast = key < todayInBrasilia();
    return (
      <span
        className="block w-2 h-2 rounded-full mx-auto mt-0.5"
        style={isPast
          ? { background: "#4ade80", boxShadow: "0 0 6px rgba(74,222,128,0.7)" }
          : { background: "#f8a13f", boxShadow: "0 0 6px rgba(248,161,63,0.7)" }}
      />
    );
  }

  function tileClassName({ date, view }: TileArgs) {
    if (view !== "month") return "";
    if (!isAllowedDay(date) || !isCurrentMonth(date)) return "tile-disabled";
    return "tile-allowed";
  }

  const selectedDate = selectedDateStr
    ? (() => { const [y, m, d] = selectedDateStr.split("-").map(Number); return new Date(y, m - 1, d); })()
    : null;

  return (
    <>
      <motion.div
        className="calendar-wrapper"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
      >
        <ReactCalendar
          value={value}
          onChange={setValue}
          onClickDay={handleDayClick}
          onActiveStartDateChange={({ activeStartDate: d }) => {
            if (d) setActiveStartDate(d);
          }}
          tileDisabled={tileDisabled}
          tileContent={tileContent}
          tileClassName={tileClassName}
          locale="pt-BR"
          minDetail="month"
          next2Label={null}
          prev2Label={null}
        />
      </motion.div>

      {/* Lista do mês */}
      {monthEntries.filter((e) => e.date >= todayInBrasilia()).length > 0 && (
        <motion.ul
          className="mt-6 w-full space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          {monthEntries.filter((e) => e.date >= todayInBrasilia()).map((e) => (
            <li
              key={e.date}
              onClick={() => {
                setSelectedDateStr(e.date);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer"
              style={{
                background: "rgba(126,86,134,0.1)",
                border: "1px solid rgba(126,86,134,0.2)",
              }}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest truncate" style={{ color: "#f8a13f" }}>
                  {e.service}
                </p>
                <p className="text-sm font-semibold truncate" style={{ color: "#e8f9a2" }}>
                  {e.preacher}
                </p>
              </div>
              <p className="text-xs shrink-0 ml-4" style={{ color: "rgba(165,170,217,0.55)" }}>
                {formatEntryDate(e.date)}
              </p>
            </li>
          ))}
        </motion.ul>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <DayModal
            date={selectedDate}
            entry={isDayLoading ? undefined : dayEntry ?? null}
            isAdmin={isAdmin}
            isBlocked={selectedDateStr ? isDateBlocked(selectedDateStr) : false}
            onClose={() => setIsModalOpen(false)}
            onSave={() => setIsModalOpen(false)}
            onDelete={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
