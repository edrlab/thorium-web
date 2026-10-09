"use client";

import { Fragment, useRef } from "react";

import audioStyles from "./assets/styles/thorium-web.audioActions.module.css";

import { ThActionsBar, ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";
import { usePlugins } from "@/components/Plugins/PluginProvider";
import { ActionComponent } from "@/components/Plugins/PluginRegistry";

import { useI18n } from "@/i18n/useI18n";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";

export const AudioActionPair =({ action }: { action: ActionComponent }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { Trigger, Target } = action;
  return (
    <Fragment>
      <Trigger ref={ triggerRef } variant={ ThActionsTriggerVariant.button } />
      { Target && <Target triggerRef={ triggerRef } placement="top" /> }
    </Fragment>
  );
};

export const StatefulAudioMediaActions = () => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();
  const { primaryAudioActionsMap } = usePlugins();

  const displayOrder = preferences.actions.primary.displayOrder;

  return (
    <ThActionsBar className={ audioStyles.wrapper } aria-label={ t("audio.player.mediaActions") }>
      { displayOrder.map(key => {
        const action = primaryAudioActionsMap[key];
        if (!action) return null;
        return <AudioActionPair key={ key } action={ action } />;
      }) }
    </ThActionsBar>
  );
};
