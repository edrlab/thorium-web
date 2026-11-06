"use client";

import volumeStyles from "./assets/styles/thorium-web.readAlongVolume.module.css";

import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { StatefulVolumeTrigger } from "../../../Playback/actions/Volume/StatefulVolumeTrigger";

export const StatefulReadAlongVolumeTrigger = (props: StatefulActionTriggerProps) => {
  return <StatefulVolumeTrigger { ...props } className={ volumeStyles.button } />;
};
