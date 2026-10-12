"use client";

import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";

import ReadAlongIcon from "./assets/icons/text_to_speech.svg";

import { ThPublicationMetadata } from "@/core/Components/Playback/ThPublicationMetadata";
import { ThPlaybackControls } from "@/core/Components/Playback/ThPlaybackControls";
import { StatefulCover } from "../Playback/StatefulCover";
import { StatefulSkipBackwardButton } from "../Playback/controls/StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "../Playback/controls/StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "../Playback/controls/StatefulSkipForwardButton";
import { StatefulReadAlongMediaActions } from "./StatefulReadAlongMediaActions";

import { useNavigator } from "@/core/Navigator";
import { usePlayPauseFocus } from "./Hooks/usePlayPauseFocus";
import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

import { PLAY_PAUSE_ID } from "./helpers/playPauseId";

export const StatefulReadAlongPlayer = () => {
  const { t } = useI18n();
  const { readAloud } = useNavigator();
  const metadata = useAppSelector(state => state.readAlongPlayer.metadata);
  const progress = useAppSelector(state => state.publication.progress);
  const isLoading = useAppSelector(state => state.readAlongPlayer.status === "loading");

  const isDisabled = !readAloud || isLoading;
  const playPauseRef = usePlayPauseFocus(isDisabled);
  const title = metadata?.title ?? progress?.title ?? "";
  const chapter = progress?.progression?.currentChapter;

  return (
    <div className={ readAlongStyles.player }>
      <div className={ readAlongStyles.playerCover }>
        <StatefulCover
          coverUrl={ metadata?.coverUrl }
          title={ title }
          placeholder={ <ReadAlongIcon /> }
          className={ readAlongStyles.playerCoverFigure }
          compounds={ {
            image: { className: readAlongStyles.playerCoverImage },
            placeholder: { className: readAlongStyles.playerCoverPlaceholder },
            loadingOverlay: { className: readAlongStyles.playerCoverLoadingOverlay },
            loadingIcon: { className: readAlongStyles.playerCoverLoadingIcon }
          } }
        />
      </div>
      <ThPublicationMetadata
        className={ readAlongStyles.playerMetadata }
        title={ title }
        subtitle={ metadata?.subtitle }
        authors={ metadata?.authors }
        order={ ["titleWithSubtitle", "authors"] }
        extra={ chapter && <p className={ readAlongStyles.playerChapter }>{ chapter }</p> }
        compounds={ {
          titleGroup: { className: readAlongStyles.playerMetadataTitleGroup },
          title: { className: readAlongStyles.playerMetadataTitle },
          subtitle: { className: readAlongStyles.playerMetadataSubtitle },
          authors: { className: readAlongStyles.playerMetadataAuthors }
        } }
      />
      <ThPlaybackControls
        className={ readAlongStyles.playerPlaybackControls }
        aria-label={ t("audio.player.controls") }
        skipBackward={ <StatefulSkipBackwardButton className={ readAlongStyles.skipBackwardButton } isDisabled={ isDisabled } /> }
        playPause={ <StatefulPlayPauseButton ref={ playPauseRef } id={ PLAY_PAUSE_ID } className={ readAlongStyles.playPauseButton } isDisabled={ isDisabled } /> }
        skipForward={ <StatefulSkipForwardButton className={ readAlongStyles.skipForwardButton } isDisabled={ isDisabled } /> }
      />
      <StatefulReadAlongMediaActions />
    </div>
  );
};
