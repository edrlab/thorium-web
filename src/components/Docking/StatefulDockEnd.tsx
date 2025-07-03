"use client";

import { useCallback } from "react";

import { useLocale } from "../Epub/AppLocale";

import readerSharedUI from "../assets/styles/readerSharedUI.module.css";

import { StatefulActionTriggerProps } from "@/components/Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";
import { ThDockingKeys, ThLayoutDirection } from "@/preferences/models/enums";

import DockToLeft from "./assets/icons/dock_to_right.svg";
import DocktoRight from "./assets/icons/dock_to_left.svg";

import { StatefulActionIcon } from "../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Actions/Triggers/StatefulOverflowMenuItem";

import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { dockAction } from "@/lib/actionsReducer";

export const StatefulDockEnd = ({ variant, associatedKey }: StatefulActionTriggerProps) => {
  const RSPrefs = usePreferences();
  const direction = useAppSelector(state => state.reader.direction);
  const actionsMap = useAppSelector(state => state.actions.keys);
  const isRTL = direction === ThLayoutDirection.rtl;
  const locale = useLocale();
  const localeKey = isRTL ? locale.reader.app.docker.dockToLeft : locale.reader.app.docker.dockToRight;
  
  const actions = useActions(actionsMap);
  const isDisabled = actions.whichDocked(associatedKey) === ThDockingKeys.end;

  const dispatch = useAppDispatch();
  
  const handlePress = useCallback(() => {
    if (associatedKey) {
      dispatch(dockAction({
        key: associatedKey,
        dockingKey: ThDockingKeys.end
      }))
    }
  }, [dispatch, associatedKey]);
  
  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ localeKey.trigger }
          SVGIcon={ isRTL ? DockToLeft : DocktoRight } 
          shortcut={ RSPrefs.docking.keys[ThDockingKeys.end].shortcut }
          onAction={ handlePress } 
          id={ `${ ThDockingKeys.end }-${ associatedKey }` }
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