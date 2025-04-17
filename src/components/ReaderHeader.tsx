import React, { useCallback, useRef } from "react";

import { RSPrefs } from "@/preferences";
import Locale from "../resources/locales/en.json";

import { ActionKeys, IActionsItem, IActionsMapObject } from "@/models/actions";

import readerStateStyles from "./assets/styles/readerStates.module.css";
import readerHeaderStyles from "./assets/styles/readerHeader.module.css";

import { FullscreenAction } from "./FullscreenAction";
import { JumpToPositionAction, JumpToPositionActionContainer } from "./JumpToPositionAction";
import { LayoutStrategyAction, LayoutStrategiesActionContainer } from "./LayoutStrategyAction";
import { SettingsAction, SettingsActionContainer } from "./SettingsAction";
import { TocAction, TocActionContainer } from "./TocAction";
import { RunningHead } from "./RunningHead";
import { ActionsWithCollapsibility } from "./ActionsWithCollapsibility";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import classNames from "classnames";

const ActionsMap: { [key in ActionKeys]: IActionsMapObject } = {
  [ActionKeys.fullscreen]: {
    trigger: FullscreenAction
  },
  [ActionKeys.jumpToPosition]: {
    trigger: JumpToPositionAction,
    container: JumpToPositionActionContainer
  },
  [ActionKeys.layoutStrategy]: {
    trigger: LayoutStrategyAction,
    container: LayoutStrategiesActionContainer
  },
  [ActionKeys.settings]: {
    trigger: SettingsAction,
    container: SettingsActionContainer
  },
  [ActionKeys.toc]: {
    trigger: TocAction,
    container: TocActionContainer
  }
}

export const ReaderHeader = () => {
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const actionsOrder = useRef(RSPrefs.actions.displayOrder);
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);

  const dispatch = useAppDispatch();

  const setHover = () => {
    dispatch(setHovering(true));
  };

  const removeHover = () => {
    dispatch(setHovering(false));
  };

  const handleClassNameFromState = () => {
    let className = "";
    if (isImmersive && isHovering) {
      className = readerStateStyles.immersiveHovering;
    } else if (isImmersive) {
      className = readerStateStyles.immersive;
    }
    return className
  };

  const listActionItems = useCallback(() => {
    const actionsItems: IActionsItem[] = [];

    actionsOrder.current.map((key: ActionKeys) => {
      if (key !== ActionKeys.layoutStrategy || !isFXL) {
        actionsItems.push({
          Trigger: ActionsMap[key].trigger,
          Container: ActionsMap[key].container,
          key: key
        });
      }
    });
    
    return actionsItems;
  }, [isFXL]);

  return (
    <>
    <header 
      className={ classNames(readerHeaderStyles.header, handleClassNameFromState()) } 
      id="top-bar" 
      aria-label={ Locale.reader.app.header.label } 
      onMouseEnter={ setHover } 
      onMouseLeave={ removeHover }
    >
      <RunningHead syncDocTitle={ true } />
      
      <ActionsWithCollapsibility 
        id="reader-header-overflowMenu" 
        items={ listActionItems() }
        prefs={ RSPrefs.actions }
        className={ readerHeaderStyles.actionsWrapper } 
        label={ Locale.reader.app.header.actions } 
        overflowActionCallback={ (isImmersive && !isHovering) }
        overflowMenuDisplay={ (!isImmersive || isHovering) }
      />
    </header>
    </>
  );
}