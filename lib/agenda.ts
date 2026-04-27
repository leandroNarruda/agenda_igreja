export interface AgendaEntry {
  date: string; // formato ISO: "YYYY-MM-DD"
  preacher: string;
  service: string;
  singer?: string;
}

// Dom=0, Qua=3, Sáb=6
export const ALLOWED_WEEKDAYS = [0, 3, 6];

export const SERVICE_LABELS: Record<number, string> = {
  0: "Culto de domingo",
  3: "Culto de quarta-feira",
  6: "Culto de sábado",
};

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isAllowedDay(date: Date): boolean {
  return ALLOWED_WEEKDAYS.includes(date.getDay());
}
