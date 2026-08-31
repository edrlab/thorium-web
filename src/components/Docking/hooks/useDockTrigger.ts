"use client";

import { useCallback } from "react";

import { ThDockingKeys } from "@/preferences/models";

import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { dockAction } from "@/lib/actionsReducer";

import { useDockReservation } from "./useDockReservation";

export const useDockTrigger = (slot: ThDockingKeys.start | ThDockingKeys.end, associatedKey?: string) => {
  const profile = useAppSelector(state => state.reader.profile);
  const actionsMap = useAppSelector(state => profile ? state.actions.keys[profile] : undefined);
  const actions = useActions(actionsMap || {});
  const { reserved, isSlotLockedByOther } = useDockReservation(associatedKey ?? "");
  const dispatch = useAppDispatch();

  const isDisabled = actions.whichDocked(associatedKey) === slot || isSlotLockedByOther(slot);

  const handlePress = useCallback(() => {
    if (associatedKey && profile) {
      dispatch(dockAction({
        key: associatedKey,
        dockingKey: slot,
        profile: profile,
        reserved
      }))
    }
  }, [dispatch, associatedKey, profile, reserved, slot]);

  return { isDisabled, handlePress };
};
