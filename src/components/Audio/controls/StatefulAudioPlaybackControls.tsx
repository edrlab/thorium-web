"use client";

import audioStyles from "./assets/styles/thorium-web.audioPlayback.module.css";

import { StatefulPreviousButton } from "./StatefulPreviousButton";
import { StatefulSkipBackwardButton } from "../../Playback/controls/StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "../../Playback/controls/StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "../../Playback/controls/StatefulSkipForwardButton";
import { StatefulNextButton } from "./StatefulNextButton";

import { ThPlaybackControls } from "@/core/Components/Playback/ThPlaybackControls";

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
      skipBackward={ <StatefulSkipBackwardButton className={ audioStyles.audioSkipBackwardButton } isDisabled={ !isTrackReady || isStalled } /> }
      playPause={ <StatefulPlayPauseButton className={ audioStyles.audioPlayPauseButton } isDisabled={ !isTrackReady || isStalled } /> }
      skipForward={ <StatefulSkipForwardButton className={ audioStyles.audioSkipForwardButton } isDisabled={ !isTrackReady || isStalled } /> }
      next={ <StatefulNextButton isDisabled={ !isTrackReady || isStalled } /> }
    />
  );
};
