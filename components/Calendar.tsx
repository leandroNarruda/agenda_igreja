"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactCalendar from "react-calendar";
import type { TileArgs } from "react-calendar";
import { isAllowedDay, toLocalDateString } from "@/lib/agenda";
import type { AgendaEntry } from "@/lib/agenda";
import DayModal from "./DayModal";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState<Value>(new Date());
  const [activeStartDate, setActiveStartDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [entry, setEntry] = useState<AgendaEntry | null | undefined>(undefined);
  const [scheduledDates, setScheduledDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const year = activeStartDate.getFullYear();
    const month = String(activeStartDate.getMonth() + 1).padStart(2, "0");
    fetch(`/api/agenda/month?year=${year}&month=${month}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((entries: AgendaEntry[]) => {
        setScheduledDates(new Set(entries.map((e) => e.date)));
      })
      .catch(() => setScheduledDates(new Set()));
  }, [activeStartDate]);

  async function handleDayClick(date: Date) {
    if (!isAllowedDay(date)) return;
    setSelectedDate(date);
    setEntry(undefined);
    setIsModalOpen(true);

    const res = await fetch(`/api/agenda?date=${toLocalDateString(date)}`);
    setEntry(res.ok ? await res.json() : null);
  }

  function handleSave(saved: AgendaEntry) {
    setScheduledDates((prev) => new Set([...prev, saved.date]));
    setIsModalOpen(false);
  }

  function handleDelete(date: string) {
    setScheduledDates((prev) => {
      const next = new Set(prev);
      next.delete(date);
      return next;
    });
    setIsModalOpen(false);
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
    if (!scheduledDates.has(key)) return null;
    return (
      <span className="block w-2 h-2 rounded-full mx-auto mt-0.5" style={{ background: "#f8a13f", boxShadow: "0 0 6px rgba(248,161,63,0.7)" }} />
    );
  }

  function tileClassName({ date, view }: TileArgs) {
    if (view !== "month") return "";
    if (!isAllowedDay(date) || !isCurrentMonth(date)) return "tile-disabled";
    return "tile-allowed";
  }

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

      <AnimatePresence>
        {isModalOpen && (
          <DayModal
            date={selectedDate}
            entry={entry}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
