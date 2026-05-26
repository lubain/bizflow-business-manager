import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppSettings } from "@/shared/types";

const SETTINGS_KEY = "pme_settings";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
};

interface SettingsState {
  settings: AppSettings;
  setSettings: (
    update:
      | Partial<AppSettings>
      | ((prev: AppSettings) => Partial<AppSettings>),
  ) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setSettings: (update) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...(typeof update === "function" ? update(state.settings) : update),
          },
        })),
    }),
    { name: SETTINGS_KEY },
  ),
);
