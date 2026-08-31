"use client";

import { useEffect } from "react";

import { ThDockingKeys } from "@/preferences/models";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { dockAction } from "@/lib/actionsReducer";
import { useActionComponentStatus } from "../../Actions/hooks/useActionComponentStatus";
import { usePlugins } from "../../Plugins/PluginProvider";

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

  // The registry is snapshotted into state and filled in as plugins register,
  // so an empty map means "not loaded yet", never "these actions are gone".
  // Undocking on it would drop a persisted docked action on every reload
  const { actionsComponentsMap, primaryAudioActionsMap } = usePlugins();
  const isRegistryPopulated = Object.keys(actionsComponentsMap || {}).length > 0
    || Object.keys(primaryAudioActionsMap || {}).length > 0;

  useEffect(() => {
    if (!profile || !dock || !isRegistryPopulated) return;

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
  }, [profile, dock, isRegistryPopulated, startActionKey, endActionKey, startStatus.isComponentRegistered, endStatus.isComponentRegistered, dispatch]);
};
