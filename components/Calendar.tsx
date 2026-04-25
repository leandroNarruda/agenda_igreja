"use client";

import { useState } from "react";
import ReactCalendar from "react-calendar";
import type { TileArgs } from "react-calendar";
import { getEntryByDate, isAllowedDay, AGENDA_MOCK } from "@/lib/agenda";
import DayModal from "./DayModal";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const scheduledDates = new Set(AGENDA_MOCK.map((e) => e.date));

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState<Value>(new Date());
  const [activeStartDate, setActiveStartDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  function handleDayClick(date: Date) {
    if (!isAllowedDay(date)) return;
    setSelectedDate(date);
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
    if (!scheduledDates.has(key)) return null;
    return (
      <span className="block w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mt-0.5" />
    );
  }

  function tileClassName({ date, view }: TileArgs) {
    if (view !== "month") return "";
    if (!isAllowedDay(date) || !isCurrentMonth(date)) return "tile-disabled";
    return "tile-allowed";
  }

  const entry = selectedDate ? getEntryByDate(selectedDate) : undefined;

  return (
    <>
      <div className="calendar-wrapper">
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
      </div>

      {isModalOpen && (
        <DayModal
          date={selectedDate}
          entry={entry}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
