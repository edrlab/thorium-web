"use client";

import { useCallback } from "react";

import { useLocale } from "../Epub/AppLocale";

import readerSharedUI from "../assets/styles/readerSharedUI.module.css";

import { StatefulActionTriggerProps } from "@/components/Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";
import { ThDockingKeys } from "@/preferences/models/enums";

import Stack from "./assets/icons/stack.svg";

import { StatefulActionIcon } from "../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Actions/Triggers/StatefulOverflowMenuItem";

import { useActions } from "@/core/Components/Actions/hooks/useActions";
import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { dockAction } from "@/lib/actionsReducer";

export const StatefulDockTransientPopover = ({ variant, associatedKey }: StatefulActionTriggerProps) => {
  const RSPrefs = usePreferences();
  const actionsMap = useAppSelector(state => state.actions.keys);
  const actions = useActions(actionsMap);
  const isDisabled = !actions.isDocked(associatedKey) || actions.whichDocked(associatedKey) === ThDockingKeys.transient;
    
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const handlePress = useCallback(() => {
    if (associatedKey) {
      dispatch(dockAction({
        key: associatedKey,
        dockingKey: ThDockingKeys.transient
      }))
    }
  }, [dispatch, associatedKey]);
  
  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ locale.reader.app.docker.popover.trigger }
          SVGIcon={ Stack } 
          shortcut={ RSPrefs.docking.keys[ThDockingKeys.transient].shortcut }
          onAction={ handlePress } 
          id={ `${ ThDockingKeys.transient }-${ associatedKey }` } 
          isDisabled={ isDisabled }
        />
      : <StatefulActionIcon 
          className={ readerSharedUI.dockerButton }  
          aria-label={ locale.reader.app.docker.popover.trigger }
          placement="bottom" 
          tooltipLabel={ locale.reader.app.docker.popover.tooltip } 
          onPress={ handlePress } 
          isDisabled={ isDisabled }
        >
          <Stack aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
  )
}