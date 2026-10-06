"use client";

import { useMemo } from "react";

import VolumeUpIcon from "./assets/icons/volume_up.svg";
import VolumeDownIcon from "./assets/icons/volume_down.svg";
import VolumeMuteIcon from "./assets/icons/volume_mute.svg";
import VolumeOffIcon from "./assets/icons/volume_off.svg";

import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import volumeStyles from "./assets/styles/thorium-web.volume.module.css";

import { useI18n } from "@/i18n/useI18n";
import { useVolumeAction } from "./hooks/useVolumeAction";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

import { isIOSish } from "@/core/Helpers/getPlatform";

export const StatefulAudioVolumeTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const { actionsKeys } = useActionsPreferences();
  const { actionKey, range, volume, isDisabled } = useVolumeAction();

  const shortcut = actionsKeys[actionKey]?.shortcut;

  const dispatch = useAppDispatch();

  const VolumeIcon = useMemo(() => {
    if (volume === 0) return VolumeOffIcon;
    const max = Math.max(...range);
    if (volume <= max / 3) return VolumeMuteIcon;
    if (volume <= (max / 3) * 2) return VolumeDownIcon;
    return VolumeUpIcon;
  }, [volume, range]);

  if (isIOSish()) return null;

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.playback.preferences.audio.volume") }
      shortcut={ shortcut }
      placement="top"
      onPress={ () => {
        if (profile) {
          dispatch(toggleActionOpen({ key: actionKey, profile }));
        }
      } }
      isDisabled={ isDisabled }
      className={ volumeStyles.button }
    >
      <VolumeIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
