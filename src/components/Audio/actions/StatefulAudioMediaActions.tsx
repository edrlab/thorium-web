"use client";

import audioStyles from "./assets/styles/thorium-web.audioActions.module.css";

import { ThActionsBar } from "@/core/Components/Actions/ThActionsBar";
import { usePlugins } from "@/components/Plugins/PluginProvider";
import { PlaybackActionPair } from "../../Playback/actions/PlaybackActionPair";

import { useI18n } from "@/i18n/useI18n";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";

export const StatefulAudioMediaActions = () => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();
  const { primaryAudioActionsMap } = usePlugins();

  const displayOrder = preferences.actions.primary.displayOrder;

  return (
    <ThActionsBar className={ audioStyles.wrapper } aria-label={ t("audio.player.mediaControls") }>
      { displayOrder.map(key => {
        const action = primaryAudioActionsMap[key];
        if (!action) return null;
        return <PlaybackActionPair key={ key } action={ action } />;
      }) }
    </ThActionsBar>
  );
};
