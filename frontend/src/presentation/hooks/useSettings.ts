import { useSettingsStore } from "@/store/useSettingsStore";

export function useSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);

  return {
    settings,
    setSettings,
  };
}
