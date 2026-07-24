"use client";

import { useCallback } from "react";
import { ThDockingKeys, ThDockingTypes } from "@/preferences/models";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export const useFocusedDockableKey = () => {
  const { actionsKeys } = useActionsPreferences();

  return useCallback((dockingKey: ThDockingKeys): string | null => {
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

    let el: Element | null = active;
    while (el) {
      const id = el.getAttribute("id");
      if (id) {
        if (checkKey(id)) return id;

        // id like "toc-docker-overflowMenu" rendered outside the portal
        const keyFromId = Object.keys(actionsKeys).find(k => id.startsWith(`${ k }-`));
        if (keyFromId && checkKey(keyFromId)) return keyFromId;
      }

      // data-key like "dockingStart-toc" where the part after the last hyphen is the key
      const dataKey = el.getAttribute("data-key");
      if (dataKey) {
        const key = dataKey.slice(dataKey.lastIndexOf("-") + 1);
        if (key && checkKey(key)) return key;
      }

      el = el.parentElement;
    }

    return null;
  }, [actionsKeys]);
};
