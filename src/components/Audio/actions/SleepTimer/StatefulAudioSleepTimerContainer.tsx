"use client";

import { useCallback, useState } from "react";

import { Button } from "react-aria-components";
import { FocusScope } from "react-aria";

import { ThSettingsTimerVariant } from "@/preferences/models";
import { ThNumberField } from "@/core/Components/Settings/ThNumberField";
import { ThRadioGroup } from "@/core/Components/Settings/ThRadioGroup";
import { StatefulActionContainerProps } from "../../../Actions/models/actions";

import timerStyles from "./assets/styles/thorium-web.sleepTimer.module.css";

import { useI18n } from "@/i18n/useI18n";
import { useSleepTimerAction } from "./hooks/useSleepTimerAction";
import { useDocking } from "../../../Docking/hooks/useDocking";
import { StatefulSheetWrapper } from "@/components/Sheets/StatefulSheetWrapper";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulAudioSleepTimerContainer = ({ triggerRef, placement = "top" }: StatefulActionContainerProps) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const {
    actionKey,
    config,
    remainingSeconds,
    onTrackEnd,
    onFragmentEnd,
    setRemainingSeconds,
    setOnTrackEnd,
    setOnFragmentEnd
  } = useSleepTimerAction();

  const profile = useAppSelector(state => state.reader.profile);
  const isOpen = useAppSelector(state => {
    if (!profile || !state.actions.keys[profile]) return false;
    return state.actions.keys[profile][actionKey]?.isOpen ?? false;
  });
  const dispatch = useAppDispatch();

  const { t } = useI18n();

  const formatRemaining = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    const min = t("audio.settings.sleepTimer.minutes");
    const sec = t("audio.settings.sleepTimer.seconds");
    if (h > 0) return `${ h }${ t("audio.settings.sleepTimer.hours") } ${ mm }${ min } ${ ss }${ sec }`;
    return `${ mm }${ min } ${ ss }${ sec }`;
  };

  const variant = config.variant;

  const handleCancel = useCallback(() => {
    setRemainingSeconds(null);
    setOnTrackEnd(false);
    setOnFragmentEnd(false);
    if (profile) {
      dispatch(setActionOpen({ key: actionKey, isOpen: false, profile }));
    }
  }, [setRemainingSeconds, setOnTrackEnd, setOnFragmentEnd, dispatch, profile, actionKey]);

  const handleStart = useCallback(() => {
    const totalSeconds = hours * 3600 + minutes * 60;
    if (totalSeconds <= 0) return;
    setRemainingSeconds(totalSeconds);
    if (profile) {
      dispatch(setActionOpen({ key: actionKey, isOpen: false, profile }));
    }
  }, [hours, minutes, setRemainingSeconds, dispatch, profile, actionKey]);

  const handlePresetSelect = useCallback((value: string) => {
    if (value === "endOfResource") {
      setOnTrackEnd(true);
      setOnFragmentEnd(false);
      setRemainingSeconds(null);
    } else if (value === "endOfFragment") {
      setOnTrackEnd(false);
      setOnFragmentEnd(true);
      setRemainingSeconds(null);
    } else {
      setOnTrackEnd(false);
      setOnFragmentEnd(false);
      setRemainingSeconds(Number(value) * 60);
    }
    if (profile) {
      dispatch(setActionOpen({ key: actionKey, isOpen: false, profile }));
    }
  }, [setRemainingSeconds, setOnTrackEnd, setOnFragmentEnd, dispatch, profile, actionKey]);

  const docking = useDocking(actionKey);

  const setOpen = useCallback((open: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ key: actionKey, isOpen: open, profile }));
    }
  }, [dispatch, profile, actionKey]);

  const isActive = remainingSeconds !== null || onTrackEnd || onFragmentEnd;
  const maxHours = (config.variant === ThSettingsTimerVariant.durationField ? config.maxHours : undefined) ?? 23;

  const renderContent = () => {
    if (variant === ThSettingsTimerVariant.presetList && config?.variant === ThSettingsTimerVariant.presetList) {
      const items = config.presets.map(preset => {
        if (preset === "endOfResource") {
          return {
            id: "endOfResource",
            value: "endOfResource",
            label: t("reader.playback.preferences.sleepTimer.presets.endOfResource"),
          };
        } else if (preset === "endOfFragment") {
          return {
            id: "endOfFragment",
            value: "endOfFragment",
            label: t("reader.playback.preferences.sleepTimer.presets.endOfFragment"),
          };
        } else {
          return {
            id: String(preset),
            value: String(preset),
            label: `${ preset } ${ t("audio.settings.sleepTimer.minutes") }`,
          };
        }
      });

      const activeValue = onTrackEnd
        ? "endOfResource"
        : onFragmentEnd
        ? "endOfFragment"
        : remainingSeconds !== null ? String(remainingSeconds / 60) : "";

      return (
        <div className={ timerStyles.durationField }>
          <ThRadioGroup
            aria-label={ t("reader.playback.preferences.sleepTimer.descriptive") }
            value={ activeValue }
            onChange={ handlePresetSelect }
            items={ items }
            compounds={{
              wrapper: { className: timerStyles.listbox },
              radio: { className: timerStyles.listboxItem },
            }}
          />
          { isActive && (
            <Button
              className={ `${ timerStyles.startButton } ${ timerStyles.cancelButton }` }
              onPress={ handleCancel }
            >
              { t("common.actions.cancel") }
            </Button>
          ) }
        </div>
      );
    }

    // durationField variant
    if (isActive && remainingSeconds !== null) {
      return (
        <div className={ timerStyles.durationField }>
          <p className={ timerStyles.remaining }>
            { t("audio.settings.sleepTimer.remaining", { remaining: formatRemaining(remainingSeconds) }) }
          </p>
          <Button
            className={ timerStyles.startButton }
            onPress={ handleCancel }
          >
            { t("common.actions.cancel") }
          </Button>
        </div>
      );
    }

    return (
      <div className={ timerStyles.durationField }>
        <p className={ timerStyles.instruction }>
          { t("audio.settings.sleepTimer.instruction") }
        </p>
        <div className={ timerStyles.inputs }>
          <ThNumberField
            aria-label={ t("audio.settings.sleepTimer.hours") }
            range={ [0, maxHours] }
            step={ 1 }
            value={ hours }
            onChange={ setHours }
            onInputChange={ (raw) => setHours(parseInt(raw) || 0) }
            compounds={{
              group: { className: timerStyles.fieldGroup },
              input: { className: timerStyles.fieldInput }
            }}
          />
          <span className={ timerStyles.unitLabel } aria-hidden="true">
            { t("audio.settings.sleepTimer.hours") }
          </span>
          <ThNumberField
            aria-label={ t("audio.settings.sleepTimer.minutes") }
            range={ [0, 59] }
            step={ 1 }
            value={ minutes }
            onChange={ setMinutes }
            onInputChange={ (raw) => setMinutes(parseInt(raw) || 0) }
            compounds={{
              group: { className: timerStyles.fieldGroup },
              input: { className: timerStyles.fieldInput }
            }}
          />
          <span className={ timerStyles.unitLabel } aria-hidden="true">
            { t("audio.settings.sleepTimer.minutes") }
          </span>
        </div>
        <Button
          className={ timerStyles.startButton }
          isDisabled={ hours === 0 && minutes === 0 }
          onPress={ handleStart }
        >
          { t("audio.settings.sleepTimer.start") }
        </Button>
      </div>
    );
  };

  return (
    <StatefulSheetWrapper
      sheetType={ docking.sheetType }
      sheetProps={ {
        id: actionKey,
        triggerRef,
        heading: t("reader.playback.preferences.sleepTimer.descriptive"),
        className: timerStyles.wrapper,
        placement,
        isOpen,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
      } }
    >
      <FocusScope contain>
        { renderContent() }
      </FocusScope>
    </StatefulSheetWrapper>
  );
};
