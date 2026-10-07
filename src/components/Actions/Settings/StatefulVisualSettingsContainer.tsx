"use client";

import { useCallback, useEffect, useMemo } from "react";

import {
  defaultSpacingSettingsMain,
  defaultSpacingSettingsSubpanel,
  defaultTextSettingsMain,
  defaultTextSettingsSubpanel,
  useFilteredPreferenceKeys
} from "@/preferences";

import {
  ThActionsKeys,
  ThSettingsContainerKeys,
  ThSheetHeaderVariant,
  ThTextSettingsKeys,
  ThSpacingSettingsKeys,
  ThSettingsKeys
} from "@/preferences/models";
import { StatefulActionContainerProps } from "../models/actions";

import { StatefulSettingsWrapper } from "./StatefulSettingsWrapper";
import { StatefulSpacingGroupContainer } from "../../Settings/Spacing/StatefulSpacingGroup";
import { StatefulTextGroupContainer } from "../../Settings/Text/StatefulTextGroup";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "@/components/Plugins/PluginProvider";
import { useI18n } from "@/i18n/useI18n";

import { setHovering, setSettingsContainer } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulVisualSettingsContainer = ({
  triggerRef
}: StatefulActionContainerProps) => {
  const {
    divinaSettingsKeys,
    fxlSettingsKeys,
    mainSpacingSettingsKeys,
    mainTextSettingsKeys,
    reflowSettingsKeys,
    subPanelSpacingSettingsKeys,
    subPanelTextSettingsKeys,
    webPubSettingsKeys,
  } = useFilteredPreferenceKeys();
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { settingsComponentsMap } = usePlugins();
  const profile = useAppSelector(state => state.reader.profile);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const hasDisplayTransformability = useAppSelector(state => state.publication.hasDisplayTransformability);
  const contains = useAppSelector(state => state.reader.settingsContainer);
  const dispatch = useAppDispatch();

  const settingItems = useMemo(() => {
    return profile === "webPub"
      ? webPubSettingsKeys
      : profile === "divina"
        ? divinaSettingsKeys
        : isFXL
          ? fxlSettingsKeys
          : reflowSettingsKeys
  }, [profile, isFXL, divinaSettingsKeys, fxlSettingsKeys, reflowSettingsKeys, webPubSettingsKeys]);

  const setInitial = useCallback(() => {
    dispatch(setSettingsContainer(ThSettingsContainerKeys.initial));
  }, [dispatch]);

  const close = useCallback(() => {
    if (profile) {
      dispatch(setActionOpen({ key: ThActionsKeys.settings, isOpen: false, profile }));
    }
    dispatch(setHovering(false));
  }, [dispatch, profile]);

  const isTextNested = useCallback((key: string) => {
    const textSettings = [
      mainTextSettingsKeys || defaultTextSettingsMain,
      subPanelTextSettingsKeys || defaultTextSettingsSubpanel,
    ].flat() as string[];

    return textSettings.includes(key);
  }, [mainTextSettingsKeys, subPanelTextSettingsKeys]);

  const isSpacingNested = useCallback((key: string) => {
    const spacingSettings = [
      mainSpacingSettingsKeys || defaultSpacingSettingsMain,
      subPanelSpacingSettingsKeys || defaultSpacingSettingsSubpanel,
    ].flat() as string[];

    return spacingSettings.includes(key);
  }, [mainSpacingSettingsKeys, subPanelSpacingSettingsKeys]);

  const isWebPubDisabled = useCallback((key: string) => {
    if (profile !== "webPub") {
      return false;
    }

    if (key === "zoom") {
      return false;
    }

    if (Object.values(ThTextSettingsKeys).includes(key as ThTextSettingsKeys) ||
        Object.values(ThSpacingSettingsKeys).includes(key as ThSpacingSettingsKeys) ||
        key === ThSettingsKeys.textGroup ||
        key === ThSettingsKeys.spacingGroup) {
      return !hasDisplayTransformability;
    }

    return true;
  }, [profile, hasDisplayTransformability]);

  const renderSettings = useCallback(() => {
    switch (contains) {
      case ThSettingsContainerKeys.text:
        return <StatefulTextGroupContainer />;

      case ThSettingsContainerKeys.spacing:
        return <StatefulSpacingGroupContainer />;

      case ThSettingsContainerKeys.initial:
      default:
        return (
          <>
            { settingItems.length > 0 && settingsComponentsMap
              ? settingItems
                .filter((key) => {
                  if (isTextNested(key) || isSpacingNested(key)) {
                    return false;
                  }

                  if (isWebPubDisabled(key)) {
                    return false;
                  }

                  return true;
                })
                .map((key) => {
                  const match = settingsComponentsMap[key];
                  if (!match) {
                    console.warn(`Action key "${ key }" not found in the plugin registry while present in preferences.`);
                    return null;
                  }
                  return <match.Comp key={ key } { ...match.props } />;
                })
              : <></>
            }
          </>
        );
    }
  }, [settingsComponentsMap, contains, settingItems, isTextNested, isSpacingNested, isWebPubDisabled]);

  const getHeading = useCallback(() => {
    switch (contains) {
      case ThSettingsContainerKeys.text:
        return t("reader.preferences.text");

      case ThSettingsContainerKeys.spacing:
        return t("reader.preferences.spacing.title");

      case ThSettingsContainerKeys.initial:
      default:
        return t("reader.preferences.title");
    }
  }, [contains, t]);

  const getHeaderVariant = useCallback(() => {
    switch (contains) {
      case ThSettingsContainerKeys.text:
        return preferences.settings.text?.header || ThSheetHeaderVariant.close;

      case ThSettingsContainerKeys.spacing:
        return preferences.settings.spacing?.header || ThSheetHeaderVariant.close;

      case ThSettingsContainerKeys.initial:
      default:
        return ThSheetHeaderVariant.close;
    }
  }, [contains, preferences.settings.spacing, preferences.settings.text]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && contains !== ThSettingsContainerKeys.initial) {
        dispatch(setSettingsContainer(ThSettingsContainerKeys.initial));
      }
    };

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [contains, dispatch]);

  return (
    <StatefulSettingsWrapper
      triggerRef={ triggerRef }
      heading={ getHeading() }
      headerVariant={ getHeaderVariant() }
      onClosePress={ contains === ThSettingsContainerKeys.initial ? close : setInitial }
      onReset={ setInitial }
      dismissEscapeKeyClose={ contains !== ThSettingsContainerKeys.initial }
      resetFocus={ contains }
    >
      { renderSettings() }
    </StatefulSettingsWrapper>
  );
};
