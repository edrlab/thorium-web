import { useMemo } from "react";

import { IKeyboardPeripheralsConfig } from "@readium/navigator";
import { ThActionsKeys } from "@/preferences/models";

import { useIsScroll } from "@/hooks";
import { useObservableCondition } from "@/core/Hooks/useObservableCondition";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useFilteredPreferenceKeys } from "@/preferences/hooks/useFilteredPreferenceKeys";
import { useActionComponentStatus } from "../../Actions/hooks/useActionComponentStatus";

import { useAppSelector } from "@/lib/hooks";

import { NavPeripheralType, toActionPeripheralType, toDockingPeripheralType, ZOOM_IN_KEY_COMBOS, ZOOM_OUT_KEY_COMBOS } from "@/helpers/peripherals";

export const useEpubKeyboardPeripherals = (): IKeyboardPeripheralsConfig => {
  const isScroll = useIsScroll();
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const noScroll = useObservableCondition(!isScroll);
  const zoomActive = useObservableCondition(!isFXL);
  const { actionsKeys, docking } = useActionsPreferences();
  const { isSupported: isFullscreenSupported } = useFullscreen();
  const { reflowActionKeys, fxlActionKeys } = useFilteredPreferenceKeys();

  const orderArray = isFXL ? fxlActionKeys : reflowActionKeys;

  const { isComponentAvailable: isFullscreenAvailable }     = useActionComponentStatus({ actionKey: ThActionsKeys.fullscreen,      orderArray, additionalCondition: isFullscreenSupported });
  const { isComponentAvailable: isTocAvailable }            = useActionComponentStatus({ actionKey: ThActionsKeys.toc,             orderArray });
  const { isComponentAvailable: isSettingsAvailable }       = useActionComponentStatus({ actionKey: ThActionsKeys.settings,        orderArray });
  const { isComponentAvailable: isJumpToPositionAvailable } = useActionComponentStatus({ actionKey: ThActionsKeys.jumpToPosition,  orderArray });

  return useMemo(() => {
    const actionAvailability: Record<string, boolean> = {
      [ThActionsKeys.fullscreen]:      isFullscreenAvailable,
      [ThActionsKeys.toc]:             isTocAvailable,
      [ThActionsKeys.settings]:        isSettingsAvailable,
      [ThActionsKeys.jumpToPosition]:  isJumpToPositionAvailable,
    };

    const config: IKeyboardPeripheralsConfig = [
      { type: NavPeripheralType.progressForward,  keyCombos: [{ keyCode: 32,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.progressBackward, keyCombos: [{ keyCode: 32, shift: true, suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveRight,        keyCombos: [{ keyCode: 39,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveLeft,         keyCombos: [{ keyCode: 37,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveUp,           keyCombos: [{ keyCode: 38,              suppressOnInteractiveElement: true, condition: noScroll },
                                                              { keyCode: 33,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveDown,         keyCombos: [{ keyCode: 40,              suppressOnInteractiveElement: true, condition: noScroll },
                                                              { keyCode: 34,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveHome,         keyCombos: [{ keyCode: 36,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.moveEnd,          keyCombos: [{ keyCode: 35,              suppressOnInteractiveElement: true, condition: noScroll }] },
      { type: NavPeripheralType.zoomIn,           keyCombos: ZOOM_IN_KEY_COMBOS.map(c => ({ ...c, condition: zoomActive }))  },
      { type: NavPeripheralType.zoomOut,          keyCombos: ZOOM_OUT_KEY_COMBOS.map(c => ({ ...c, condition: zoomActive })) },
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
  }, [noScroll, zoomActive, actionsKeys, docking.keys, isFullscreenAvailable, isTocAvailable, isSettingsAvailable, isJumpToPositionAvailable]);
};
