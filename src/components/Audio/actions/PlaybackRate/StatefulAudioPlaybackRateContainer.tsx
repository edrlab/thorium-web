"use client";

import playbackStyles from "./assets/styles/thorium-web.playbackRate.module.css";

import { StatefulActionContainerProps } from "../../../Actions/models/actions";
import { StatefulPlaybackRateContainer } from "../../../Playback/actions/PlaybackRate/StatefulPlaybackRateContainer";

export const StatefulAudioPlaybackRateContainer = (props: StatefulActionContainerProps) => {
  return (
    <StatefulPlaybackRateContainer
      { ...props }
      className={ playbackStyles.wrapper }
      compounds={ {
        slider: { className: playbackStyles.slider },
        numberField: { className: playbackStyles.numberField }
      } }
    />
  );
};
