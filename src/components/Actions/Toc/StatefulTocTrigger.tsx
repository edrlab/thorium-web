"use client";

import { ThActionsKeys } from "@/preferences/models/enums";

import { useLocale } from "../../Epub/AppLocale";

import TocIcon from "./assets/icons/toc.svg";

import { StatefulActionTriggerProps } from "../models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { StatefulActionIcon } from "../Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../Triggers/StatefulOverflowMenuItem";

import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulTocTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const locale = useLocale();
  const RSPrefs = usePreferences();
  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.toc]);
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {
    dispatch(setActionOpen({ 
      key: ThActionsKeys.toc,
      isOpen: value 
    }));
  }

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu) 
      ? <StatefulOverflowMenuItem 
          label={ locale.reader.toc.trigger }
          SVGIcon={ TocIcon } 
          shortcut={ RSPrefs.actions.keys[ThActionsKeys.toc].shortcut }
          id={ ThActionsKeys.toc }
          onAction={ () => setOpen(!actionState?.isOpen) }
        />
      : <StatefulActionIcon 
          visibility={ RSPrefs.actions.keys[ThActionsKeys.toc].visibility }
          aria-label={ locale.reader.toc.trigger } 
          placement="bottom"
          tooltipLabel={ locale.reader.toc.tooltip } 
          onPress={ () => setOpen(!actionState?.isOpen) }
        >
          <TocIcon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
  )
}