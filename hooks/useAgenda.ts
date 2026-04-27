"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AgendaEntry } from "@/lib/agenda";

interface MonthAgendaResponse {
  entries: AgendaEntry[];
  schedulingLimit: string | null;
}

export function useMonthAgenda(year: number, month: number) {
  return useQuery<MonthAgendaResponse>({
    queryKey: ["agenda", "month", year, month],
    queryFn: async () => {
      const res = await fetch(`/api/agenda/month?year=${year}&month=${month}`);
      if (!res.ok) return { entries: [], schedulingLimit: null };
      return res.json();
    },
  });
}

export function useDayEntry(dateStr: string | null) {
  return useQuery<AgendaEntry | null>({
    queryKey: ["agenda", "day", dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/agenda?date=${dateStr}`);
      return res.ok ? res.json() : null;
    },
    enabled: !!dateStr,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: AgendaEntry) => {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao salvar entrada");
      return res.json() as Promise<AgendaEntry>;
    },
    onSuccess: (saved) => {
      const [year, month] = saved.date.split("-").map(Number);
      queryClient.invalidateQueries({ queryKey: ["agenda", "month", year, month] });
      queryClient.invalidateQueries({ queryKey: ["agenda", "day", saved.date] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      await fetch(`/api/agenda?date=${date}`, { method: "DELETE" });
      return date;
    },
    onSuccess: (date) => {
      const [year, month] = date.split("-").map(Number);
      queryClient.invalidateQueries({ queryKey: ["agenda", "month", year, month] });
      queryClient.invalidateQueries({ queryKey: ["agenda", "day", date] });
    },
  });
}
