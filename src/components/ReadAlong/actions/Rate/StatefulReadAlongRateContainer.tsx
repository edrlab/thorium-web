"use client";

import rateStyles from "./assets/styles/thorium-web.readAlongRate.module.css";

import { StatefulActionContainerProps } from "../../../Actions/models/actions";
import { StatefulPlaybackRateContainer } from "../../../Playback/actions/PlaybackRate/StatefulPlaybackRateContainer";

export const StatefulReadAlongRateContainer = (props: StatefulActionContainerProps) => {
  return (
    <StatefulPlaybackRateContainer
      { ...props }
      className={ rateStyles.wrapper }
      compounds={ {
        slider: { className: rateStyles.slider },
        numberField: { className: rateStyles.numberField }
      } }
    />
  );
};
