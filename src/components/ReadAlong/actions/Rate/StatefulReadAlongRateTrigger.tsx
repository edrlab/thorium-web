"use client";

import rateStyles from "./assets/styles/thorium-web.readAlongRate.module.css";

import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { StatefulPlaybackRateTrigger } from "../../../Playback/actions/PlaybackRate/StatefulPlaybackRateTrigger";

export const StatefulReadAlongRateTrigger = (props: StatefulActionTriggerProps) => {
  return (
    <StatefulPlaybackRateTrigger
      { ...props }
      className={ rateStyles.button }
      compounds={ { label: { className: rateStyles.label } } }
    />
  );
};
