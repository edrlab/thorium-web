import { Ref } from "react";

import styles from "./assets/styles/thorium-web.audioCover.module.css";

import MusicNoteIcon from "./assets/icons/music_note.svg";
import SyncIcon from "./assets/icons/sync.svg";

import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

import { useCoverUrlResolver } from "@/core/Hooks/useCoverUrlResolver";

interface StatefulAudioCoverProps {
  ref?: Ref<HTMLElement>;
  coverUrl?: string;
  title?: string;
}

export function StatefulAudioCover({ ref, coverUrl, title }: StatefulAudioCoverProps) {
  const { t } = useI18n();
  const resolveCoverUrl = useCoverUrlResolver();
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);

  const showSyncOverlay = !isTrackReady || isStalled;

  return (
    <figure ref={ ref } className={ styles.audioCoverSection }>
      { coverUrl ? (
        <img
          src={ resolveCoverUrl(coverUrl) }
          alt={ title || t("audio.player.coverAlt") }
          className={ styles.audioCoverImage }
          crossOrigin="anonymous"
        />
      ) : (
        <div className={ styles.audioCoverPlaceholder }>
          { showSyncOverlay ? (
            <SyncIcon className={ styles.audioCoverSyncIcon } aria-hidden="true" />
          ) : (
            <MusicNoteIcon />
          ) }
        </div>
      ) }
      { coverUrl && showSyncOverlay && (
        <div className={ styles.audioCoverSyncOverlay } aria-hidden="true">
          <SyncIcon className={ styles.audioCoverSyncIcon } />
        </div>
      ) }
    </figure>
  );
}
