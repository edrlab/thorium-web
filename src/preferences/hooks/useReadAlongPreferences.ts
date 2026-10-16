"use client";

import { useContext } from "react";
import { ThPreferencesContext } from "../ThPreferencesContext";
import { CustomizableKeys, DefaultKeys, ThReadAlongPref } from "../preferences";
import { defaultReadAlongPreferences } from "../models";

export const useReadAlongPreferences = <K extends CustomizableKeys = DefaultKeys>(): ThReadAlongPref<K> => {
  const context = useContext(ThPreferencesContext);

  return (context?.preferences.readAlong ?? defaultReadAlongPreferences) as ThReadAlongPref<K>;
};
