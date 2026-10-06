"use client";

import { useCallback } from "react";

import { ThSettingsRangeVariant } from "@/preferences/models";
import { StatefulSliderWithPresets } from "../../../Settings/StatefulSliderWithPresets";
import { ThSlider } from "@/core/Components/Settings/ThSlider";
import { ThNumberField } from "@/core/Components/Settings/ThNumberField";
import { StatefulActionContainerProps } from "../../../Actions/models/actions";

import playbackStyles from "./assets/styles/thorium-web.playbackRate.module.css";

import { useI18n } from "@/i18n/useI18n";
import { usePlaybackRateAction } from "./hooks/usePlaybackRateAction";
import { useDocking } from "../../../Docking/hooks/useDocking";
import { StatefulSheetWrapper } from "@/components/Sheets/StatefulSheetWrapper";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioPlaybackRateContainer = ({ triggerRef, placement = "top" }: StatefulActionContainerProps) => {
  const { actionKey, config, range, presets, playbackRate, updatePlaybackRate: updatePreference } = usePlaybackRateAction();
  const profile = useAppSelector(state => state.reader.profile);
  const isOpen = useAppSelector(state => profile ? state.actions.keys[profile][actionKey]?.isOpen ?? false : false);

  const { t } = useI18n();
  const dispatch = useAppDispatch();

  const docking = useDocking(actionKey);

  const setOpen = useCallback((open: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ key: actionKey, isOpen: open, profile }));
    }
  }, [dispatch, profile, actionKey]);

  const renderContent = () => {
    if (config.variant === ThSettingsRangeVariant.slider) {
      return (
        <div className={ playbackStyles.slider }>
          <ThSlider
            aria-label={ t("reader.playback.preferences.playbackRate.descriptive") }
            range={ range }
            step={ config.step }
            value={ playbackRate }
            onChange={ (v) => updatePreference(Array.isArray(v) ? v[0] : v) }
          />
        </div>
      );
    }

    if (config.variant === ThSettingsRangeVariant.numberField) {
      return (
        <div className={ playbackStyles.numberField }>
          <ThNumberField
            aria-label={ t("reader.playback.preferences.playbackRate.descriptive") }
            range={ range }
            step={ config.step }
            value={ playbackRate }
            onChange={ updatePreference }
          />
        </div>
      );
    }

    // Default: sliderWithPresets
    return (
      <div className={ playbackStyles.slider }>
        <StatefulSliderWithPresets
          standalone
          label={ t("reader.playback.preferences.playbackRate.descriptive") }
          presets={ presets || [] }
          formatValue={ (v) => `${v}×` }
          value={ playbackRate }
          onChange={ (v) => updatePreference(Array.isArray(v) ? v[0] : v) }
          range={ range }
          step={ config.step }
          onEscape={ () => setOpen(false) }
        />
      </div>
    );
  };

  return (
    <StatefulSheetWrapper
      sheetType={ docking.sheetType }
      sheetProps={ {
        id: actionKey,
        triggerRef,
        heading: t("reader.playback.preferences.playbackRate.descriptive"),
        className: playbackStyles.wrapper,
        placement,
        isOpen,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
      } }
    >
      { renderContent() }
    </StatefulSheetWrapper>
  );
};
