"use client";

import SpeedIcon from "./assets/icons/speed.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import playbackStyles from "./assets/styles/thorium-web.playbackRate.module.css";

import { useI18n } from "@/i18n/useI18n";
import { usePlaybackRateAction } from "./hooks/usePlaybackRateAction";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export const StatefulAudioPlaybackRateTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const { actionsKeys } = useActionsPreferences();
  const { actionKey, playbackRate, isDisabled } = usePlaybackRateAction();

  const shortcut = actionsKeys[actionKey]?.shortcut;

  const dispatch = useAppDispatch();

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.playback.preferences.playbackRate.descriptive") }
      shortcut={ shortcut }
      placement="top"
      onPress={ () => {
        if (profile) {
          dispatch(toggleActionOpen({ key: actionKey, profile }));
        }
      } }
      isDisabled={ isDisabled }
      className={ playbackStyles.button }
    >
      <SpeedIcon aria-hidden="true" focusable="false" />
      <span className={ playbackStyles.label } aria-hidden="true">{ playbackRate }×</span>
    </StatefulActionIcon>
  );
};
