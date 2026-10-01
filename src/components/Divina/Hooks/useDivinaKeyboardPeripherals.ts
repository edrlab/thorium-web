import { useMemo } from "react";

import { IKeyboardPeripheralsConfig } from "@readium/navigator";
import { ThActionsKeys, ThSettingsKeys } from "@/preferences/models";

import { useObservableCondition } from "@/core/Hooks/useObservableCondition";
import { useFullscreen } from "@/core/Hooks/useFullscreen";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useFilteredPreferenceKeys } from "@/preferences/hooks/useFilteredPreferenceKeys";
import { useActionComponentStatus } from "../../Actions/hooks/useActionComponentStatus";
import { useSettingsComponentStatus } from "@/components/Settings/hooks/useSettingsComponentStatus";
import { useAppSelector } from "@/lib/hooks";

import {
  NavPeripheralType,
  toActionPeripheralType,
  toDockingPeripheralType,
  ZOOM_IN_KEY_COMBOS,
  ZOOM_OUT_KEY_COMBOS,
  ZOOM_RESET_KEY_COMBOS,
  IMAGE_ZOOM_IN_KEY_COMBOS,
  IMAGE_ZOOM_OUT_KEY_COMBOS,
  IMAGE_ZOOM_RESET_KEY_COMBOS
} from "@/helpers/peripherals";

// Unlike reflowable EPUB, movement keys stay active in scrolled mode:
// the divina navigator implements its own smooth key-driven scrolling.
// Zoom only applies to the paged presenter.
export const useDivinaKeyboardPeripherals = (): IKeyboardPeripheralsConfig => {
  // Mirror usePreferencesConfig's gating: the navigator only receives the
  // scrolled preference when the layout setting is used, so a stale persisted
  // value must not drive the zoom condition out of sync with the presenter
  const isManifestScrolled = useAppSelector(state => state.publication.isManifestScrolled);
  const divinaScrolled = useAppSelector(state => state.divinaSettings.scrolled);
  const { isComponentUsed: isLayoutUsed } = useSettingsComponentStatus({
    settingsKey: ThSettingsKeys.divinaLayout,
    publicationType: "divina",
  });
  const isScroll = isManifestScrolled || (isLayoutUsed ? (divinaScrolled ?? false) : false);
  const zoomActive = useObservableCondition(!isScroll);
  const { actionsKeys, docking } = useActionsPreferences();
  const { isSupported: isFullscreenSupported } = useFullscreen();
  const { divinaActionKeys } = useFilteredPreferenceKeys();

  const orderArray = divinaActionKeys;

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
      { type: NavPeripheralType.progressForward,  keyCombos: [{ keyCode: 32,              suppressOnInteractiveElement: true }] },
      { type: NavPeripheralType.progressBackward, keyCombos: [{ keyCode: 32, shift: true, suppressOnInteractiveElement: true }] },
      { type: NavPeripheralType.moveRight,        keyCombos: [{ keyCode: 39,              suppressOnInteractiveElement: true }] },
      { type: NavPeripheralType.moveLeft,         keyCombos: [{ keyCode: 37,              suppressOnInteractiveElement: true }] },
      { type: NavPeripheralType.moveUp,           keyCombos: [{ keyCode: 38,              suppressOnInteractiveElement: true },
                                                              { keyCode: 33,              suppressOnInteractiveElement: true }] },
      { type: NavPeripheralType.moveDown,         keyCombos: [{ keyCode: 40,              suppressOnInteractiveElement: true },
                                                              { keyCode: 34,              suppressOnInteractiveElement: true }] },
      { type: NavPeripheralType.moveHome,         keyCombos: [{ keyCode: 36,              suppressOnInteractiveElement: true }] },
      { type: NavPeripheralType.moveEnd,          keyCombos: [{ keyCode: 35,              suppressOnInteractiveElement: true }] },
      { type: NavPeripheralType.zoomIn,           keyCombos: [
        ...ZOOM_IN_KEY_COMBOS.map(c => ({ ...c, condition: zoomActive })),
        ...IMAGE_ZOOM_IN_KEY_COMBOS.map(c => ({ ...c, suppressOnInteractiveElement: true, condition: zoomActive })),
      ] },
      { type: NavPeripheralType.zoomOut,          keyCombos: [
        ...ZOOM_OUT_KEY_COMBOS.map(c => ({ ...c, condition: zoomActive })),
        ...IMAGE_ZOOM_OUT_KEY_COMBOS.map(c => ({ ...c, suppressOnInteractiveElement: true, condition: zoomActive })),
      ] },
      { type: NavPeripheralType.zoomReset,        keyCombos: [
        ...ZOOM_RESET_KEY_COMBOS.map(c => ({ ...c, condition: zoomActive })),
        ...IMAGE_ZOOM_RESET_KEY_COMBOS.map(c => ({ ...c, suppressOnInteractiveElement: true, condition: zoomActive })),
      ] },
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
  }, [zoomActive, actionsKeys, docking.keys, isFullscreenAvailable, isTocAvailable, isSettingsAvailable, isJumpToPositionAvailable]);
};
