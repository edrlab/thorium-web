"use client";

import volumeStyles from "./assets/styles/thorium-web.volume.module.css";

import { StatefulActionContainerProps } from "../../../Actions/models/actions";
import { StatefulVolumeContainer } from "../../../Playback/actions/Volume/StatefulVolumeContainer";

import { isIOSish } from "@/core/Helpers/getPlatform";

export const StatefulAudioVolumeContainer = (props: StatefulActionContainerProps) => {
  // iOS ignores media element volume changes
  if (isIOSish()) return null;

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
