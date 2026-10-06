"use client";

import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";
import audioStyles from "../Audio/controls/assets/styles/thorium-web.audioPlayback.module.css";
import metadataStyles from "../Audio/assets/styles/thorium-web.audioMetadata.module.css";

import { ThPublicationMetadata } from "@/core/Components/Audio/ThPublicationMetadata";
import { ThPlaybackControls } from "@/core/Components/Audio/ThPlaybackControls";
import { StatefulAudioCover } from "../Audio/StatefulAudioCover";
import { StatefulSkipBackwardButton } from "../Audio/controls/StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "../Audio/controls/StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "../Audio/controls/StatefulSkipForwardButton";
import { StatefulReadAlongMediaActions } from "./StatefulReadAlongMediaActions";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

export const StatefulReadAlongPlayer = () => {
  const { t } = useI18n();
  const { readAloud } = useNavigator();
  const metadata = useAppSelector(state => state.readAlongPlayer.metadata);
  const progress = useAppSelector(state => state.publication.progress);
  const isLoading = useAppSelector(state => state.readAlongPlayer.status === "loading");

  const isDisabled = !readAloud || isLoading;
  const title = metadata?.title ?? progress?.title ?? "";
  const chapter = progress?.progression?.currentChapter;

  return (
    <div className={ readAlongStyles.player }>
      <div className={ readAlongStyles.playerCover }>
        <StatefulAudioCover coverUrl={ metadata?.coverUrl } title={ title } />
      </div>
      <ThPublicationMetadata
        className={ metadataStyles.audioMetadata }
        title={ title }
        subtitle={ metadata?.subtitle }
        authors={ metadata?.authors }
        order={ ["titleWithSubtitle", "authors"] }
        extra={ chapter && <p className={ readAlongStyles.playerChapter }>{ chapter }</p> }
        compounds={ {
          title: { className: metadataStyles.audioMetadataTitle },
          subtitle: { className: metadataStyles.audioMetadataSubtitle },
          authors: { className: metadataStyles.audioMetadataAuthors }
        } }
      />
      <ThPlaybackControls
        className={ audioStyles.audioControls }
        aria-label={ t("audio.player.controls") }
        skipBackward={ <StatefulSkipBackwardButton isDisabled={ isDisabled } /> }
        playPause={ <StatefulPlayPauseButton isDisabled={ isDisabled } /> }
        skipForward={ <StatefulSkipForwardButton isDisabled={ isDisabled } /> }
      />
      <StatefulReadAlongMediaActions />
    </div>
  );
};
