"use client";

import audioStyles from "./assets/styles/thorium-web.audioPlayback.module.css";

import { StatefulPreviousButton } from "./StatefulPreviousButton";
import { StatefulSkipBackwardButton } from "./StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "./StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "./StatefulSkipForwardButton";
import { StatefulNextButton } from "./StatefulNextButton";

import { ThPlaybackControls } from "@/core/Components/Audio/ThPlaybackControls";

import { useI18n } from "@/i18n/useI18n";
import { useAppSelector } from "@/lib/hooks";

export const StatefulAudioPlaybackControls = () => {
  const { t } = useI18n();
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);

  return (
    <ThPlaybackControls
      className={ audioStyles.audioControls }
      aria-label={ t("audio.player.controls") }
      previous={ <StatefulPreviousButton isDisabled={ !isTrackReady || isStalled } /> }
      skipBackward={ <StatefulSkipBackwardButton isDisabled={ !isTrackReady || isStalled } /> }
      playPause={ <StatefulPlayPauseButton isDisabled={ !isTrackReady || isStalled } /> }
      skipForward={ <StatefulSkipForwardButton isDisabled={ !isTrackReady || isStalled } /> }
      next={ <StatefulNextButton isDisabled={ !isTrackReady || isStalled } /> }
    />
  );
};
