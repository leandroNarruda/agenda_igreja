"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useSettings() {
  return useQuery<string | null>({
    queryKey: ["settings", "schedulingLimit"],
    queryFn: async () => {
      const res = await fetch("/api/settings?key=schedulingLimit");
      const data = await res.json();
      return data.value ?? null;
    },
    staleTime: Infinity,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (value: string) => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "schedulingLimit", value }),
      });
      if (!res.ok) throw new Error("Erro ao salvar configuração");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "schedulingLimit"] });
      queryClient.invalidateQueries({ queryKey: ["agenda", "month"] });
    },
  });
}
