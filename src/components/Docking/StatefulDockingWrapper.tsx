"use client";

import { ReactNode, RefObject, useCallback, useEffect, useRef } from "react";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import dockingStyles from "./assets/styles/thorium-web.docking.module.css";

import { Group, Panel, PanelImperativeHandle, Separator } from "react-resizable-panels";

import { ThDockingTypes, ThDockingKeys, ThDockingSizeValue, ThLayoutDirection } from "@/preferences/models";
import { ActionsStateKeys } from "@/lib/actionsReducer";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useResizablePanel } from "./hooks/useResizablePanel";
import { useDockCleanup } from "./hooks/useDockCleanup";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { activateDockPanel, collapseDockPanel, deactivateDockPanel, expandDockPanel, setDockPanelWidth } from "@/lib/actionsReducer";

import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";
import classNames from "classnames";

export interface DockPanelSizes {
  width: ThDockingSizeValue;
  minWidth: ThDockingSizeValue;
  maxWidth: ThDockingSizeValue;
}

const DockHandle = ({
  flow,
  isResizable,
  hasDragIndicator
}: {
  flow: ThDockingKeys.start | ThDockingKeys.end;
  isResizable: boolean;
  hasDragIndicator?: boolean;
}) => {
  const handleID = `${ flow }-resize-handle`;

  const direction = useAppSelector(state => state.reader.direction);

  const classFromFlow = useCallback(() => {
    if (flow === ThDockingKeys.start) {
      return direction === ThLayoutDirection.ltr ? dockingStyles.resizeHandleGrabLeft : dockingStyles.resizeHandleGrabRight;
    } else if (flow === ThDockingKeys.end) {
      return direction === ThLayoutDirection.ltr ? dockingStyles.resizeHandleGrabRight : dockingStyles.resizeHandleGrabLeft;
    }
  }, [flow, direction]);

  return(
    <>
    <Separator
      id={ handleID }
      className={ dockingStyles.resizeHandle }
      disabled={ !isResizable }
    >
      { isResizable && hasDragIndicator &&
        <div className={ classNames(dockingStyles.resizeHandleGrab, classFromFlow()) }></div>
      }
    </Separator>
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
  hasDragIndicator,
  profile,
  panelRef
}: {
  actionKey: ActionsStateKeys | null;
  flow: ThDockingKeys.start | ThDockingKeys.end;
  sizes: DockPanelSizes;
  isResizable: boolean;
  isPopulated: boolean;
  isCollapsed: boolean;
  forceExpand: boolean;
  hasDragIndicator?: boolean;
  profile: string;
  panelRef: RefObject<PanelImperativeHandle | null>;
}) => {
  const { t } = useI18n();

  const direction = useAppSelector(state => state.reader.direction);
  const dispatch = useAppDispatch();

  const dockClassName = flow === ThDockingKeys.end && direction === ThLayoutDirection.ltr ? readerStyles.rightDock : readerStyles.leftDock;

  const makeDockLabel = useCallback(() => {    
    let label = "";
    if (flow === ThDockingKeys.end && direction === ThLayoutDirection.ltr) {
      label += t("reader.app.docking.dockingRight");
    } else {
      label += t("reader.app.docking.dockingLeft")
    }

    if (actionKey) {
      if (!isPopulated) {
        label += ` – ${ t("reader.app.docking.dockingClosed", { action: t(`reader.${ actionKey }.heading`) }) }`;
      } else if (isCollapsed) {
        label += ` – ${ t("reader.app.docking.dockingCollapsed", { action: t(`reader.${ actionKey }.heading`) }) }`;
      }
    } else {
      label += ` – ${ t("reader.app.docking.dockingEmpty") }`;
    }

    return label;
  }, [flow, direction, isPopulated, isCollapsed, actionKey, t]);

  // Collapse/expand state and docked width are mirrored to Redux from the
  // Group's onLayoutChanged callback (see StatefulDockingWrapper), which
  // fires once per completed interaction — including these imperative calls.
  //
  // react-resizable-panels' imperative Panel methods can throw if called
  // while the Panel's registration with its Group is momentarily out of
  // sync (e.g. a breakpoint change adding/removing docked panels in the same
  // render as this panel's populated state changes). These calls are a
  // best-effort UI sync, not a source of truth, so a transient failure here
  // must not crash the reader — it self-corrects on the next effect run.
  const collapsePanel = useCallback(() => {
    try {
      panelRef.current?.collapse();
    } catch (error) {
      console.warn(`Failed to collapse ${ flow } dock panel`, error);
    }
  }, [panelRef, flow]);

  const expandPanel = useCallback(() => {
    try {
      panelRef.current?.expand();
    } catch (error) {
      console.warn(`Failed to expand ${ flow } dock panel`, error);
    }
  }, [panelRef, flow]);

  useEffect(() => {
    dispatch(activateDockPanel({ slot: flow, profile }));

    return () => {
      dispatch(deactivateDockPanel({ slot: flow, profile }));
    }
  }, [dispatch, flow, profile]);

  useEffect(() => {
    isPopulated || forceExpand ? expandPanel() : collapsePanel();
  }, [isPopulated, forceExpand, collapsePanel, expandPanel]);

  return(
    <>
    { flow === ThDockingKeys.end &&
      <DockHandle
        flow={ ThDockingKeys.end }
        isResizable={ isResizable }
        hasDragIndicator={ hasDragIndicator }
      />
    }
    <Panel
      id={ `${ flow }-panel` }
      collapsible={ true }
      collapsedSize={ 0 }
      panelRef={ panelRef }
      defaultSize={ sizes.width }
      minSize={ sizes.minWidth }
      maxSize={ sizes.maxWidth }
      inert={ isCollapsed }
    >
      <div
        id={ flow }
        aria-label={ makeDockLabel() }
        className={ classNames(dockingStyles.panelContainer, dockClassName) }
      ></div>
    </Panel>
    { flow === ThDockingKeys.start &&
      <DockHandle
        flow={ ThDockingKeys.start }
        isResizable={ isResizable }
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
  const preferences = useActionsPreferences();
  const profile = useAppSelector(state => state.reader.profile);
  const dispatch = useAppDispatch();

  // Clean up stale docked actions
  useDockCleanup(profile);

  const dockingStart = useAppSelector(state => profile && state.actions.dock[profile] ? state.actions.dock[profile][ThDockingKeys.start] : undefined);
  const dockingEnd = useAppSelector(state => profile && state.actions.dock[profile] ? state.actions.dock[profile][ThDockingKeys.end] : undefined)
  const startPanel = useResizablePanel(dockingStart);
  const endPanel = useResizablePanel(dockingEnd);

  const startPanelRef = useRef<PanelImperativeHandle>(null);
  const endPanelRef = useRef<PanelImperativeHandle>(null);
  const wasCollapsedRef = useRef<Record<ThDockingKeys.start | ThDockingKeys.end, boolean>>({
    [ThDockingKeys.start]: false,
    [ThDockingKeys.end]: false
  });

  // react-resizable-panels only reads `defaultSize` once; ongoing width
  // persistence and collapse/expand mirroring belong on the Group's
  // onLayoutChanged, which fires once per completed interaction (mouse
  // release or keyboard press) rather than on every intermediate frame of a
  // drag, per the library's own guidance for "saving a layout".
  const handleLayoutChanged = useCallback(() => {
    if (!profile) return;

    ([
      [ThDockingKeys.start, startPanelRef],
      [ThDockingKeys.end, endPanelRef]
    ] as const).forEach(([flow, ref]) => {
      const panel = ref.current;
      if (!panel) return;

      // Same transient-registration caveat as collapsePanel/expandPanel:
      // this is a best-effort mirror to Redux, not a source of truth.
      let inPixels: number;
      try {
        inPixels = panel.getSize().inPixels;
      } catch (error) {
        console.warn(`Failed to read ${ flow } dock panel size`, error);
        return;
      }

      const isCollapsedNow = inPixels === 0;
      const wasCollapsed = wasCollapsedRef.current[flow];
      wasCollapsedRef.current[flow] = isCollapsedNow;

      if (isCollapsedNow) {
        if (!wasCollapsed) {
          dispatch(collapseDockPanel({ slot: flow, profile }));
        }
      } else {
        if (wasCollapsed) {
          dispatch(expandDockPanel({ slot: flow, profile }));
        }
        dispatch(setDockPanelWidth({ key: flow, width: inPixels, profile }));
      }
    });
  }, [profile, dispatch]);

  const breakpoint = useAppSelector(state => state.theming.breakpoint);

  if (!preferences.docking.dock) {
    return(
      <>
      { children }
      </>
    )
  } else {
    const dockingMap = makeBreakpointsMap<ThDockingTypes>({
      defaultValue: ThDockingTypes.both, 
      fromEnum: ThDockingTypes, 
      pref: preferences.docking.dock, 
      disabledValue: ThDockingTypes.none
    });

    const dockConfig = breakpoint && dockingMap[breakpoint] || ThDockingTypes.both;

    return (
      <>
      <Group id="docking-panel-group" orientation="horizontal" onLayoutChanged={ handleLayoutChanged }>
        {
          (dockConfig === ThDockingTypes.both || dockConfig === ThDockingTypes.start)
          && profile && <DockPanel
            actionKey={ startPanel.currentKey() }
            flow={ ThDockingKeys.start }
            sizes={{
              width: startPanel.getWidth(),
              minWidth: startPanel.getMinWidth(),
              maxWidth: startPanel.getMaxWidth()
            }}
            isResizable={ startPanel.isResizable() }
            isPopulated={ startPanel.isPopulated() }
            isCollapsed={ startPanel.isCollapsed() }
            forceExpand={ startPanel.forceExpand() }
            hasDragIndicator={ startPanel.hasDragIndicator() }
            profile={ profile }
            panelRef={ startPanelRef }
          />
        }

        <Panel id="main-panel">
          { children }
        </Panel>

        {
          (dockConfig === ThDockingTypes.both || dockConfig === ThDockingTypes.end)
          && profile && <DockPanel
            actionKey={ endPanel.currentKey() }
            flow={ ThDockingKeys.end }
            sizes={{
              width: endPanel.getWidth(),
              minWidth: endPanel.getMinWidth(),
              maxWidth: endPanel.getMaxWidth()
            }}
            isResizable={ endPanel.isResizable() }
            isPopulated={ endPanel.isPopulated() }
            isCollapsed={ endPanel.isCollapsed() }
            forceExpand={ endPanel.forceExpand() }
            hasDragIndicator={ endPanel.hasDragIndicator() }
            profile={ profile }
            panelRef={ endPanelRef }
          />
        }
      </Group>
    </>
    )
  }
}