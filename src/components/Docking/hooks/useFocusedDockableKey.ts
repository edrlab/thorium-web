"use client";

import { useCallback } from "react";
import { ThDockingKeys, ThDockingTypes } from "@/preferences/models";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { isReservedByPref } from "../helpers/dockReservation";

export interface FocusedDockableKey {
  key: string;
  reserved: boolean;
}

export const useFocusedDockableKey = () => {
  const { actionsKeys } = useActionsPreferences();

  return useCallback((dockingKey: ThDockingKeys): FocusedDockableKey | null => {
    const active = document.activeElement;
    if (!active) return null;

    const checkKey = (key: string): boolean => {
      const dockable = actionsKeys[key]?.docked?.dockable;
      if (!dockable || dockable === ThDockingTypes.none) return false;
      return (
        dockingKey === ThDockingKeys.transient ||
        (dockingKey === ThDockingKeys.start && (dockable === ThDockingTypes.start || dockable === ThDockingTypes.both)) ||
        (dockingKey === ThDockingKeys.end && (dockable === ThDockingTypes.end || dockable === ThDockingTypes.both))
      );
    };

    // Needed here so the caller's dockAction dispatch keeps the action's
    // reservation intact
    const resolve = (key: string): FocusedDockableKey => {
      return { key, reserved: isReservedByPref(actionsKeys[key]) };
    };

    let el: Element | null = active;
    while (el) {
      const id = el.getAttribute("id");
      if (id) {
        if (checkKey(id)) return resolve(id);

        // id like "toc-docker-overflowMenu" rendered outside the portal
        const keyFromId = Object.keys(actionsKeys).find(k => id.startsWith(`${ k }-`));
        if (keyFromId && checkKey(keyFromId)) return resolve(keyFromId);
      }

      // data-key like "dockingStart-toc" where the part after the last hyphen is the key
      const dataKey = el.getAttribute("data-key");
      if (dataKey) {
        const key = dataKey.slice(dataKey.lastIndexOf("-") + 1);
        if (key && checkKey(key)) return resolve(key);
      }

      el = el.parentElement;
    }

    return null;
  }, [actionsKeys]);
};
