"use client";

import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";
import audioStyles from "../Audio/controls/assets/styles/thorium-web.audioPlayback.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { ThMiniPlayer } from "@/core/Components/Audio/ThMiniPlayer";
import { ThPlaybackControls } from "@/core/Components/Audio/ThPlaybackControls";
import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";
import { StatefulSkipBackwardButton } from "../Audio/controls/StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "../Audio/controls/StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "../Audio/controls/StatefulSkipForwardButton";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setReadAlongActive } from "@/lib/readAlongReducer";

export const StatefulReadAlongMiniPlayer = () => {
  const { t } = useI18n();
  const { readAloud } = useNavigator();
  const progress = useAppSelector(state => state.publication.progress);
  const isLoading = useAppSelector(state => state.readAlong.status === "loading");
  const dispatch = useAppDispatch();

  const isDisabled = !readAloud || isLoading;

  return (
    <ThMiniPlayer
      className={ readAlongStyles.miniPlayer }
      heading={ progress?.title || "" }
      subheading={ progress?.progression?.currentChapter }
      controls={
        <ThPlaybackControls
          className={ audioStyles.audioControls }
          aria-label={ t("audio.player.controls") }
          skipBackward={ <StatefulSkipBackwardButton isDisabled={ isDisabled } /> }
          playPause={ <StatefulPlayPauseButton isDisabled={ isDisabled } /> }
          skipForward={ <StatefulSkipForwardButton isDisabled={ isDisabled } /> }
        />
      }
      actions={
        <ThCloseButton
          className={ readerSharedUI.closeButton }
          aria-label={ t("_pendingThoriumLocales.reader.readAlong.close") }
          onPress={ () => dispatch(setReadAlongActive(false)) }
        />
      }
      compounds={ {
        metadata: { className: readAlongStyles.miniPlayerMetadata },
        heading: { className: readAlongStyles.miniPlayerHeading },
        subheading: { className: readAlongStyles.miniPlayerSubheading },
        controls: { className: readAlongStyles.miniPlayerControls },
        actions: { className: readAlongStyles.miniPlayerActions }
      } }
    />
  );
};
