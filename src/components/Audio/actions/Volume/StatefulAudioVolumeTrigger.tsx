"use client";

import volumeStyles from "./assets/styles/thorium-web.volume.module.css";

import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { StatefulVolumeTrigger } from "../../../Playback/actions/Volume/StatefulVolumeTrigger";

import { isIOSish } from "@/core/Helpers/getPlatform";

export const StatefulAudioVolumeTrigger = (props: StatefulActionTriggerProps) => {
  // iOS ignores media element volume changes
  if (isIOSish()) return null;

  return <StatefulVolumeTrigger { ...props } className={ volumeStyles.button } />;
};
