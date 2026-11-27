"use client";

import { ThActionsKeys } from "@/preferences/models";

import TocIcon from "./assets/icons/toc.svg";

import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulTocTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const preferences = useActionsPreferences();
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const actionState = useAppSelector(state => profile ? state.actions.keys[profile][ThActionsKeys.toc] : undefined);
  const isNavigationLocked = useAppSelector(state => state.readAlongPlayer.isNavigationLocked);
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ 
        key: ThActionsKeys.toc,
        isOpen: value,
        profile
      }));
    }
  };

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ t("reader.tableOfContents.title") }
          SVGIcon={ TocIcon } 
          shortcut={ preferences.actionsKeys[ThActionsKeys.toc].shortcut }
          id={ ThActionsKeys.toc }
          onAction={ () => setOpen(!actionState?.isOpen) }
          isDisabled={ isNavigationLocked }
        />
      : <StatefulActionIcon
          visibility={ preferences.actionsKeys[ThActionsKeys.toc].visibility }
          aria-label={ t("reader.tableOfContents.title") }
          placement="bottom"
          tooltipLabel={ t("reader.tableOfContents.title") }
          shortcut={ preferences.actionsKeys[ThActionsKeys.toc].shortcut }
          onPress={ () => setOpen(!actionState?.isOpen) }
          isDisabled={ isNavigationLocked }
        >
          <TocIcon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
  )
}