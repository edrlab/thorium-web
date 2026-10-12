"use client";

import volumeStyles from "./assets/styles/thorium-web.volume.module.css";

import { StatefulActionContainerProps } from "../../../Actions/models/actions";
import { StatefulVolumeContainer } from "../../../Playback/actions/Volume/StatefulVolumeContainer";

export const StatefulAudioVolumeContainer = (props: StatefulActionContainerProps) => {
  return (
    <StatefulVolumeContainer
      { ...props }
      className={ volumeStyles.wrapper }
      compounds={ {
        slider: { className: volumeStyles.slider },
        sliderTrack: { className: volumeStyles.sliderTrack },
        sliderThumb: { className: volumeStyles.sliderThumb }
      } }
    />
  );
};
