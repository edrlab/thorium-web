"use client";

import { useEffect, useState, useRef } from "react";

import { Locator, Publication } from "@readium/shared";
import { DivinaNavigatorListeners, IContentProtectionConfig } from "@readium/navigator";

import { useDivinaPreferencesConfig } from "./usePreferencesConfig";
import { useDivinaKeyboardPeripherals } from "./useDivinaKeyboardPeripherals";
import { useDivinaNavigator, DivinaNavigatorLoadProps } from "@/core/Hooks/Divina/useDivinaNavigator";

interface UseDivinaReaderInitProps {
  container: React.RefObject<HTMLDivElement | null>;
  publication: Publication | null;
  initialPosition: Locator | null;
  listeners: Partial<DivinaNavigatorListeners>;
  contentProtectionConfig?: IContentProtectionConfig;
  onNavigatorReady?: () => void;
  onNavigatorLoaded?: () => void;
  onCleanup?: () => void;
}

export const useDivinaReaderInit = ({
  container,
  publication,
  initialPosition,
  listeners,
  contentProtectionConfig,
  onNavigatorReady,
  onNavigatorLoaded,
  onCleanup,
}: UseDivinaReaderInitProps) => {
  const [navigatorReady, setNavigatorReady] = useState(false);

  const { divinaPreferences } = useDivinaPreferencesConfig();
  const keyboardPeripherals = useDivinaKeyboardPeripherals();

  const { DivinaNavigatorLoad, DivinaNavigatorDestroy } = useDivinaNavigator();
  const isNavigatorLoadedDivina = useRef(false);

  useEffect(() => {
    // Only initialize once, never re-render
    if (!publication || isNavigatorLoadedDivina.current) return;

    // Add container protection
    if (!container.current) {
      console.error("Container ref is not available for navigator initialization");
      return;
    }

    const config: DivinaNavigatorLoadProps = {
      container: container.current,
      publication,
      listeners,
      initialPosition: initialPosition ? new Locator(initialPosition) : undefined,
      preferences: divinaPreferences,
      defaults: {},
      contentProtection: contentProtectionConfig,
      keyboardPeripherals,
    };

    isNavigatorLoadedDivina.current = true;

    // Call onNavigatorReady outside of navigator load
    onNavigatorReady?.();

    // Pass onNavigatorLoaded as the callback to DivinaNavigatorLoad
    DivinaNavigatorLoad(config, () => {
      // Set navigatorReady to true only after navigator actually loads
      setNavigatorReady(true);
      onNavigatorLoaded?.();
    });

    return () => {
      if (isNavigatorLoadedDivina.current) {
        setNavigatorReady(false);
        DivinaNavigatorDestroy(() => {
          isNavigatorLoadedDivina.current = false;
          onCleanup?.();
        });
      }
    };
  }, []);

  return {
    navigatorReady,
  };
};
