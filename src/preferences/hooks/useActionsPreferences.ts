"use client";

import { useContext, useMemo } from "react";
import { ThActionsTokens, ThAudioActionsTokens, ThDockingKeys, ThDockingPref } from "../models";
import { ThAudioPreferencesContext } from "../ThAudioPreferencesContext";
import { ThPreferencesContext } from "../ThPreferencesContext";

export interface ActionsPreferences {
  docking: ThDockingPref<ThDockingKeys>;
  actionsKeys: Record<string, ThActionsTokens | ThAudioActionsTokens>;
}

export interface AudioActionsPreferences {
  docking: ThDockingPref<ThDockingKeys>;
  primaryActionsKeys: Record<string, ThAudioActionsTokens>;
  secondaryActionsKeys: Record<string, ThActionsTokens>;
  primaryDisplayOrder: string[];
  secondaryDisplayOrder: string[];
}

/**
 * Context-agnostic hook for docking/actions infrastructure.
 * Resolves preferences from the audio context when available,
 * falling back to the reader context. This allows shared
 * components (docking, action containers) to work in both.
 */
export const useActionsPreferences = (): ActionsPreferences => {
  const audioCtx = useContext(ThAudioPreferencesContext);
  const readerCtx = useContext(ThPreferencesContext);

  const audioPrimaryKeys = audioCtx?.preferences.actions.primary.keys;
  const audioSecondaryKeys = audioCtx?.preferences.actions.secondary.keys;
  const audioDocking = audioCtx?.preferences.docking;

  const audioActionsKeys = useMemo(() => {
    if (!audioPrimaryKeys && !audioSecondaryKeys) return null;
    return { ...audioPrimaryKeys, ...audioSecondaryKeys };
  }, [audioPrimaryKeys, audioSecondaryKeys]);

  const audioResult = useMemo(() => {
    if (!audioCtx || !audioActionsKeys || !audioDocking) return null;
    return { docking: audioDocking, actionsKeys: audioActionsKeys };
  }, [audioCtx, audioDocking, audioActionsKeys]);

  const readerResult = useMemo(() => {
    if (!readerCtx) return null;
    return {
      docking: readerCtx.preferences.docking,
      actionsKeys: readerCtx.preferences.actions.keys as Record<string, ThActionsTokens>,
    };
  }, [readerCtx]);

  if (audioResult) return audioResult;
  if (readerResult) return readerResult;

  throw new Error("useActionsPreferences must be used within a ThPreferencesProvider or ThAudioPreferencesProvider");
};

export const useAudioActionsPreferences = (): AudioActionsPreferences => {
  const audioCtx = useContext(ThAudioPreferencesContext);

  if (!audioCtx) {
    throw new Error("useAudioActionsPreferences must be used within a ThAudioPreferencesProvider");
  }

  return {
    docking: audioCtx.preferences.docking,
    primaryActionsKeys: audioCtx.preferences.actions.primary.keys,
    secondaryActionsKeys: audioCtx.preferences.actions.secondary.keys,
    primaryDisplayOrder: audioCtx.preferences.actions.primary.displayOrder as string[],
    secondaryDisplayOrder: audioCtx.preferences.actions.secondary.displayOrder as string[],
  };
};
