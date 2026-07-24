"use client";

import { useMemo } from "react";

import { IKeyboardPeripheralsConfig } from "@readium/navigator";

import { useAudioActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

import { toActionPeripheralType, toDockingPeripheralType } from "@/helpers/peripherals";

export const useAudioKeyboardPeripherals = (): IKeyboardPeripheralsConfig => {
  const { primaryActionsKeys, secondaryActionsKeys, primaryDisplayOrder, secondaryDisplayOrder, docking } = useAudioActionsPreferences();

  return useMemo(() => {
    const config: IKeyboardPeripheralsConfig = [];
    const allKeys = { ...primaryActionsKeys, ...secondaryActionsKeys };

    for (const [key, tokens] of Object.entries(allKeys)) {
      const shortcut = tokens?.shortcut;
      const isInOrder = primaryDisplayOrder.includes(key) || secondaryDisplayOrder.includes(key);
      if (shortcut && isInOrder) config.push({ type: toActionPeripheralType(key), keyCombos: shortcut.keyCombos });
    }

    for (const [key, tokens] of Object.entries(docking.keys)) {
      if (tokens?.shortcut) config.push({ type: toDockingPeripheralType(key), keyCombos: tokens.shortcut.keyCombos });
    }

    return config;
  }, [primaryActionsKeys, secondaryActionsKeys, primaryDisplayOrder, secondaryDisplayOrder, docking.keys]);
};
