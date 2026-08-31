"use client";

import { useCallback } from "react";

import { ThDockingKeys } from "@/preferences/models";

import { useAppSelector } from "@/lib/hooks";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { isReservedByPref } from "../helpers/dockReservation";

export const useDockReservation = <T extends string>(key: T) => {
  const preferences = useActionsPreferences();
  const profile = useAppSelector(state => state.reader.profile);
  const dock = useAppSelector(state => profile ? state.actions.dock[profile] : undefined);

  const actionPref = preferences.actionsKeys[key as keyof typeof preferences.actionsKeys];
  const reserved = isReservedByPref(actionPref);

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
