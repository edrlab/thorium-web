"use client";

import SpeedIcon from "./assets/icons/speed.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../../../Actions/Triggers/StatefulOverflowMenuItem";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { useI18n } from "@/i18n/useI18n";
import { usePlaybackRateAction } from "./hooks/usePlaybackRateAction";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export interface StatefulPlaybackRateTriggerProps extends StatefulActionTriggerProps {
  className: string;
  compounds: {
    label: { className: string };
  };
}

export const StatefulPlaybackRateTrigger = ({ ref, variant, className, compounds }: StatefulPlaybackRateTriggerProps) => {
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const { actionsKeys } = useActionsPreferences();
  const { actionKey, playbackRate, isDisabled } = usePlaybackRateAction();

  const shortcut = actionsKeys[actionKey]?.shortcut;

  const dispatch = useAppDispatch();

  const toggleOpen = () => {
    if (profile) {
      dispatch(toggleActionOpen({ key: actionKey, profile }));
    }
  };

  if (variant === ThActionsTriggerVariant.menu) {
    return (
      <StatefulOverflowMenuItem
        label={ t("reader.playback.preferences.playbackRate.descriptive") }
        SVGIcon={ SpeedIcon }
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
      tooltipLabel={ t("reader.playback.preferences.playbackRate.descriptive") }
      shortcut={ shortcut }
      placement="top"
      onPress={ toggleOpen }
      isDisabled={ isDisabled }
      className={ className }
    >
      <SpeedIcon aria-hidden="true" focusable="false" />
      <span className={ compounds.label.className } aria-hidden="true">{ playbackRate }×</span>
    </StatefulActionIcon>
  );
};
