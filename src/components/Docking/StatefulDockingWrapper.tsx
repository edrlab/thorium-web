"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";

import { useLocale } from "../Epub/AppLocale";

import dockingStyles from "./assets/styles/docking.module.css";

import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { ThDockingTypes, ThDockingKeys, ThLayoutDirection } from "@/preferences/models/enums";
import { ActionsStateKeys } from "@/lib/actionsReducer";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { useResizablePanel } from "./hooks/useResizablePanel";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { activateDockPanel, collapseDockPanel, deactivateDockPanel, expandDockPanel, setDockPanelWidth } from "@/lib/actionsReducer";

import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";
import classNames from "classnames";
import parseTemplate from "json-templates";

export interface DockPanelSizes {
  width: number;
  minWidth: number;
  maxWidth: number;
  getCurrentPxWidth: (percentage: number) => number;
}

const DockHandle = ({
  flow,
  isResizable,
  isPopulated, 
  hasDragIndicator
}: { 
  flow: ThDockingKeys.start | ThDockingKeys.end;
  isResizable: boolean;
  isPopulated: boolean;
  hasDragIndicator?: boolean;
}) => {
  const handleID = `${flow}-resize-handle`;
  const locale = useLocale();

  const direction = useAppSelector(state => state.reader.direction);

  const classFromFlow = useCallback(() => {
    if (flow === ThDockingKeys.start) {
      return direction === ThLayoutDirection.ltr ? dockingStyles.dockResizeHandleGrabLeft : dockingStyles.dockResizeHandleGrabRight;
    } else if (flow === ThDockingKeys.end) {
      return direction === ThLayoutDirection.ltr ? dockingStyles.dockResizeHandleGrabRight : dockingStyles.dockResizeHandleGrabLeft;
    }
  }, [flow, direction]);

  return(
    <>
    <PanelResizeHandle 
      id={ handleID } 
      className={ dockingStyles.dockResizeHandle }
      disabled={ !isResizable }
      tabIndex={ isPopulated ? 0 : -1 }
    >
      { isResizable && hasDragIndicator && 
        <div className={ classNames(dockingStyles.dockResizeHandleGrab, classFromFlow()) }></div> 
      }
    </PanelResizeHandle>
    </>
  )
};

const DockPanel = ({
  actionKey,
  flow,
  sizes,
  isResizable,
  isPopulated,
  isCollapsed,
  forceExpand,
  hasDragIndicator 
}: {
  actionKey: ActionsStateKeys | null;
  flow: ThDockingKeys.start | ThDockingKeys.end;
  sizes: DockPanelSizes;
  isResizable: boolean;
  isPopulated: boolean;
  isCollapsed: boolean;
  forceExpand: boolean;
  hasDragIndicator?: boolean;
}) => {
  const panelRef = useRef<ImperativePanelHandle>(null);
  const direction = useAppSelector(state => state.reader.direction);
  const dispatch = useAppDispatch();

  const dockClassName = flow === ThDockingKeys.end && direction === ThLayoutDirection.ltr ? "right-dock" : "left-dock";
  const locale = useLocale();
  
  const makeDockLabel = useCallback(() => {    
    let label = "";
    if (flow === ThDockingKeys.end && direction === ThLayoutDirection.ltr) {
      label += locale.reader.app.docking.dockingRight;
    } else {
      label += locale.reader.app.docking.dockingLeft
    }

    if (actionKey) {
      if (!isPopulated) {
        const jsonTemplate = parseTemplate(locale.reader.app.docking.dockingClosed);
        // @ts-ignore
        label += ` – ${ jsonTemplate({ action: locale.reader[actionKey].heading }) }`
      } else if (isCollapsed) {
        const jsonTemplate = parseTemplate(locale.reader.app.docking.dockingCollapsed);
        // @ts-ignore
        label += ` – ${ jsonTemplate({ action: locale.reader[actionKey].heading }) }`
      }
    } else {
      label += ` – ${ locale.reader.app.docking.dockingEmpty }`
    }

    return label;
  }, [flow, direction, isPopulated, isCollapsed, actionKey]);

  const collapsePanel = useCallback(() => {
    if (panelRef.current) {
      panelRef.current.collapse();
      dispatch(collapseDockPanel(flow));
    }
  }, [dispatch, flow]);

  const expandPanel = useCallback(() => {
    if (panelRef.current) {
      panelRef.current.expand();
      dispatch(expandDockPanel(flow));
    }
  }, [dispatch, flow]);

  useEffect(() => {
    dispatch(activateDockPanel(flow));

    return () => {
      dispatch(deactivateDockPanel(flow));
    }
  }, [dispatch, flow]);

  useEffect(() => {
    isPopulated || forceExpand ? expandPanel() : collapsePanel();
  }, [isPopulated, forceExpand, collapsePanel, expandPanel]);

  return(
    <>
    { flow === ThDockingKeys.end &&
      <DockHandle 
        flow={ ThDockingKeys.end } 
        isResizable={ isResizable } 
        isPopulated={ isPopulated }
        hasDragIndicator={ hasDragIndicator } 
      /> 
    } 
    <Panel 
      id={ `${ flow }-panel` } 
      order={ flow === ThDockingKeys.end ? 3 : 1 } 
      collapsible={ true }
      collapsedSize={ 0 }
      ref={ panelRef }
      defaultSize={ isPopulated ? sizes.width : 0 } 
      minSize={ sizes.minWidth } 
      maxSize={ sizes.maxWidth }
      onCollapse={ collapsePanel }
      onExpand={ expandPanel }
      onResize={ (size: number) => size !== 0 && dispatch(setDockPanelWidth({
        key: flow,
        width: sizes.getCurrentPxWidth(size)
      }))}
      inert={ isCollapsed } 
    >
      <div 
        id={ flow } 
        aria-label={ makeDockLabel() }
        className={ classNames(dockingStyles.dockPanelContainer, dockClassName) }
      ></div>
    </Panel>
    { flow === ThDockingKeys.start && 
      <DockHandle 
        flow={ ThDockingKeys.start } 
        isResizable={ isResizable } 
        isPopulated={ isPopulated } 
        hasDragIndicator={ hasDragIndicator } 
      /> 
    } 
  </>
  );
};

export const StatefulDockingWrapper = ({ 
  children
}: { 
  children: ReactNode; 
}) => {
  const RSPrefs = usePreferences();
  const dockingStart = useAppSelector(state => state.actions.dock[ThDockingKeys.start]);
  const dockingEnd = useAppSelector(state => state.actions.dock[ThDockingKeys.end])
  const startPanel = useResizablePanel(dockingStart);
  const endPanel = useResizablePanel(dockingEnd);

  const breakpoint = useAppSelector(state => state.theming.breakpoint);

  if (!RSPrefs.docking.dock) {
    return(
      <>
      { children }
      </>
    )
  } else {
    const dockingMap = makeBreakpointsMap<ThDockingTypes>({
      defaultValue: ThDockingTypes.both, 
      fromEnum: ThDockingTypes, 
      pref: RSPrefs.docking.dock, 
      disabledValue: ThDockingTypes.none
    });

    const dockConfig = breakpoint && dockingMap[breakpoint] || ThDockingTypes.both;

    return (
      <>
      <PanelGroup direction="horizontal">
        { 
          (dockConfig === ThDockingTypes.both || dockConfig === ThDockingTypes.start) 
          && <DockPanel 
            actionKey={ startPanel.currentKey() }
            flow={ ThDockingKeys.start } 
            sizes={{
              width: startPanel.getWidth(),
              minWidth: startPanel.getMinWidth(),
              maxWidth: startPanel.getMaxWidth(),
              getCurrentPxWidth: startPanel.getCurrentPxWidth
            }} 
            isResizable={ startPanel.isResizable() }
            isPopulated={ startPanel.isPopulated() }
            isCollapsed={ startPanel.isCollapsed() } 
            forceExpand={ startPanel.forceExpand() }
            hasDragIndicator={ startPanel.hasDragIndicator() }
          />
        }
    
        <Panel id="main-panel" order={ 2 }>
          { children }
        </Panel>
    
        { 
          (dockConfig === ThDockingTypes.both || dockConfig === ThDockingTypes.end)
          && <DockPanel 
            actionKey={ endPanel.currentKey() }
            flow={ ThDockingKeys.end } 
            sizes={{
              width: endPanel.getWidth(),
              minWidth: endPanel.getMinWidth(),
              maxWidth: endPanel.getMaxWidth(),
              getCurrentPxWidth: endPanel.getCurrentPxWidth
            }} 
            isResizable={ endPanel.isResizable() }
            isPopulated={ endPanel.isPopulated() }
            isCollapsed={ endPanel.isCollapsed() } 
            forceExpand={ endPanel.forceExpand() }
            hasDragIndicator={ endPanel.hasDragIndicator() }
          />
      }
      </PanelGroup>
    </>
    )
  }
}