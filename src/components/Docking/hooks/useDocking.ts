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
  const { dock, reserved, isSlotLockedByOther } = useDockReservation(key);
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
  const reopenOnLoadPref = !!actionPref?.docked?.reopenOnLoad;

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

  // The pref can itself point at a dock slot the action can’t have, leaving it
  // with no panel to portal into. Branches below each check only the one slot
  // they know about, so validate against both here
  const usableSheetPref = useCallback((): ThSheetTypes => {
    if (sheetPref === ThSheetTypes.dockedStart && !canBeDocked(ThDockingTypes.start)) return safeDefaultSheet;
    if (sheetPref === ThSheetTypes.dockedEnd && !canBeDocked(ThDockingTypes.end)) return safeDefaultSheet;
    return sheetPref;
  }, [sheetPref, canBeDocked, safeDefaultSheet]);

  // A "transient" persisted before the action became reserved is a state the
  // action can no longer leave on its own: reserved actions expose no undock
  // control, so nothing can move it back to a slot. Treated as unclaimed
  // everywhere below, and written back to a real slot by the effect that
  // claims it — leaving it would render a docked sheet with no slot to
  // portal into, which no trigger can then open
  const hasStaleTransient = actionState?.docking === ThDockingKeys.transient && reserved;
  const effectiveDocking = hasStaleTransient ? undefined : actionState?.docking;

  // sheetPref once it's known to name a slot other than the one actually
  // being resolved: a non-docked value is a deliberate per-breakpoint choice
  // and used as-is, a docked one carries no usable slot information here
  const nonDockedSheetPref = isDockedType(sheetPref) ? safeDefaultSheet : sheetPref;

  // Derived, never stored: held in state it lags a render behind the values it
  // comes from, and the effects below then dispatch against a stale sheet type
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

      // The chosen slot may not be the one the static pref names, so
      // usableSheetPref (keyed to sheetPref's own slot) can't be reused here.
      // Unavailable: an explicit per-breakpoint non-docked sheet wins,
      // otherwise fall to fallbackSheet
      case ThDockingKeys.start:
        if (canBeDocked(ThDockingTypes.start)) {
          return ThSheetTypes.dockedStart;
        } else {
          return nonDockedSheetPref;
        }

      case ThDockingKeys.end:
        if (canBeDocked(ThDockingTypes.end)) {
          return ThSheetTypes.dockedEnd;
        } else {
          return nonDockedSheetPref;
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
  }, [dockablePref, safeDefaultSheet, effectiveDocking, canBeDocked, isDockedSheetPref, usableSheetPref, nonDockedSheetPref, breakpoint]);

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

  // Two independent gaps to fill once the breakpoint says this action is docked.
  // Both guards are cleared by their own dispatch, so each is one-shot
  useEffect(() => {
    if (!profile) return;

    if (!isDockedType(sheetType)) {
      // Docking isn't available at this breakpoint. A remembered `isOpen:
      // true` from a wider viewport shouldn't leak into whatever fallback
      // sheet this action renders as on a cold load — the "dismiss when
      // sheet stops being docked" effect below can't catch this itself,
      // since `usePrevious` has nothing to compare against on first render.
      // Gated to that one-shot case: previousSheetType is only null on
      // mount, so a later deliberate reopen isn't clobbered right back shut
      if (previousSheetType == null && (actionState?.docking === ThDockingKeys.start || actionState?.docking === ThDockingKeys.end) && actionState?.isOpen) {
        dispatch(setActionOpen({
          key: key,
          isOpen: false,
          profile
        }));
      }
      return;
    }

    // The slot was never claimed: docking comes from prefs, or the action was
    // opened at a breakpoint where it rendered as another sheet type.
    // Displacing a non-reserved occupant is allowed — dockAction is the one
    // place that arbitrates reservation
    if (effectiveDocking == null) {
      dispatch(dockAction({
        key: key,
        dockingKey: sheetType === ThSheetTypes.dockedStart ? ThDockingKeys.start : ThDockingKeys.end,
        profile: profile,
        reserved
      }));
    }

    // isOpen is only undetermined here for an action that's never been
    // docked before (nothing to remember), or a stale transient whose
    // persisted `false` belonged to a sheet type it no longer has. Both
    // fall back to `docked.reopenOnLoad`; any other persisted value is the
    // user's own choice and is left untouched
    if (actionState?.isOpen == null || hasStaleTransient) {
      dispatch(setActionOpen({
        key: key,
        isOpen: reopenOnLoadPref,
        profile
      }));
    }
  }, [effectiveDocking, hasStaleTransient, actionState?.isOpen, actionState?.docking, sheetType, previousSheetType, key, dispatch, profile, reserved, reopenOnLoadPref]);

  // Dismiss when the sheet stops being docked. `docking` is left pointing at
  // the slot, so it is reclaimed for free once the slot comes back
  useEffect(() => {
    // This was not dismissed on breakpoint change, but by the user
    if (effectiveDocking === ThDockingKeys.transient) return;

    // What the user docked has the upper hand: losing the slot to a breakpoint
    // falls back to the sheet pref but stays open. Only a reserved occupant
    // overrides that choice, since it can’t be displaced
    if (effectiveDocking === ThDockingKeys.start && !isSlotLockedByOther(ThDockingKeys.start)) return;
    if (effectiveDocking === ThDockingKeys.end && !isSlotLockedByOther(ThDockingKeys.end)) return;

    if (!previousSheetType || !isDockedType(previousSheetType) || isDockedType(sheetType)) return;
    if (!breakpoint || !profile) return;

    dispatch(setActionOpen({
      key: key,
      isOpen: false,
      profile
    }));
  }, [dispatch, key, sheetType, previousSheetType, breakpoint, profile, effectiveDocking, isSlotLockedByOther]);

  // Sync action docking property with profile dock state when profile changes.
  // The slot is authoritative here: it can already name this action while the
  // action's own `docking` still belongs to the profile we came from
  useEffect(() => {
    if (!profile || !dock) return;

    const startSlot = dock[ThDockingKeys.start];
    const endSlot = dock[ThDockingKeys.end];
    const isDockedInStart = startSlot?.actionKey === key;
    const isDockedInEnd = endSlot?.actionKey === key;
    const wasAlreadyDockedInStart = actionState?.docking === ThDockingKeys.start;
    const wasAlreadyDockedInEnd = actionState?.docking === ThDockingKeys.end;

    // Re-dispatch whenever the slot assignment changes, or when it doesn't
    // but the persisted `reserved` flag has drifted from the current pref
    // (e.g. `docked.reserved` was toggled in config for an action that's
    // already sitting in its slot)
    if (isDockedInStart && (!wasAlreadyDockedInStart || startSlot?.reserved !== reserved)) {
      dispatch(dockAction({
        key: key,
        dockingKey: ThDockingKeys.start,
        profile: profile,
        reserved
      }));
      // isOpen is only undetermined here for an action that's never been
      // docked before in this profile; anything else (true or false) is
      // the user's own choice and stays untouched
      if (!wasAlreadyDockedInStart && actionState?.isOpen == null && reopenOnLoadPref) {
        dispatch(setActionOpen({
          key: key,
          isOpen: true,
          profile
        }));
      }
    } else if (isDockedInEnd && (!wasAlreadyDockedInEnd || endSlot?.reserved !== reserved)) {
      dispatch(dockAction({
        key: key,
        dockingKey: ThDockingKeys.end,
        profile: profile,
        reserved
      }));
      // isOpen is only undetermined here for an action that's never been
      // docked before in this profile; anything else (true or false) is
      // the user's own choice and stays untouched
      if (!wasAlreadyDockedInEnd && actionState?.isOpen == null && reopenOnLoadPref) {
        dispatch(setActionOpen({
          key: key,
          isOpen: true,
          profile
        }));
      }
    }
  }, [profile, dock, actionState?.docking, actionState?.isOpen, key, dispatch, reserved, reopenOnLoadPref]);

  return {
    getDocker,
    sheetType
  }
}
