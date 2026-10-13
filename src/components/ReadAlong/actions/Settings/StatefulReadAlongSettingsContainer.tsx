"use client";

import { useCallback, useEffect } from "react";

import {
  defaultReadAlongHighlightMain,
  defaultReadAlongHighlightSubpanel,
  defaultReadAlongProsodyMain,
  defaultReadAlongProsodySubpanel,
  ThReadAlongActionKeys,
  ThReadAlongSettingsContainerKeys,
  ThSheetHeaderVariant
} from "@/preferences/models";
import { StatefulActionContainerProps } from "../../../Actions/models/actions";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulSheetWrapper } from "../../../Sheets/StatefulSheetWrapper";
import { StatefulReadAlongHighlightGroupContainer } from "../../Settings/Highlight/StatefulReadAlongHighlightGroup";
import { StatefulReadAlongProsodyGroupContainer } from "../../Settings/Prosody/StatefulReadAlongProsodyGroup";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "@/components/Plugins/PluginProvider";
import { useDocking } from "../../../Docking/hooks/useDocking";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setReadAlongSettingsContainer } from "@/lib/readAlongPlayerReducer";

export const StatefulReadAlongSettingsContainer = ({ triggerRef, placement = "top" }: StatefulActionContainerProps) => {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const { settingsComponentsMap } = usePlugins();
  const profile = useAppSelector(state => state.reader.profile);
  const isOpen = useAppSelector(state => profile ? state.actions.keys[profile][ThReadAlongActionKeys.settings]?.isOpen ?? false : false);
  const contains = useAppSelector(state => state.readAlongPlayer.settingsContainer);
  const dispatch = useAppDispatch();

  const docking = useDocking(ThReadAlongActionKeys.settings);

  const settingItems = preferences.readAlong.settings.order;
  const highlightPrefs = preferences.readAlong.settings.highlight;
  const prosodyPrefs = preferences.readAlong.settings.prosody;

  const setOpen = useCallback((value: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ key: ThReadAlongActionKeys.settings, isOpen: value, profile }));
    }
  }, [dispatch, profile]);

  const setInitial = useCallback(() => {
    dispatch(setReadAlongSettingsContainer(ThReadAlongSettingsContainerKeys.initial));
  }, [dispatch]);

  const isGroupNested = useCallback((key: string) => {
    const groupSettings = [
      highlightPrefs?.main || defaultReadAlongHighlightMain,
      highlightPrefs?.subPanel || defaultReadAlongHighlightSubpanel,
      prosodyPrefs?.main || defaultReadAlongProsodyMain,
      prosodyPrefs?.subPanel || defaultReadAlongProsodySubpanel
    ].flat() as string[];

    return groupSettings.includes(key);
  }, [highlightPrefs?.main, highlightPrefs?.subPanel, prosodyPrefs?.main, prosodyPrefs?.subPanel]);

  const renderSettings = useCallback(() => {
    switch (contains) {
      case ThReadAlongSettingsContainerKeys.highlight:
        return <StatefulReadAlongHighlightGroupContainer />;

      case ThReadAlongSettingsContainerKeys.prosody:
        return <StatefulReadAlongProsodyGroupContainer />;

      case ThReadAlongSettingsContainerKeys.initial:
      default:
        return (
          <>
            { settingItems.length > 0 && settingsComponentsMap
              ? settingItems
                .filter((key) => !isGroupNested(key))
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
  }, [settingsComponentsMap, contains, settingItems, isGroupNested]);

  const getHeading = useCallback(() => {
    switch (contains) {
      case ThReadAlongSettingsContainerKeys.highlight:
        return t("_pendingThoriumLocales.reader.readAlong.preferences.highlight.title");

      case ThReadAlongSettingsContainerKeys.prosody:
        return t("_pendingThoriumLocales.reader.readAlong.preferences.prosody.title");

      case ThReadAlongSettingsContainerKeys.initial:
      default:
        return t("_pendingThoriumLocales.reader.readAlong.preferences.title");
    }
  }, [contains, t]);

  const getHeaderVariant = useCallback(() => {
    switch (contains) {
      case ThReadAlongSettingsContainerKeys.highlight:
        return highlightPrefs?.header || ThSheetHeaderVariant.close;

      case ThReadAlongSettingsContainerKeys.prosody:
        return prosodyPrefs?.header || ThSheetHeaderVariant.close;

      case ThReadAlongSettingsContainerKeys.initial:
      default:
        return ThSheetHeaderVariant.close;
    }
  }, [contains, highlightPrefs?.header, prosodyPrefs?.header]);

  useEffect(() => {
    if (!isOpen) setInitial();
  }, [isOpen, setInitial]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && contains !== ThReadAlongSettingsContainerKeys.initial) {
        dispatch(setReadAlongSettingsContainer(ThReadAlongSettingsContainerKeys.initial));
      }
    };

    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [contains, dispatch]);

  return (
    <StatefulSheetWrapper
      sheetType={ docking.sheetType }
      sheetProps={ {
        id: ThReadAlongActionKeys.settings,
        triggerRef,
        heading: getHeading(),
        headerVariant: getHeaderVariant(),
        className: settingsStyles.wrapper,
        placement,
        isOpen,
        onOpenChange: setOpen,
        onClosePress: contains === ThReadAlongSettingsContainerKeys.initial ? () => setOpen(false) : setInitial,
        docker: docking.getDocker(),
        resetFocus: contains,
        scrollTopOnFocus: true,
        dismissEscapeKeyClose: contains !== ThReadAlongSettingsContainerKeys.initial
      } }
    >
      { renderSettings() }
    </StatefulSheetWrapper>
  );
};
