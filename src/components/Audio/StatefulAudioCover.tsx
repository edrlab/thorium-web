import { Ref } from "react";

import styles from "./assets/styles/thorium-web.audioCover.module.css";

import MusicNoteIcon from "./assets/icons/music_note.svg";

import { StatefulCover } from "../Playback/StatefulCover";

interface StatefulAudioCoverProps {
  ref?: Ref<HTMLElement>;
  coverUrl?: string;
  title?: string;
}

export const StatefulAudioCover = ({ ref, coverUrl, title }: StatefulAudioCoverProps) => {
  return (
    <StatefulCover
      ref={ ref }
      coverUrl={ coverUrl }
      title={ title }
      placeholder={ <MusicNoteIcon /> }
      className={ styles.audioCoverSection }
      compounds={ {
        image: { className: styles.audioCoverImage },
        placeholder: { className: styles.audioCoverPlaceholder },
        loadingOverlay: { className: styles.audioCoverSyncOverlay },
        loadingIcon: { className: styles.audioCoverSyncIcon }
      } }
    />
  );
};
