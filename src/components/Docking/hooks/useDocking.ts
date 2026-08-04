"use client";

import { useCallback, useEffect, useMemo } from "react";

import { ThDockingTypes, ThDockingKeys, ThSheetTypes } from "@/preferences/models";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";
import { dockAction, setActionOpen } from "@/lib/actionsReducer";

import { usePrevious } from "@/core/Hooks/usePrevious";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useDockReservation } from "./useDockReservation";

const isDockedType = (type: ThSheetTypes) => type === ThSheetTypes.dockedStart || type === ThSheetTypes.dockedEnd;

export const useDocking = <T extends string>(key: T) => {
  const preferences = useActionsPreferences();
  const breakpoint = useAppSelector(state => state.theming.breakpoint);
  const profile = useAppSelector(state => state.reader.profile);
  const actionsMap = useAppSelector(state => profile ? state.actions.keys[profile] : undefined);
  const actionState = actionsMap?.[key];
  const { reserved, isSlotLockedByOther } = useDockReservation(key);
  const dispatch = useAppDispatch();

  const dockingPref = preferences.docking.dock;
  const dockingMap = useMemo(() => makeBreakpointsMap<ThDockingTypes>({
    defaultValue: ThDockingTypes.both,
    fromEnum: ThDockingTypes,
    pref: dockingPref,
    disabledValue: ThDockingTypes.none
  }), [dockingPref]);
  const currentDockConfig = breakpoint && dockingMap[breakpoint];

  // Use type assertion to tell TypeScript that the key is valid
  const actionPref = preferences.actionsKeys[key as keyof typeof preferences.actionsKeys];
  const dockablePref = actionPref?.docked?.dockable || ThDockingTypes.none;

  const defaultSheet = actionPref?.sheet?.defaultSheet || ThSheetTypes.popover;
  const fallbackSheet = actionPref?.sheet?.fallbackSheet || ThSheetTypes.modal;
  // defaultSheet may itself be dockedStart/dockedEnd; safeDefaultSheet is always
  // renderable and is what every "docking isn't available" fallback should use
  const safeDefaultSheet = isDockedType(defaultSheet) ? fallbackSheet : defaultSheet;

  const sheetBreakpointsPref = actionPref?.sheet?.breakpoints;
  const sheetMap = useMemo(() => makeBreakpointsMap<ThSheetTypes>({
    defaultValue: defaultSheet,
    fromEnum: ThSheetTypes,
    pref: sheetBreakpointsPref
  }), [defaultSheet, sheetBreakpointsPref]);
  const sheetPref = breakpoint && sheetMap[breakpoint] || defaultSheet;

  // Checks whether the action can be docked: its pref should match the docking pref
  const canBeDocked = useCallback((slot: ThDockingTypes.start | ThDockingTypes.end) => {
      return (currentDockConfig === slot || currentDockConfig === ThDockingTypes.both)
          && (dockablePref === slot || dockablePref === ThDockingTypes.both)
          && !isSlotLockedByOther(slot === ThDockingTypes.start ? ThDockingKeys.start : ThDockingKeys.end);
  }, [currentDockConfig, dockablePref, isSlotLockedByOther]);

  // Checks whether the sheet pref is of Dock type
  const isDockedSheetPref = useCallback((type?: ThSheetTypes.dockedStart | ThSheetTypes.dockedEnd) => {
    if (type) {
      return sheetPref === type;
    } else {
      return sheetPref === ThSheetTypes.dockedStart || sheetPref === ThSheetTypes.dockedEnd
    }
  }, [sheetPref]);

  // Falling back to the sheet pref is only safe if that pref isn’t itself
  // pointing at a dock slot the action can’t have: there would be no panel to
  // portal into, and the action would be unreachable at this breakpoint. Each
  // branch below only checks the one slot it knows about, so the pref is
  // validated against both here
  const usableSheetPref = useCallback((): ThSheetTypes => {
    if (sheetPref === ThSheetTypes.dockedStart && !canBeDocked(ThDockingTypes.start)) return safeDefaultSheet;
    if (sheetPref === ThSheetTypes.dockedEnd && !canBeDocked(ThDockingTypes.end)) return safeDefaultSheet;
    return sheetPref;
  }, [sheetPref, canBeDocked, safeDefaultSheet]);

  // Derived, never stored: a copy held in state lags a render behind the values
  // it is computed from, and the effects below would then dispatch corrections
  // against a sheet type that is already stale — which is how the writers of
  // `docking` and `dock[slot].actionKey` end up fighting each other
  const sheetType: ThSheetTypes = useMemo(() => {
    // Protect against null breakpoint during initialization
    if (!breakpoint) {
      return safeDefaultSheet;
    }

    // First check the dockable pref is none to return early
    if (dockablePref === ThDockingTypes.none) {
      // Sheet is of docked type, we return the safe fallback
      if (isDockedSheetPref()) {
        return safeDefaultSheet;
      } else {
        // Sheet pref is not of docked type, we can return it
        return usableSheetPref();
      }
    };

    // A disallowed stale "transient" state (e.g. persisted from before the
    // action became reserved) is folded back into the null/undefined case
    const effectiveDocking = (actionState?.docking === ThDockingKeys.transient && reserved)
      ? undefined
      : actionState?.docking;

    // We now need to check whether the user has docked the action themselves
    // ActionsReducer should has made sure there is no conflict to handle here
    // by updating states of actions on docking
    switch (effectiveDocking) {

      // if action.docking is transient we need to check the pref,
      // it can be docked and in that case we need to pick the default
      case ThDockingKeys.transient:
        if (isDockedSheetPref()) {
          return safeDefaultSheet;
        } else {
          return usableSheetPref();
        }

      // If action.docking is set to start/end then we check the docking slot is available
      case ThDockingKeys.start:
        if (canBeDocked(ThDockingTypes.start)) {
          return ThSheetTypes.dockedStart;
        } else {
          // if the pref is not docked start, return the pref
          // else return the safe fallback
          if (!isDockedSheetPref(ThSheetTypes.dockedStart)) {
            return usableSheetPref();
          } else {
            return safeDefaultSheet;
          }
        }

      case ThDockingKeys.end:
        if (canBeDocked(ThDockingTypes.end)) {
          return ThSheetTypes.dockedEnd;
        } else {
          // if the pref is not docked end, return the pref
          // else return the safe fallback
          if (!isDockedSheetPref(ThSheetTypes.dockedEnd)) {
            return usableSheetPref();
          } else {
            return safeDefaultSheet;
          }
        }

      // If action.docking is null or undefined then we rely on pref
      // as it means the user did not pick another option
      case null:
      case undefined:
        // We have to check sheetPref is compatible with docking prefs
        if (isDockedSheetPref(ThSheetTypes.dockedStart)) {
          if (canBeDocked(ThDockingTypes.start)) {
            return ThSheetTypes.dockedStart;
          } else {
            return safeDefaultSheet;
          }
        } else if (isDockedSheetPref(ThSheetTypes.dockedEnd)) {
          if (canBeDocked(ThDockingTypes.end)) {
            return ThSheetTypes.dockedEnd;
          } else {
            return safeDefaultSheet;
          }
        } else {
          return usableSheetPref();
        }
      default:
        return safeDefaultSheet;
    }
  }, [dockablePref, safeDefaultSheet, actionState?.docking, reserved, canBeDocked, isDockedSheetPref, usableSheetPref, breakpoint]);

  const previousSheetType = usePrevious(sheetType);

  // Builds the docker for the action based on all preferences
  const getDocker = useCallback((): ThDockingKeys[] => {
    // First let’s handle the cases where docker shouldn’t be used
    // The sheet is not dockable, per key.docked.dockable pref
    if (dockablePref === ThDockingTypes.none) return [];
    // There’s no docking slot available, per docking.dock pref
    if (currentDockConfig === ThDockingTypes.none) return [];
    // The sheet type is not compatible with docking
    if (sheetPref === ThSheetTypes.fullscreen || sheetPref === ThSheetTypes.bottomSheet) return [];

    // We can now build the docker from the display order
    let dockerKeys: ThDockingKeys[] = [];
    // In order for an action to be dockable, the dock slot has to exist
    // and the dockable preference of key.docked should match the values
    preferences.docking.displayOrder.forEach((dockingKey: ThDockingKeys) => {
      switch(dockingKey) {
        case ThDockingKeys.transient:
          // Reserved actions never expose an undock control
          if (!reserved) {
            dockerKeys.push(dockingKey);
          }
          break;
        case ThDockingKeys.start:
          if (canBeDocked(ThDockingTypes.start)) {
            dockerKeys.push(dockingKey);
          }
          break;
        case ThDockingKeys.end:
          if (canBeDocked(ThDockingTypes.end)) {
            dockerKeys.push(dockingKey);
          }
          break;
        default:
          break;
      }
    });

    // If the action can only be transient, then it can’t be docked
    if (dockerKeys.length === 1 && dockerKeys[0] === ThDockingKeys.transient) return [];

    return dockerKeys;
  }, [preferences.docking.displayOrder, currentDockConfig, sheetPref, dockablePref, reserved, canBeDocked]);

  // Bootstrap: the action resolves to a docked sheet from prefs alone and has
  // never been interacted with, so the slot it expects has never been populated.
  // Gated on isOpen still being unset, so it runs at most once per action
  useEffect(() => {
    if (actionState?.isOpen != null || !profile) return;
    if (!isDockedType(sheetType)) return;

    dispatch(dockAction({
      key: key,
      dockingKey: sheetType === ThSheetTypes.dockedStart ? ThDockingKeys.start : ThDockingKeys.end,
      profile: profile,
      reserved
    }));
    dispatch(setActionOpen({
      key: key,
      isOpen: true,
      profile
    }));
  }, [actionState?.isOpen, sheetType, key, dispatch, profile, reserved]);

  // The action was showing in a slot that has just stopped being usable — the
  // breakpoint dropped it, or a reserved action claimed it. Dismiss it once,
  // and deliberately leave `docking` pointing at the slot: that is what lets
  // the action reclaim it, without any repair dispatch, once the slot is back.
  //
  // Strictly the docked -> undocked edge, never the state of being undocked:
  // the action stays openable as its fallback sheet in the meantime, which a
  // standing condition here would prevent by closing it again on every open
  useEffect(() => {
    if (!previousSheetType || !isDockedType(previousSheetType) || isDockedType(sheetType)) return;
    if (!breakpoint || !profile || !actionState?.isOpen) return;

    const docking = actionState.docking;
    if (docking === ThDockingKeys.start || docking === ThDockingKeys.end) {
      dispatch(setActionOpen({
        key: key,
        isOpen: false,
        profile
      }));
    }
  }, [dispatch, key, sheetType, previousSheetType, breakpoint, profile, actionState?.isOpen, actionState?.docking]);

  return {
    getDocker,
    sheetType
  }
}
