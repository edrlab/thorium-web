"use client";

import SnoozeIcon from "./assets/icons/snooze.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import timerStyles from "./assets/styles/thorium-web.sleepTimer.module.css";

import { useI18n } from "@/i18n/useI18n";
import { useSleepTimerAction } from "./hooks/useSleepTimerAction";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export const StatefulAudioSleepTimerTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const { actionsKeys } = useActionsPreferences();
  const { actionKey, remainingSeconds, onTrackEnd, onFragmentEnd, isDisabled } = useSleepTimerAction();

  const shortcut = actionsKeys[actionKey]?.shortcut;

  const dispatch = useAppDispatch();

  const isActive = remainingSeconds !== null || onTrackEnd || onFragmentEnd;

  const formatBadge = (seconds: number): string => {
    if (seconds < 60) return `${ seconds }${ t("audio.settings.sleepTimer.seconds") }`;
    return `${ Math.ceil(seconds / 60) }${ t("audio.settings.sleepTimer.minutes") }`;
  };

  const sleepTimerLabel = (() => {
    if (onTrackEnd) return t("reader.playback.preferences.sleepTimer.presets.endOfResource");
    if (onFragmentEnd) return t("reader.playback.preferences.sleepTimer.presets.endOfFragment");
    return formatBadge(remainingSeconds!);
  })();

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.playback.preferences.sleepTimer.descriptive") }
      shortcut={ shortcut }
      placement="top"
      onPress={ () => {
        if (profile) {
          dispatch(toggleActionOpen({ key: actionKey, profile }));
        }
      } }
      isDisabled={ isDisabled }
      className={ timerStyles.button }
    >
      <SnoozeIcon aria-hidden="true" focusable="false" />
      { isActive && (
        <span className={ timerStyles.label } aria-hidden="true">
          { sleepTimerLabel }
        </span>
      ) }
    </StatefulActionIcon>
  );
};
