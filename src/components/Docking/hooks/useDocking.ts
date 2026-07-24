"use client";

import { useCallback, useEffect, useState } from "react";

import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThDockingTypes, ThDockingKeys, ThSheetTypes } from "@/preferences/models";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";
import { dockAction, setActionOpen } from "@/lib/actionsReducer";

import { usePrevious } from "@/core/Hooks/usePrevious";
import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { useActionComponentStatus } from "../../Actions/hooks/useActionComponentStatus";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

let dockingMap: Required<BreakpointsMap<ThDockingTypes>> | null = null;

export const useDocking = <T extends string>(key: T) => {
  const preferences = useActionsPreferences();
  const breakpoint = useAppSelector(state => state.theming.breakpoint);
  const profile = useAppSelector(state => state.reader.profile);
  const actionsMap = useAppSelector(state => profile ? state.actions.keys[profile] : undefined);
  const actionState = actionsMap?.[key];
  const dock = useAppSelector(state => profile ? state.actions.dock[profile] : undefined);
  const dispatch = useAppDispatch();

  const actions = useActions(actionsMap || {});
  
  // Check if docked actions still exist in plugin registry
  const startActionKey = dock?.[ThDockingKeys.start]?.actionKey;
  const endActionKey = dock?.[ThDockingKeys.end]?.actionKey;
  const startStatus = useActionComponentStatus({ actionKey: startActionKey || "" });
  const endStatus = useActionComponentStatus({ actionKey: endActionKey || "" });

  if (!dockingMap) {
    dockingMap = makeBreakpointsMap<ThDockingTypes>({
      defaultValue: ThDockingTypes.both, 
      fromEnum: ThDockingTypes, 
      pref: preferences.docking.dock, 
      disabledValue: ThDockingTypes.none 
    });
  }
  const currentDockConfig = breakpoint && dockingMap[breakpoint];
  
  // Use type assertion to tell TypeScript that the key is valid
  const dockablePref = (preferences.actionsKeys[key as keyof typeof preferences.actionsKeys])?.docked?.dockable || ThDockingTypes.none;

  const defaultSheet = (preferences.actionsKeys[key as keyof typeof preferences.actionsKeys])?.sheet?.defaultSheet || ThSheetTypes.popover;

  const sheetMap = makeBreakpointsMap<ThSheetTypes>({
    defaultValue: (preferences.actionsKeys[key as keyof typeof preferences.actionsKeys])?.sheet?.defaultSheet || ThSheetTypes.popover,
    fromEnum: ThSheetTypes,
    pref: (preferences.actionsKeys[key as keyof typeof preferences.actionsKeys])?.sheet?.breakpoints
  });
  const sheetPref = breakpoint && sheetMap[breakpoint] || defaultSheet;

  const [sheetType, setSheetType] = useState<ThSheetTypes>(defaultSheet);
  const previousSheetType = usePrevious(sheetType);

  // Checks whether the action can be docked: its pref should match the docking pref
  const canBeDocked = useCallback((slot: ThDockingTypes.start | ThDockingTypes.end) => {
      return (currentDockConfig === slot || currentDockConfig === ThDockingTypes.both) 
          && (dockablePref === slot || dockablePref === ThDockingTypes.both);
  }, [currentDockConfig, dockablePref]);

  // Checks whether the sheet pref is of Dock type 
  const isDockedSheetPref = useCallback((type?: ThSheetTypes.dockedStart | ThSheetTypes.dockedEnd) => {
    if (type) {
      return sheetPref === type;
    } else {
      return sheetPref === ThSheetTypes.dockedStart || sheetPref === ThSheetTypes.dockedEnd
    }
  }, [sheetPref]);
  
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
          // We already handled both cases for none 
          dockerKeys.push(dockingKey);
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
  }, [preferences.docking.displayOrder, currentDockConfig, sheetPref, dockablePref, canBeDocked]);

  const getSheetType = useCallback(() => {
    // Protect against null breakpoint during initialization
    if (!breakpoint) {
      return sheetType;
    }
    
    // First check the dockable pref is none to return early
    if (dockablePref === ThDockingTypes.none) {
      // Sheet is of docked type, we return the default
      if (isDockedSheetPref()) {
        return defaultSheet;
      } else {
        // Sheet pref is not of docked type, we can return it
        return sheetPref;
      }
    };

    // We now need to check whether the user has docked the action themselves
    // ActionsReducer should has made sure there is no conflict to handle here 
    // by updating states of actions on docking
    switch (actionState?.docking) {
      
      // if action.docking is transient we need to check the pref, 
      // it can be docked and in that case we need to pick the default
      case ThDockingKeys.transient:
        if (isDockedSheetPref()) {
          return defaultSheet;
        } else {
          return sheetPref;
        }
      
      // If action.docking is set to start/end then we check the docking slot is available
      case ThDockingKeys.start:
        if (canBeDocked(ThDockingTypes.start)) {
          return ThSheetTypes.dockedStart;
        } else {
          // if the pref is not docked start, return the pref 
          // else return the default
          if (!isDockedSheetPref(ThSheetTypes.dockedStart)) {
            return sheetPref;
          } else {
            return defaultSheet;
          }
        }

      case ThDockingKeys.end:
        if (canBeDocked(ThDockingTypes.end)) {
          return ThSheetTypes.dockedEnd;
        } else {
          // if the pref is not docked end, return the pref 
          // else return the default
          if (!isDockedSheetPref(ThSheetTypes.dockedEnd)) {
            return sheetPref;
          } else {
            return defaultSheet;
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
            return defaultSheet;
          }
        } else if (isDockedSheetPref(ThSheetTypes.dockedEnd)) {
          if (canBeDocked(ThDockingTypes.end)) {
            return ThSheetTypes.dockedEnd;
          } else {
            return defaultSheet;
          }
        } else {
          return sheetPref;
        }
      default:
        return defaultSheet;
    }
  }, [dockablePref, sheetPref, defaultSheet, actionState?.docking, canBeDocked, isDockedSheetPref, breakpoint, sheetType]);

  // When docking or breakpoints-related prefs change, get the correct sheet type
  useEffect(() => {
    setSheetType(getSheetType());
  }, [sheetPref, currentDockConfig, actionState?.docking, getSheetType]);

  // Dismiss/Close when sheetType has changed from docked to transient
  useEffect(() => {
    // This was not dismissed on breakpoint change, but by the user
    if (actionState?.docking === ThDockingKeys.transient) return;

    if (sheetType !== ThSheetTypes.dockedStart && sheetType !== ThSheetTypes.dockedEnd) {
      if (previousSheetType === ThSheetTypes.dockedStart || previousSheetType === ThSheetTypes.dockedEnd) {
        if (profile) {
          dispatch(setActionOpen({
            key: key,
            isOpen: false,
            profile
          }));
        }
      }
    }
  }, [dispatch, key, sheetType, previousSheetType, actionState?.docking, profile]);

  // on mount, check whether we should update states for docked sheets from pref
  useEffect(() => {
    if (actionState?.isOpen == null && profile) {
      if (sheetType === ThSheetTypes.dockedStart) {
        dispatch(dockAction({
          key: key,
          dockingKey: ThDockingKeys.start,
          profile: profile
        }));
        dispatch(setActionOpen({
          key: key,
          isOpen: true,
          profile
        }));
      } else if (sheetType === ThSheetTypes.dockedEnd) {
        dispatch(dockAction({
          key: key,
          dockingKey: ThDockingKeys.end,
          profile: profile
        }));
        dispatch(setActionOpen({
          key: key,
          isOpen: true,
          profile
        }));
      }
    }
  }, [actionState?.isOpen, sheetType, key, dispatch, profile]);

  // Edge case where the sheet has been opened/closed and
  // is of dockable type, but the dock panel is not populated
  // e.g. action was mounted as a different type of sheet (breakpoint),
  // and opened/closed. If the user resizes the window (another breakpoint) 
  // but we don’t dispatch docking, then it can’t be displayed 
  // since the docking slot has never been populated.
  useEffect(() => {
    // Action has been opened/closed by user
    // but it’s not been manually docked, 
    // which means the pref is used but 
    // has not be instantiated yet, and 
    // couldn’t be on first mount because
    // a different type was used in prefs
    if (actionState?.isOpen != null && actionState?.docking == null && profile) {
      if (sheetType === ThSheetTypes.dockedStart) {
        // Check if the action is docked in practice
        // if it isn’t dispatch docking of the action
        const dockingKey = actions.whichDocked(key);
        if (dockingKey !== ThDockingKeys.start) {
          dispatch(dockAction({
            key: key,
            dockingKey: ThDockingKeys.start,
            profile: profile
          }));
        }
      } else if (sheetType === ThSheetTypes.dockedEnd) {
        // Check if the action is docked in practice
        // if it isn’t dispatch docking of the action
        const dockingKey = actions.whichDocked(key);
        if (dockingKey !== ThDockingKeys.end) {
          dispatch(dockAction({
            key: key,
            dockingKey: ThDockingKeys.end,
            profile: profile
          }));
        }
      }
    }
  }, [dispatch, key, sheetType, actionState?.isOpen, actionState?.docking, actions, profile]);

  // Sync action docking property with profile dock state when profile changes
  useEffect(() => {
    if (profile && dock) {
      const isDockedInStart = dock[ThDockingKeys.start]?.actionKey === key;
      const isDockedInEnd = dock[ThDockingKeys.end]?.actionKey === key;
      
      if (isDockedInStart && actionState?.docking !== ThDockingKeys.start) {
        dispatch(dockAction({
          key: key,
          dockingKey: ThDockingKeys.start,
          profile: profile
        }));
        // Restore isOpen state if action was docked
        if (actionState?.isOpen === false) {
          dispatch(setActionOpen({
            key: key,
            isOpen: true,
            profile
          }));
        }
      } else if (isDockedInEnd && actionState?.docking !== ThDockingKeys.end) {
        dispatch(dockAction({
          key: key,
          dockingKey: ThDockingKeys.end,
          profile: profile
        }));
        // Restore isOpen state if action was docked
        if (actionState?.isOpen === false) {
          dispatch(setActionOpen({
            key: key,
            isOpen: true,
            profile
          }));
        }
      }
    }
  }, [profile, dock, actionState?.docking, actionState?.isOpen, key, dispatch]);

  // Clean up stale docked actions that no longer exist in plugin registry
  useEffect(() => {
    if (!profile || !dock) return;

    if (startActionKey && !startStatus.isComponentRegistered) {
      dispatch(dockAction({
        key: startActionKey,
        dockingKey: ThDockingKeys.transient,
        profile
      }));
    }

    if (endActionKey && !endStatus.isComponentRegistered) {
      dispatch(dockAction({
        key: endActionKey,
        dockingKey: ThDockingKeys.transient,
        profile
      }));
    }
  }, [profile, dock, startActionKey, endActionKey, startStatus.isComponentRegistered, endStatus.isComponentRegistered, dispatch]);

  return {
    getDocker,
    sheetType
  }
}