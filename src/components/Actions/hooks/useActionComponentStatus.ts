"use client";

import { useMemo } from "react";
import { usePlugins } from "../../Plugins/PluginProvider";

interface UseActionComponentStatusOptions {
  actionKey: string;
  orderArray?: string[];
  additionalCondition?: boolean;
}

interface ActionComponentStatus {
  isComponentRegistered: boolean;
  isInOrder: boolean;
  isComponentAvailable: boolean;
}

/**
 * Generic hook to check if an action component is registered in the plugin registry,
 * in the provided display order array, and meets any additional conditions.
 * Parallel to useSettingsComponentStatus for settings.
 *
 * @param options - Configuration options for the action component status check
 * @returns Object containing status flags for the action component
 */
export const useActionComponentStatus = (options: UseActionComponentStatusOptions): ActionComponentStatus => {
  const { actionKey, orderArray, additionalCondition } = options;

  const { actionsComponentsMap, primaryAudioActionsMap } = usePlugins();

  return useMemo(() => {
    const isComponentRegistered = !!actionsComponentsMap?.[actionKey] ||
                                  !!primaryAudioActionsMap?.[actionKey];

    const isInOrder = orderArray ? orderArray.includes(actionKey) : true;
    const isComponentAvailable = isComponentRegistered && isInOrder && (additionalCondition ?? true);

    return { isComponentRegistered, isInOrder, isComponentAvailable };
  }, [actionKey, orderArray, additionalCondition, actionsComponentsMap, primaryAudioActionsMap]);
};
