"use client";

import { ReactNode, RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import dockingStyles from "./assets/styles/thorium-web.docking.module.css";

import { Group, Layout, LayoutChangedMeta, Panel, PanelImperativeHandle, Separator } from "react-resizable-panels";

import { ThDockingTypes, ThDockingKeys, ThDockingSizeValue, ThLayoutDirection } from "@/preferences/models";
import { ActionsStateKeys } from "@/lib/actionsReducer";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useResizablePanel } from "./hooks/useResizablePanel";
import { useDockCleanup } from "./hooks/useDockCleanup";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { activateDockPanel, deactivateDockPanel, setActionOpen, setDockPanelWidth } from "@/lib/actionsReducer";

import { makeBreakpointsMap } from "@/core/Helpers/breakpointsMap";
import classNames from "classnames";

export interface DockPanelSizes {
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
  dockConfig,
  sizes,
  targetWidth,
  isResizable,
  isPopulated,
  hasDragIndicator,
  profile,
  panelRef
}: {
  actionKey: ActionsStateKeys | null;
  flow: ThDockingKeys.start | ThDockingKeys.end;
  dockConfig: ThDockingTypes;
  sizes: DockPanelSizes;
  targetWidth: ThDockingSizeValue;
  isResizable: boolean;
  isPopulated: boolean;
  hasDragIndicator?: boolean;
  profile: string;
  panelRef: RefObject<PanelImperativeHandle | null>;
}) => {
  const { t } = useI18n();

  const direction = useAppSelector(state => state.reader.direction);
  const dispatch = useAppDispatch();

  // Through a ref so a resize doesn’t change expandPanel’s identity and
  // re-trigger the sync effect
  const targetWidthRef = useRef(targetWidth);
  targetWidthRef.current = targetWidth;

  const dockClassName = flow === ThDockingKeys.end && direction === ThLayoutDirection.ltr ? readerStyles.rightDock : readerStyles.leftDock;

  const makeDockLabel = useCallback(() => {    
    let label = "";
    if (flow === ThDockingKeys.end && direction === ThLayoutDirection.ltr) {
      label += t("reader.app.docking.dockingRight");
    } else {
      label += t("reader.app.docking.dockingLeft")
    }

    if (actionKey) {
      // A shut slot still holds its action, so it announces what it contains
      if (!isPopulated) {
        label += ` – ${ t("reader.app.docking.dockingClosed", { action: t(`reader.${ actionKey }.heading`) }) }`;
      }
    } else {
      label += ` – ${ t("reader.app.docking.dockingEmpty") }`;
    }

    return label;
  }, [flow, direction, isPopulated, actionKey, t]);

  // The imperative Panel methods throw when the Panel's registration with its
  // Group is momentarily out of sync, e.g. a breakpoint change mounting panels
  // in the same render as this one's populated state changes. Best-effort UI
  // sync, not a source of truth, so a failure must not crash the reader
  const collapsePanel = useCallback(() => {
    try {
      panelRef.current?.collapse();
    } catch (error) {
      console.warn(`Failed to collapse ${ flow } dock panel`, error);
    }
  }, [panelRef, flow]);

  // resize() not expand(): expand() falls back to minSize when the library has
  // no remembered size, which is the case for every panel here as they mount shut
  const expandPanel = useCallback(() => {
    try {
      panelRef.current?.resize(targetWidthRef.current);
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

  // The panel's size is asserted from occupancy, never read back from the DOM:
  // a slot whose action is open is at its width, any other is at zero. Shutting
  // a panel closes its action (see handleLayoutChanged), so there is no third
  // state to reconcile and no order in which these can disagree.
  //
  // `dockConfig` is a dependency because the Group caches layouts keyed by its
  // set of panel ids and restores one whenever a panel registers: a breakpoint
  // adding or removing the *other* slot resizes this one to whatever that set
  // last held, without this panel remounting or its own state changing.
  //
  // Deferred to the next animation frame: a breakpoint change can mount a
  // DockPanel in the same commit its populated state changes, racing the
  // Group's own panel registration and throwing (see collapsePanel/
  // expandPanel above). Running after that commit has settled avoids it
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      isPopulated ? expandPanel() : collapsePanel();
    });

    return () => cancelAnimationFrame(raf);
  }, [isPopulated, dockConfig, collapsePanel, expandPanel]);

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
      // A literal, never derived: `defaultSize` sits in the library's
      // registerPanel effect deps, so any change re-registers the Panel and
      // makes the Group emit a layout event. Panels mount shut and are sized by
      // the effect above, which also avoids a flash at full width
      defaultSize={ 0 }
      minSize={ sizes.minWidth }
      maxSize={ sizes.maxWidth }
      groupResizeBehavior="preserve-pixel-size"
      // Occupancy, not the collapsed mirror, which can lag behind the DOM
      inert={ !isPopulated }
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

  const startActionKey = startPanel.currentKey();
  const endActionKey = endPanel.currentKey();
  const isStartPopulated = startPanel.isPopulated();
  const isEndPopulated = endPanel.isPopulated();

  // Sole writer of the persisted widths and of a docked action's open state,
  // and it only ever records a drag. onLayoutChanged fires once per completed
  // interaction, not on every frame of one
  const handleLayoutChanged = useCallback((_layout: Layout, meta: LayoutChangedMeta) => {
    if (!profile) return;

    ([
      [ThDockingKeys.start, startPanelRef, startActionKey, isStartPopulated],
      [ThDockingKeys.end, endPanelRef, endActionKey, isEndPopulated]
    ] as const).forEach(([flow, ref, actionKey, isPopulated]) => {
      const panel = ref.current;
      if (!panel) return;

      // Same transient-registration caveat as collapsePanel/expandPanel:
      // a failure here must not crash the reader
      let inPixels: number;
      try {
        inPixels = panel.getSize().inPixels;
      } catch (error) {
        console.warn(`Failed to read ${ flow } dock panel size`, error);
        return;
      }

      // Everything that is not a drag: mounting, constraint recomputation, our
      // own imperative calls, and the Group's cached-layout restores. Those
      // restores are keyed on the set of panel ids, so a slot holding nothing
      // comes back at the width that set last had — clamp it, but write
      // nothing, or a panel the Group resized to zero would read as dismissed
      if (!meta.isUserInteraction) {
        if (!isPopulated && inPixels !== 0) {
          try {
            panel.collapse();
          } catch (error) {
            console.warn(`Failed to collapse ${ flow } dock panel`, error);
          }
        }
        return;
      }

      if (!actionKey) return;

      // Dragging a panel shut closes its action, dragging it back out reopens
      // it: the panel and its action are one thing, so the separator and the
      // trigger are two routes to the same state
      if (inPixels === 0) {
        dispatch(setActionOpen({ key: actionKey, isOpen: false, profile }));
        return;
      }

      if (!isPopulated) {
        dispatch(setActionOpen({ key: actionKey, isOpen: true, profile }));
      }

      dispatch(setDockPanelWidth({ key: flow, width: inPixels, profile }));
    });
  }, [profile, dispatch, startActionKey, endActionKey, isStartPopulated, isEndPopulated]);

  const breakpoint = useAppSelector(state => state.theming.breakpoint);

  const dockingPref = preferences.docking.dock;
  const dockingMap = useMemo(() => makeBreakpointsMap<ThDockingTypes>({
    defaultValue: ThDockingTypes.both,
    fromEnum: ThDockingTypes,
    pref: dockingPref,
    disabledValue: ThDockingTypes.none
  }), [dockingPref]);

  const dockConfig = breakpoint && dockingMap[breakpoint] || ThDockingTypes.both;
  const hasStartSlot = dockConfig === ThDockingTypes.both || dockConfig === ThDockingTypes.start;
  const hasEndSlot = dockConfig === ThDockingTypes.both || dockConfig === ThDockingTypes.end;

  if (!preferences.docking.dock) {
    return(
      <>
      { children }
      </>
    )
  } else {
    return (
      <>
      <Group id="docking-panel-group" orientation="horizontal" onLayoutChanged={ handleLayoutChanged }>
        {
          hasStartSlot
          && profile && <DockPanel
            actionKey={ startActionKey }
            flow={ ThDockingKeys.start }
            dockConfig={ dockConfig }
            sizes={{
              minWidth: startPanel.getMinWidth(),
              maxWidth: startPanel.getMaxWidth()
            }}
            targetWidth={ startPanel.getTargetWidth() }
            isResizable={ startPanel.isResizable() }
            isPopulated={ startPanel.isPopulated() }
            hasDragIndicator={ startPanel.hasDragIndicator() }
            profile={ profile }
            panelRef={ startPanelRef }
          />
        }

        <Panel id="main-panel">
          { children }
        </Panel>

        {
          hasEndSlot
          && profile && <DockPanel
            actionKey={ endActionKey }
            flow={ ThDockingKeys.end }
            dockConfig={ dockConfig }
            sizes={{
              minWidth: endPanel.getMinWidth(),
              maxWidth: endPanel.getMaxWidth()
            }}
            targetWidth={ endPanel.getTargetWidth() }
            isResizable={ endPanel.isResizable() }
            isPopulated={ endPanel.isPopulated() }
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