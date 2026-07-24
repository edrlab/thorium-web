"use client";

import { useEffect } from "react";

import { ThDockingKeys } from "@/preferences/models";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { dockAction } from "@/lib/actionsReducer";
import { useActionComponentStatus } from "../../Actions/hooks/useActionComponentStatus";

/**
 * Reusable hook to clean up stale docked actions.
 * Compares docked actionKeys to available actions and clears any that don't exist.
 */
export const useDockCleanup = (profile: string | undefined) => {
  const dispatch = useAppDispatch();
  const dock = useAppSelector(state => profile ? state.actions.dock[profile] : undefined);

  const startActionKey = dock?.[ThDockingKeys.start]?.actionKey;
  const endActionKey = dock?.[ThDockingKeys.end]?.actionKey;
  
  const startStatus = useActionComponentStatus({ actionKey: startActionKey || "" });
  const endStatus = useActionComponentStatus({ actionKey: endActionKey || "" });

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
};
