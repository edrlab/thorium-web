"use client";

import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";

import { ThActionsBar } from "@/core/Components/Actions/ThActionsBar";
import { AudioActionPair } from "../Audio/actions/StatefulAudioMediaActions";
import { usePlugins } from "@/components/Plugins/PluginProvider";

import { useI18n } from "@/i18n/useI18n";
import { usePreferences } from "@/preferences/hooks/usePreferences";

export const StatefulReadAlongMediaActions = () => {
  const { t } = useI18n();
  const { preferences } = usePreferences();
  const { readAlongActionsMap } = usePlugins();

  const displayOrder = preferences.readAlong.actions.expanded.displayOrder;

  return (
    <ThActionsBar className={ readAlongStyles.readAlongExpandedActions } aria-label={ t("audio.player.mediaActions") }>
      { displayOrder.map(key => {
        const action = readAlongActionsMap[key];
        if (!action) return null;
        return <AudioActionPair key={ key } action={ action } />;
      }) }
    </ThActionsBar>
  );
};
