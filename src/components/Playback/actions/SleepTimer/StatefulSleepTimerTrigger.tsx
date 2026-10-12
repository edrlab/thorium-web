"use client";

import SnoozeIcon from "./assets/icons/snooze.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../../../Actions/Triggers/StatefulOverflowMenuItem";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { useI18n } from "@/i18n/useI18n";
import { useSleepTimerAction } from "./hooks/useSleepTimerAction";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export interface StatefulSleepTimerTriggerProps extends StatefulActionTriggerProps {
  className: string;
  compounds: {
    label: { className: string };
  };
}

export const StatefulSleepTimerTrigger = ({ ref, variant, className, compounds }: StatefulSleepTimerTriggerProps) => {
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

  const toggleOpen = () => {
    if (profile) {
      dispatch(toggleActionOpen({ key: actionKey, profile }));
    }
  };

  if (variant === ThActionsTriggerVariant.menu) {
    return (
      <StatefulOverflowMenuItem
        label={ t("reader.playback.preferences.sleepTimer.descriptive") }
        SVGIcon={ SnoozeIcon }
        shortcut={ shortcut ?? null }
        id={ actionKey }
        isDisabled={ isDisabled }
        onAction={ toggleOpen }
      />
    );
  }

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.playback.preferences.sleepTimer.descriptive") }
      shortcut={ shortcut }
      placement="top"
      onPress={ toggleOpen }
      isDisabled={ isDisabled }
      className={ className }
    >
      <SnoozeIcon aria-hidden="true" focusable="false" />
      { isActive && (
        <span className={ compounds.label.className } aria-hidden="true">
          { sleepTimerLabel }
        </span>
      ) }
    </StatefulActionIcon>
  );
};
