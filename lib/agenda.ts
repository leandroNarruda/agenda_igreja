export interface AgendaEntry {
  date: string; // formato ISO: "YYYY-MM-DD"
  preacher: string;
  service: string;
}

// Dom=0, Qua=3, Sáb=6
export const ALLOWED_WEEKDAYS = [0, 3, 6];

export const SERVICE_LABELS: Record<number, string> = {
  0: "Culto do Dia do Senhor",
  3: "Culto de Oração",
  6: "Culto da Família",
};

export const AGENDA_MOCK: AgendaEntry[] = [
  // Abril 2026
  { date: "2026-04-05", preacher: "Pr. João Silva",     service: "Culto do Dia do Senhor" },
  { date: "2026-04-08", preacher: "Pr. Carlos Mendes",  service: "Culto de Oração" },
  { date: "2026-04-11", preacher: "Pr. André Santos",   service: "Culto da Família" },
  { date: "2026-04-12", preacher: "Pr. Roberto Lima",   service: "Culto do Dia do Senhor" },
  { date: "2026-04-15", preacher: "Pr. Marcos Oliveira",service: "Culto de Oração" },
  { date: "2026-04-18", preacher: "Pr. Paulo Ferreira", service: "Culto da Família" },
  { date: "2026-04-19", preacher: "Pr. João Silva",     service: "Culto do Dia do Senhor" },
  { date: "2026-04-22", preacher: "Pr. Carlos Mendes",  service: "Culto de Oração" },
  { date: "2026-04-25", preacher: "Pr. André Santos",   service: "Culto da Família" },
  { date: "2026-04-26", preacher: "Pr. Roberto Lima",   service: "Culto do Dia do Senhor" },
  { date: "2026-04-29", preacher: "Pr. Marcos Oliveira",service: "Culto de Oração" },
  // Maio 2026
  { date: "2026-05-02", preacher: "Pr. Paulo Ferreira", service: "Culto da Família" },
  { date: "2026-05-03", preacher: "Pr. João Silva",     service: "Culto do Dia do Senhor" },
  { date: "2026-05-06", preacher: "Pr. Carlos Mendes",  service: "Culto de Oração" },
];

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getEntryByDate(date: Date): AgendaEntry | undefined {
  const key = toLocalDateString(date);
  return AGENDA_MOCK.find((e) => e.date === key);
}

export function isAllowedDay(date: Date): boolean {
  return ALLOWED_WEEKDAYS.includes(date.getDay());
}
