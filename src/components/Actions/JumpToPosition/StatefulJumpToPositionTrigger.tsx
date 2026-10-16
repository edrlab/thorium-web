"use client";

import { ThActionsKeys } from "@/preferences/models";
import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import TargetIcon from "./assets/icons/pin_drop.svg";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useI18n } from "@/i18n/useI18n";

import { setActionOpen, useAppDispatch, useAppSelector } from "@/lib";
import { isPositionsListValid } from "./helpers/utils";

export const StatefulJumpToPositionTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const preferences = useActionsPreferences();
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const actionState = useAppSelector(state => profile ? state.actions.keys[profile][ThActionsKeys.jumpToPosition] : undefined);
  const isNavigationLocked = useAppSelector(state => state.readAlongPlayer.isNavigationLocked);
  const positionsList = useAppSelector(state => state.publication.positionsList);
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ 
        key: ThActionsKeys.jumpToPosition,
        isOpen: value,
        profile
      }));
    }
  };

  // In case there is no positions list or no valid positions we return
  if (!isPositionsListValid(positionsList)) return null;

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
     ? <StatefulOverflowMenuItem 
         label={ t("reader.actions.goToPosition.descriptive") }
          SVGIcon={ TargetIcon }
          shortcut={ preferences.actionsKeys[ThActionsKeys.jumpToPosition].shortcut }
          id={ ThActionsKeys.jumpToPosition }
          onAction={ () => setOpen(!actionState?.isOpen) }
          isDisabled={ isNavigationLocked }
        />
      : <StatefulActionIcon
          visibility={ preferences.actionsKeys[ThActionsKeys.jumpToPosition].visibility }
          aria-label={ t("reader.actions.goToPosition.descriptive") }
          placement="bottom"
          tooltipLabel={ t("reader.actions.goToPosition.compact") }
          shortcut={ preferences.actionsKeys[ThActionsKeys.jumpToPosition].shortcut }
          onPress={ () => setOpen(!actionState?.isOpen) }
          isDisabled={ isNavigationLocked }
        >
          <TargetIcon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
 )
}