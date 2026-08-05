"use client";

import { useCallback } from "react";

import { ThDockingKeys, ThSheetTypes } from "@/preferences/models";

import { useAppSelector } from "@/lib/hooks";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export const useDockReservation = <T extends string>(key: T) => {
  const preferences = useActionsPreferences();
  const profile = useAppSelector(state => state.reader.profile);
  const dock = useAppSelector(state => profile ? state.actions.dock[profile] : undefined);

  const actionPref = preferences.actionsKeys[key as keyof typeof preferences.actionsKeys];

  // Reserving a slot only makes sense for an action that lives there by
  // default: it is what "the user can't pop it out" is protecting. An action
  // whose default sheet isn't dockedStart/dockedEnd is only ever docked by the
  // user's own choice, so `docked.reserved` is inert on it — same as unset
  const isDockedByDefault = actionPref?.sheet?.defaultSheet === ThSheetTypes.dockedStart
    || actionPref?.sheet?.defaultSheet === ThSheetTypes.dockedEnd;
  const reserved = !!actionPref?.docked?.reserved && isDockedByDefault;

  // A reserved occupant can't be displaced by any other action's docking
  const isSlotLockedByOther = useCallback((slot: ThDockingKeys.start | ThDockingKeys.end) => {
    return !!dock?.[slot]?.reserved && dock?.[slot]?.actionKey !== key;
  }, [dock, key]);

  return {
    dock,
    reserved,
    isSlotLockedByOther
  };
};
