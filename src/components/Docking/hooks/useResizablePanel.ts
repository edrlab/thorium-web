"use client";

import { useEffect, useRef, useState } from "react";

import { ThActionsDockedPref, ThDockingSizeValue } from "@/preferences";

import { ActionsStateKeys, DockStateObject } from "@/lib/actionsReducer";

import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { usePrevious } from "@/core/Hooks/usePrevious";
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
  const previouslyCollapsed = usePrevious(panel?.collapsed);

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

  const forceExpand = () => {
    return !!(isPopulated() && previouslyCollapsed && !panel?.collapsed);
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

  // react-resizable-panels only reads `defaultSize` once, when the Panel first
  // registers with its Group; changing it on every render (e.g. echoing back
  // the width Redux just recorded from a completed resize) forces the Panel to
  // re-register and the whole Group to remount, which breaks keyboard resizing.
  // Freeze the starting size and only recompute it when the docked action itself
  // changes, not on every resize of the same action.
  const initialWidthRef = useRef<{ actionKey: ActionsStateKeys | null; value: ThDockingSizeValue }>();
  const actionKey = panel?.actionKey ?? null;
  if (!initialWidthRef.current || initialWidthRef.current.actionKey !== actionKey) {
    initialWidthRef.current = { actionKey, value: previousWidth ?? width };
  }

  const getWidth = (): ThDockingSizeValue => {
    return initialWidthRef.current!.value;
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
    forceExpand,
    isResizable,
    hasDragIndicator,
    getWidth,
    getMinWidth,
    getMaxWidth
  }
}
