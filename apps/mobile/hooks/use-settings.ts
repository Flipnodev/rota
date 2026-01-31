import { useSettingsContext, type AppSettings } from "@/providers/settings-provider";

export type { AppSettings };

export function useSettings() {
  return useSettingsContext();
}
