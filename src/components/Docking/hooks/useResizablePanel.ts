"use client";

import { useEffect, useState } from "react";

import { ThActionsDockedPref, ThDockingSizeValue } from "@/preferences";

import { DockStateObject } from "@/lib/actionsReducer";

import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";

import { useAppSelector } from "@/lib/hooks";

const isNumericSize = (value: ThDockingSizeValue | undefined): value is number => {
  return typeof value === "number";
};

export const useResizablePanel = (panel: DockStateObject | undefined) => {
  const preferences = useActionsPreferences();
  const { theming } = useSharedPreferences();
  const defaultWidth = theming.layout.defaults.dockingWidth;
  const [pref, setPref] = useState<ThActionsDockedPref | null>(
    panel?.actionKey ? preferences.actionsKeys[panel.actionKey]?.docked || null : null
  );

  const profile = useAppSelector(state => state.reader.profile);
  const actionsMap = useAppSelector(state => profile ? state.actions.keys[profile] : undefined);
  const actions = useActions(actionsMap || {});

  const previousWidth = actions.getDockedWidth(panel?.actionKey) || null;
  const width: ThDockingSizeValue = pref?.width ?? defaultWidth;

  // Ascending-range clamping against the shared default only makes sense
  // when comparing like-for-like pixel values; unit strings (%, rem, vw, ...)
  // are used as configured, since they can't be compared to a pixel default
  // without measuring the live DOM node. react-resizable-panels still
  // enforces minSize/maxSize correctly at runtime regardless.
  const minWidth: ThDockingSizeValue = isNumericSize(width) && isNumericSize(pref?.minWidth) && pref.minWidth < width
    ? pref.minWidth
    : isNumericSize(width) && isNumericSize(defaultWidth) && defaultWidth < width
      ? defaultWidth
      : pref?.minWidth ?? width;

  const maxWidth: ThDockingSizeValue = isNumericSize(width) && isNumericSize(pref?.maxWidth) && pref.maxWidth > width
    ? pref.maxWidth
    : isNumericSize(width) && isNumericSize(defaultWidth) && defaultWidth > width
      ? defaultWidth
      : pref?.maxWidth ?? width;

  const isPopulated = () => {
    return !!(panel?.active && actions.isOpen(panel?.actionKey));
  };

  const isCollapsed = () => {
    return !!panel?.collapsed;
  }

  const currentKey = () => {
    return panel?.actionKey ?? null;
  };

  const isResizable = () => {
    if (!isPopulated()) return false;

    return isNumericSize(width) && isNumericSize(minWidth) && isNumericSize(maxWidth)
      ? Math.round(width) > Math.round(minWidth) && Math.round(width) < Math.round(maxWidth)
      : minWidth !== maxWidth;
  };

  const hasDragIndicator = () => {
    return pref?.dragIndicator || false;
  };

  // The size an expanding panel is restored to: the last width the user
  // resized this action to, falling back to its preference. Panels always mount
  // shut (see the Panel's `defaultSize`), so this is the only size source.
  const getTargetWidth = (): ThDockingSizeValue => {
    return previousWidth ?? width;
  };

  const getMinWidth = (): ThDockingSizeValue => {
    return minWidth;
  };

  const getMaxWidth = (): ThDockingSizeValue => {
    return maxWidth;
  };

  // When the docked action changes, we need to update its preferences
  useEffect(() => {
    setPref(panel?.actionKey ? preferences.actionsKeys[panel.actionKey]?.docked || null : null);
  }, [panel?.actionKey, preferences]);

  return {
    currentKey,
    isPopulated,
    isCollapsed,
    isResizable,
    hasDragIndicator,
    getTargetWidth,
    getMinWidth,
    getMaxWidth
  }
}
