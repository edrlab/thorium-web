import { useMemo } from "react";

import { IKeyboardPeripheralsConfig } from "@readium/navigator";
import { ThActionsKeys } from "@/preferences/models";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { useFilteredPreferenceKeys } from "@/preferences/hooks/useFilteredPreferenceKeys";
import { useActionComponentStatus } from "../../Actions/hooks/useActionComponentStatus";

import { NavPeripheralType, toActionPeripheralType, toDockingPeripheralType, ZOOM_IN_KEY_COMBOS, ZOOM_OUT_KEY_COMBOS } from "@/helpers/peripherals";

export const useWebPubKeyboardPeripherals = (): IKeyboardPeripheralsConfig => {
  const { actionsKeys, docking } = useActionsPreferences();
  const { isSupported: isFullscreenSupported } = useFullscreen();
  const { webPubActionKeys } = useFilteredPreferenceKeys();

  const { isComponentAvailable: isFullscreenAvailable }     = useActionComponentStatus({ actionKey: ThActionsKeys.fullscreen,      orderArray: webPubActionKeys, additionalCondition: isFullscreenSupported });
  const { isComponentAvailable: isTocAvailable }            = useActionComponentStatus({ actionKey: ThActionsKeys.toc,             orderArray: webPubActionKeys });
  const { isComponentAvailable: isSettingsAvailable }       = useActionComponentStatus({ actionKey: ThActionsKeys.settings,        orderArray: webPubActionKeys });
  const { isComponentAvailable: isJumpToPositionAvailable } = useActionComponentStatus({ actionKey: ThActionsKeys.jumpToPosition,  orderArray: webPubActionKeys });

  return useMemo(() => {
    const actionAvailability: Record<string, boolean> = {
      [ThActionsKeys.fullscreen]:      isFullscreenAvailable,
      [ThActionsKeys.toc]:             isTocAvailable,
      [ThActionsKeys.settings]:        isSettingsAvailable,
      [ThActionsKeys.jumpToPosition]:  isJumpToPositionAvailable,
    };

    const config: IKeyboardPeripheralsConfig = [
      { type: NavPeripheralType.zoomIn,  keyCombos: [...ZOOM_IN_KEY_COMBOS]  },
      { type: NavPeripheralType.zoomOut, keyCombos: [...ZOOM_OUT_KEY_COMBOS] },
    ];

    for (const [key, tokens] of Object.entries(actionsKeys)) {
      const shortcut = tokens?.shortcut;
      const isAvailable = actionAvailability[key] ?? true;
      if (shortcut && isAvailable) config.push({ type: toActionPeripheralType(key), keyCombos: shortcut.keyCombos });
    }

    for (const [key, tokens] of Object.entries(docking.keys)) {
      if (tokens?.shortcut) config.push({ type: toDockingPeripheralType(key), keyCombos: tokens.shortcut.keyCombos });
    }

    return config;
  }, [actionsKeys, docking.keys, isFullscreenAvailable, isTocAvailable, isSettingsAvailable, isJumpToPositionAvailable]);
};
