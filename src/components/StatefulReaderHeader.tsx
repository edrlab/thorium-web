"use client";

import React, { useCallback } from "react";

import { ActionKeyType, usePreferenceKeys } from "@/preferences";

import { useLocale } from "./Epub/AppLocale";

import readerHeaderStyles from "./assets/styles/readerHeader.module.css";

import { ThActionEntry } from "@/core/Components/Actions/ThActionsBar";
import { ThHeader  } from "@/core/Components/Reader/ThHeader";
import { ThRunningHead } from "@/core/Components/Reader/ThRunningHead";
import { StatefulCollapsibleActionsBar } from "./Actions/StatefulCollapsibleActionsBar";

import { usePlugins } from "./Plugins/PluginProvider";
import { usePreferences } from "@/preferences/hooks";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

export const StatefulReaderHeader = () => {
  const locale = useLocale();
  const { reflowActionKeys, fxlActionKeys } = usePreferenceKeys();
  const RSPrefs = usePreferences();
  const { actionsComponentsMap } = usePlugins();
  
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const runningHead = useAppSelector(state => state.publication.runningHead);
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);

  const dispatch = useAppDispatch();

  const setHover = () => {
    dispatch(setHovering(true));
  };

  const removeHover = () => {
    dispatch(setHovering(false));
  };

  const listActionItems = useCallback(() => {
    const actionKeys = isFXL? fxlActionKeys : reflowActionKeys;
    const actionsItems: ThActionEntry<ActionKeyType>[] = [];

    if (actionsComponentsMap && Object.keys(actionsComponentsMap).length > 0) {
      actionKeys.forEach((key) => {      
        if (actionsComponentsMap[key]) {
          actionsItems.push({
            Trigger: actionsComponentsMap[key].Trigger,
            Target: actionsComponentsMap[key].Target,
            key: key
          });
        } else {
          console.warn(`Action key "${ key }" not found in the plugin registry while present in preferences.`);
        }
      });
    }
    
    return actionsItems;
  }, [isFXL, fxlActionKeys, reflowActionKeys, actionsComponentsMap]);

  return (
    <>
    <ThHeader 
      className={ readerHeaderStyles.header } 
      id="top-bar" 
      aria-label={ locale.reader.app.header.label } 
      onMouseEnter={ setHover } 
      onMouseLeave={ removeHover }
    >
      <ThRunningHead 
        label={ runningHead || locale.reader.app.header.runningHeadFallback } 
        syncDocTitle={ true }
        aria-label={ locale.reader.app.header.runningHead }
      />
      
      <StatefulCollapsibleActionsBar 
        id="reader-header-overflowMenu" 
        items={ listActionItems() }
        prefs={{ ...RSPrefs.actions, displayOrder: isFXL ? RSPrefs.actions.fxlOrder : RSPrefs.actions.reflowOrder }}
        className={ readerHeaderStyles.actionsWrapper } 
        aria-label={ locale.reader.app.header.actions } 
        overflowActionCallback={ (isImmersive && !isHovering) }
        overflowMenuDisplay={ (!isImmersive || isHovering) }
      />
    </ThHeader>
    </>
  );
}