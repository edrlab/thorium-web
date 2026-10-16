"use client";

import React, { useCallback } from "react";

import dockingStyles from "./assets/styles/thorium-web.docking.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { ThDockingKeys } from "@/preferences/models";

import { Toolbar } from "react-aria-components";

import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";
import { StatefulCollapsibleActionsBar } from "../Actions/StatefulCollapsibleActionsBar";

import { StatefulDockStart } from "./StatefulDockStart";
import { StatefulDockEnd } from "./StatefulDockEnd";
import { StatefulDockTransientPopover } from "./StatefulDockTransientPopover";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";
import { useI18n } from "@/i18n/useI18n";

import { ThActionEntry } from "@/core/Components/Actions/ThActionsBar";
import { ActionsStateKeys } from "@/lib/actionsReducer";

const dockingComponentsMap = {
  [ThDockingKeys.start]: {
    trigger: StatefulDockStart
  },
  [ThDockingKeys.end]: {
    trigger: StatefulDockEnd
  },
  [ThDockingKeys.transient]: {
    trigger: StatefulDockTransientPopover
  }
}

export interface StatefulDockerProps {
  id: ActionsStateKeys;
  keys: ThDockingKeys[];
  ref: React.ForwardedRef<HTMLButtonElement>;
  onClose: () => void;
  actions?: React.ReactNode;
}

export const StatefulDocker = ({
  id,
  keys,
  ref,
  onClose,
  actions
}: StatefulDockerProps) => {
  const preferences = useActionsPreferences();
  const { theming } = useSharedPreferences();
  const { t } = useI18n();
  
  const listActionItems = useCallback(() => {
    const actionsItems: ThActionEntry<ThDockingKeys>[] = [];

    keys.map((key) => {
      actionsItems.push({
        Trigger: dockingComponentsMap[key].trigger,
        key: key,
        associatedKey: id
      })
    });

    return actionsItems;
  }, [keys, id]);

  return(
    <>
    <Toolbar className={ dockingStyles.dockerWrapper }>
      <StatefulCollapsibleActionsBar 
        id={ `${ id }-docker-overflowMenu` }
        items={ listActionItems() }
        className={ dockingStyles.docker } 
        overflowMenuClassName={ readerSharedUI.dockerButton }
        prefs={ preferences.docking }
        aria-label={ t("reader.app.docker.wrapper") }
      />

      { actions }

      <ThCloseButton
        ref={ ref }
        className={ readerSharedUI.dockerButton } 
        aria-label={ t("common.actions.close") } 
        onPress={ onClose }
        compounds={ {
          tooltipTrigger: {
            delay: theming.icon.tooltipDelay,
            closeDelay: theming.icon.tooltipDelay
          },
          tooltip: {
            className: readerSharedUI.tooltip
          },
          label: t("common.actions.close")
        }}
      />
    </Toolbar>
    </>
  )
}

