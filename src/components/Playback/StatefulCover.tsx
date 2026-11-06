"use client";

import React, { Ref } from "react";

import SyncIcon from "./assets/icons/sync.svg";

import { ThCover } from "@/core/Components/Playback/ThCover";

import { useI18n } from "@/i18n/useI18n";
import { usePlaybackStatus } from "./hooks/usePlaybackStatus";

import { proxyUrl } from "@/helpers/proxyUrl";

export interface StatefulCoverProps {
  ref?: Ref<HTMLElement>;
  coverUrl?: string;
  title?: string;
  placeholder: React.ReactNode;
  className: string;
  compounds: {
    image: { className: string };
    placeholder: { className: string };
    loadingOverlay: { className: string };
    loadingIcon: { className: string };
  };
}

export const StatefulCover = ({ ref, coverUrl, title, placeholder, className, compounds }: StatefulCoverProps) => {
  const { t } = useI18n();
  const { isLoading } = usePlaybackStatus();

  return (
    <ThCover
      ref={ ref }
      className={ className }
      src={ coverUrl ? proxyUrl(coverUrl) : undefined }
      alt={ title || t("audio.player.coverAlt") }
      isLoading={ isLoading }
      placeholder={ placeholder }
      loadingIndicator={ <SyncIcon className={ compounds.loadingIcon.className } aria-hidden="true" /> }
      compounds={ {
        image: { className: compounds.image.className, crossOrigin: "anonymous" },
        placeholder: { className: compounds.placeholder.className },
        loadingOverlay: { className: compounds.loadingOverlay.className }
      } }
    />
  );
};
