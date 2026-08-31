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

// A "px" string is a pixel value like a plain number and can be compared
// against one directly; %/em/rem/vh/vw can't be without measuring the live
// DOM node
const toPixels = (value: ThDockingSizeValue | undefined): number | undefined => {
  if (isNumericSize(value)) return value;
  if (typeof value === "string" && value.endsWith("px")) return parseFloat(value);
  return undefined;
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
  // when comparing like-for-like pixel values; unit strings that aren't
  // pixels (%, rem, vw, ...) are used as configured, since they can't be
  // compared to a pixel default without measuring the live DOM node.
  // react-resizable-panels still enforces minSize/maxSize correctly at
  // runtime regardless.
  const widthPx = toPixels(width);
  const defaultWidthPx = toPixels(defaultWidth);

  const minWidthPx = toPixels(pref?.minWidth);
  const minWidth: ThDockingSizeValue = widthPx !== undefined && minWidthPx !== undefined && minWidthPx < widthPx
    ? minWidthPx
    : pref?.minWidth !== undefined && minWidthPx === undefined
      ? pref.minWidth
      : widthPx !== undefined && defaultWidthPx !== undefined && defaultWidthPx < widthPx
        ? defaultWidth
        : pref?.minWidth ?? width;

  const maxWidthPx = toPixels(pref?.maxWidth);
  const maxWidth: ThDockingSizeValue = widthPx !== undefined && maxWidthPx !== undefined && maxWidthPx > widthPx
    ? maxWidthPx
    : pref?.maxWidth !== undefined && maxWidthPx === undefined
      ? pref.maxWidth
      : widthPx !== undefined && defaultWidthPx !== undefined && defaultWidthPx > widthPx
        ? defaultWidth
        : pref?.maxWidth ?? width;

  const isPopulated = () => {
    return !!(panel?.active && actions.isOpen(panel?.actionKey));
  };

  const currentKey = () => {
    return panel?.actionKey ?? null;
  };

  // Occupancy, not openness: dragging the separator out is how a shut panel is
  // reopened, so its handle has to stay live. A slot holding nothing has none
  const isResizable = () => {
    if (!panel?.actionKey) return false;

    return isNumericSize(width) && isNumericSize(minWidth) && isNumericSize(maxWidth)
      ? Math.round(width) > Math.round(minWidth) && Math.round(width) < Math.round(maxWidth)
      : minWidth !== maxWidth;
  };

  const hasDragIndicator = () => {
    return pref?.dragIndicator || false;
  };

  // The size an expanding panel is restored to. Panels always mount shut, so
  // this is their only size source. Re-clamped against the current bounds:
  // a width saved before the config's min/max shrank must not ask the panel
  // to resize outside the bounds it's configured with now
  const getTargetWidth = (): ThDockingSizeValue => {
    if (previousWidth == null) return width;
    if (isNumericSize(minWidth) && previousWidth < minWidth) return minWidth;
    if (isNumericSize(maxWidth) && previousWidth > maxWidth) return maxWidth;
    return previousWidth;
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
    isResizable,
    hasDragIndicator,
    getTargetWidth,
    getMinWidth,
    getMaxWidth
  }
}
