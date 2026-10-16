"use client";

import { useMemo } from "react";

import { ThActionsKeys, ThMiniPlayerTypes, defaultReadAlongAction } from "@/preferences/models";

import { useAppSelector } from "@/lib/hooks";
import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";

import { usePreferences } from "@/preferences/hooks/usePreferences";

export const useReadAlongPlacement = () => {
  const { preferences } = usePreferences();
  const breakpoint = useAppSelector(state => state.theming.breakpoint);

  const miniPlayerPref = preferences.actions.keys[ThActionsKeys.readAlong]?.miniPlayer ?? defaultReadAlongAction.miniPlayer;

  const defaultType = miniPlayerPref.defaultType;
  const breakpointsPref = miniPlayerPref.breakpoints;
  const placementMap = useMemo(() => makeBreakpointsMap<ThMiniPlayerTypes>({
    defaultValue: defaultType,
    fromEnum: ThMiniPlayerTypes,
    pref: breakpointsPref
  }), [defaultType, breakpointsPref]);

  return breakpoint && placementMap[breakpoint] || defaultType;
};
