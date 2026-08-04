"use client";

import { useCallback } from "react";

import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { StatefulActionTriggerProps } from "@/components/Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";
import { ThDockingKeys, ThLayoutDirection } from "@/preferences/models";

import DockToLeft from "./assets/icons/dock_to_right.svg";
import DocktoRight from "./assets/icons/dock_to_left.svg";

import { StatefulActionIcon } from "../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Actions/Triggers/StatefulOverflowMenuItem";

import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useDockReservation } from "./hooks/useDockReservation";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { dockAction } from "@/lib/actionsReducer";

export const StatefulDockStart = ({ variant, associatedKey }: StatefulActionTriggerProps) => {
  const preferences = useActionsPreferences();
  const { t } = useI18n();
  const direction = useAppSelector(state => state.reader.direction);
  const profile = useAppSelector(state => state.reader.profile);
  const actionsMap = useAppSelector(state => profile ? state.actions.keys[profile] : undefined);
  const actions = useActions(actionsMap || {});
  const { reserved, isSlotLockedByOther } = useDockReservation(associatedKey ?? "");
  const isRTL = direction === ThLayoutDirection.rtl;
  const translationKey = isRTL 
    ? "reader.app.docker.dockToRight" 
    : "reader.app.docker.dockToLeft";
  const localeKey = {
    trigger: t(`${ translationKey }.trigger`),
    tooltip: t(`${ translationKey }.tooltip`)
  };

  const isDisabled = actions.whichDocked(associatedKey) === ThDockingKeys.start || isSlotLockedByOther(ThDockingKeys.start);

  const dispatch = useAppDispatch();

  const handlePress = useCallback(() => {
    if (associatedKey && profile) {
      dispatch(dockAction({
        key: associatedKey,
        dockingKey: ThDockingKeys.start,
        profile: profile,
        reserved
      }))
    }
  }, [dispatch, associatedKey, profile, reserved]);
  
  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ localeKey.trigger }
          SVGIcon={ isRTL ? DocktoRight : DockToLeft } 
          shortcut={ preferences.docking.keys[ThDockingKeys.start].shortcut }
          onAction={ handlePress } 
          id={ `${ ThDockingKeys.start }-${ associatedKey }` }
          isDisabled={ isDisabled }
        />
      : <StatefulActionIcon 
          className={ readerSharedUI.dockerButton }  
          aria-label={ localeKey.trigger }
          placement="bottom" 
          tooltipLabel={ localeKey.tooltip } 
          onPress={ handlePress } 
          isDisabled={ isDisabled }
        >
          { isRTL 
            ? <DocktoRight aria-hidden="true" focusable="false" /> 
            : <DockToLeft aria-hidden="true" focusable="false" /> 
          }
        </StatefulActionIcon>
    }
    </>
  )
}