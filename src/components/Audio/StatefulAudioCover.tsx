import { Ref } from "react";

import styles from "./assets/styles/thorium-web.audioCover.module.css";

import MusicNoteIcon from "./assets/icons/music_note.svg";
import SyncIcon from "./assets/icons/sync.svg";

import { ThCover } from "@/core/Components/Audio/ThCover";

import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

import { proxyUrl } from "@/helpers/proxyUrl";

interface StatefulAudioCoverProps {
  ref?: Ref<HTMLElement>;
  coverUrl?: string;
  title?: string;
}

export function StatefulAudioCover({ ref, coverUrl, title }: StatefulAudioCoverProps) {
  const { t } = useI18n();
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);

  return (
    <ThCover
      ref={ ref }
      className={ styles.audioCoverSection }
      src={ coverUrl ? proxyUrl(coverUrl) : undefined }
      alt={ title || t("audio.player.coverAlt") }
      isLoading={ !isTrackReady || isStalled }
      placeholder={ <MusicNoteIcon /> }
      loadingIndicator={ <SyncIcon className={ styles.audioCoverSyncIcon } aria-hidden="true" /> }
      compounds={ {
        image: { className: styles.audioCoverImage, crossOrigin: "anonymous" },
        placeholder: { className: styles.audioCoverPlaceholder },
        loadingOverlay: { className: styles.audioCoverSyncOverlay }
      } }
    />
  );
}
