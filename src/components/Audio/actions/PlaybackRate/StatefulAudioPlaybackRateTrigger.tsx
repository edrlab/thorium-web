"use client";

import playbackStyles from "./assets/styles/thorium-web.playbackRate.module.css";

import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { StatefulPlaybackRateTrigger } from "../../../Playback/actions/PlaybackRate/StatefulPlaybackRateTrigger";

export const StatefulAudioPlaybackRateTrigger = (props: StatefulActionTriggerProps) => {
  return (
    <StatefulPlaybackRateTrigger
      { ...props }
      className={ playbackStyles.button }
      compounds={ { label: { className: playbackStyles.label } } }
    />
  );
};
