"use client";

import { useLocale } from "../../Epub/AppLocale";


import TuneIcon from "./assets/icons/match_case.svg";

import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsKeys } from "@/preferences/models/enums";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { usePreferences } from "@/preferences/hooks/usePreferences";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulSettingsTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const RSPrefs = usePreferences();
  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.settings]);
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const setOpen = (value: boolean) => {    
    dispatch(setActionOpen({
      key: ThActionsKeys.settings,
      isOpen: value
    }));

    // hover false otherwise it tends to stay on close button press…
    if (!value) dispatch(setHovering(false));
  }

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ locale.reader.settings.trigger }
          SVGIcon={ TuneIcon }
          shortcut={ RSPrefs.actions.keys[ThActionsKeys.settings].shortcut } 
          id={ ThActionsKeys.settings }
          onAction={ () => setOpen(!actionState?.isOpen) }
        />
      : <StatefulActionIcon 
          visibility={ RSPrefs.actions.keys[ThActionsKeys.settings].visibility }
          aria-label={ locale.reader.settings.trigger }
          placement="bottom" 
          tooltipLabel={ locale.reader.settings.tooltip }
          onPress={ () => setOpen(!actionState?.isOpen) }
        >
          <TuneIcon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
  )
}