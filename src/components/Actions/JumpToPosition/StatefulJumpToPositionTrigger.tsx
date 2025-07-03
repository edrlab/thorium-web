"use client";

import React from "react";

import { useLocale } from "../../Epub/AppLocale";

import { ThActionsKeys } from "@/preferences/models/enums";
import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import TargetIcon from "./assets/icons/pin_drop.svg";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { usePreferences } from "@/preferences/hooks/usePreferences";

import { setActionOpen, useAppDispatch, useAppSelector } from "@/lib";

export const StatefulJumpToPositionTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const locale = useLocale();
  const RSPrefs = usePreferences();
  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.jumpToPosition]);
  const positionsList = useAppSelector(state => state.publication.positionsList);
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {
    dispatch(setActionOpen({ 
      key: ThActionsKeys.jumpToPosition,
      isOpen: value 
    }));
  }

  // In case there is no positions list we return
  if (!positionsList) return null;

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
     ? <StatefulOverflowMenuItem 
         label={ locale.reader.jumpToPosition.trigger }
          SVGIcon={ TargetIcon }
          shortcut={ RSPrefs.actions.keys[ThActionsKeys.jumpToPosition].shortcut }
          id={ ThActionsKeys.jumpToPosition }
          onAction={ () => setOpen(!actionState?.isOpen) }
        />
      : <StatefulActionIcon
          visibility={ RSPrefs.actions.keys[ThActionsKeys.jumpToPosition].visibility } 
          aria-label={ locale.reader.jumpToPosition.trigger }
          placement="bottom" 
          tooltipLabel={ locale.reader.jumpToPosition.tooltip }
          onPress={ () => setOpen(!actionState?.isOpen) }
        >
          <TargetIcon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
 )
}