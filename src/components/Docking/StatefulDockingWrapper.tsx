"use client";

import { ReactNode, RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import dockingStyles from "./assets/styles/thorium-web.docking.module.css";

import { Group, Layout, LayoutChangedMeta, Panel, PanelImperativeHandle, Separator } from "react-resizable-panels";

import { ThDockingTypes, ThDockingKeys, ThDockingSizeValue, ThLayoutDirection } from "@/preferences/models";
import { ActionsStateKeys } from "@/lib/actionsReducer";

import { usePrevious } from "@/core/Hooks/usePrevious";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useResizablePanel } from "./hooks/useResizablePanel";
import { useDockCleanup } from "./hooks/useDockCleanup";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { activateDockPanel, collapseDockPanel, deactivateDockPanel, expandDockPanel, setActionOpen, setDockPanelWidth } from "@/lib/actionsReducer";

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
  sizes,
  targetWidth,
  isResizable,
  isPopulated,
  isCollapsed,
  hasDragIndicator,
  profile,
  panelRef
}: {
  actionKey: ActionsStateKeys | null;
  flow: ThDockingKeys.start | ThDockingKeys.end;
  sizes: DockPanelSizes;
  targetWidth: ThDockingSizeValue;
  isResizable: boolean;
  isPopulated: boolean;
  isCollapsed: boolean;
  hasDragIndicator?: boolean;
  profile: string;
  panelRef: RefObject<PanelImperativeHandle | null>;
}) => {
  const { t } = useI18n();

  const direction = useAppSelector(state => state.reader.direction);
  const dispatch = useAppDispatch();

  // Read through a ref so a resize, which updates the remembered width, doesn’t
  // change expandPanel’s identity and re-trigger the sync effect below
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
  // Group's onLayoutChanged callback (see StatefulDockingWrapper), which is
  // their only writer: the DOM layout is the source of truth for both, and a
  // second writer here would fight it.
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

  // resize() rather than expand(): expand() restores whatever size the library
  // happens to remember and falls back to minSize when it remembers nothing,
  // which is the case for every panel here since they all mount shut
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

  // Deferred to the next animation frame: a breakpoint change can mount a
  // DockPanel in the same commit its populated state changes, racing the
  // Group's own panel registration and throwing (see collapsePanel/
  // expandPanel above). Running after that commit has settled avoids it.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      isPopulated ? expandPanel() : collapsePanel();
    });

    return () => cancelAnimationFrame(raf);
  }, [isPopulated, collapsePanel, expandPanel]);

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
      // registerPanel effect deps, so any change unregisters and re-registers
      // the Panel and makes the Group emit a layout event — a render-driven
      // value here would feed straight back into a dispatch. Every panel
      // therefore starts shut and is sized by the effect above once it holds an
      // open action, which is also what stops it flashing at full width first.
      defaultSize={ 0 }
      minSize={ sizes.minWidth }
      maxSize={ sizes.maxWidth }
      groupResizeBehavior="preserve-pixel-size"
      // Driven by occupancy, not by the collapsed mirror: a panel holding no
      // open action is inert, while a panel the user dragged shut still has to
      // accept the drag that reopens it
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
  // A panel that has never laid out is collapsed as far as this mirror is
  // concerned, so the first real layout is treated as a transition
  const wasCollapsedRef = useRef<Record<ThDockingKeys.start | ThDockingKeys.end, boolean>>({
    [ThDockingKeys.start]: true,
    [ThDockingKeys.end]: true
  });

  const startActionKey = startPanel.currentKey();
  const endActionKey = endPanel.currentKey();

  // Sole writer of `dock[slot].collapsed` and of the persisted widths. The DOM
  // layout is the source of truth for both, so nothing else may dispatch them.
  //
  // onLayoutChanged fires once per completed interaction (mouse release or
  // keyboard press) rather than on every frame of a drag, per the library's own
  // guidance for "saving a layout".
  const handleLayoutChanged = useCallback((_layout: Layout, meta: LayoutChangedMeta) => {
    if (!profile) return;

    ([
      [ThDockingKeys.start, startPanelRef, startActionKey],
      [ThDockingKeys.end, endPanelRef, endActionKey]
    ] as const).forEach(([flow, ref, actionKey]) => {
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

          // Dragging a panel shut is how the user closes a docked action; the
          // width it had is already persisted, so the trigger reopens it there
          if (meta.isUserInteraction && actionKey) {
            dispatch(setActionOpen({ key: actionKey, isOpen: false, profile }));
          }
        }
      } else {
        if (wasCollapsed) {
          dispatch(expandDockPanel({ slot: flow, profile }));
        }

        // Only a real resize may overwrite the remembered width. Mounting,
        // constraint recomputation and our own imperative calls all emit layout
        // events too, and letting those through is what makes a docked panel
        // drift with the window instead of holding its pixel width.
        if (meta.isUserInteraction) {
          dispatch(setDockPanelWidth({ key: flow, width: inPixels, profile }));
        }
      }
    });
  }, [profile, dispatch, startActionKey, endActionKey]);

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
  const previousHasStartSlot = usePrevious(hasStartSlot);
  const previousHasEndSlot = usePrevious(hasEndSlot);

  // Closing the occupant of a slot the breakpoint has just taken away belongs
  // here, not in the occupant's own useDocking: that hook lives in the action's
  // container, which is not necessarily mounted at every breakpoint, so an
  // action whose trigger is hidden in the narrow layout would never be told to
  // close. It would still read as open when the slot came back, and the panel
  // would reopen empty. This wrapper is always mounted.
  //
  // Strictly the edge, never the standing state: while the slot is missing the
  // action has to stay openable as its fallback sheet, which a standing
  // condition would undo by closing it again on every open.
  //
  // `docking` is deliberately untouched, so the action reclaims the slot as
  // soon as the breakpoint allows it again.
  useEffect(() => {
    if (!profile) return;

    if (previousHasStartSlot && !hasStartSlot && startActionKey) {
      dispatch(setActionOpen({ key: startActionKey, isOpen: false, profile }));
    }
    if (previousHasEndSlot && !hasEndSlot && endActionKey) {
      dispatch(setActionOpen({ key: endActionKey, isOpen: false, profile }));
    }
  }, [dispatch, profile, hasStartSlot, hasEndSlot, previousHasStartSlot, previousHasEndSlot, startActionKey, endActionKey]);

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
            sizes={{
              minWidth: startPanel.getMinWidth(),
              maxWidth: startPanel.getMaxWidth()
            }}
            targetWidth={ startPanel.getTargetWidth() }
            isResizable={ startPanel.isResizable() }
            isPopulated={ startPanel.isPopulated() }
            isCollapsed={ startPanel.isCollapsed() }
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
            sizes={{
              minWidth: endPanel.getMinWidth(),
              maxWidth: endPanel.getMaxWidth()
            }}
            targetWidth={ endPanel.getTargetWidth() }
            isResizable={ endPanel.isResizable() }
            isPopulated={ endPanel.isPopulated() }
            isCollapsed={ endPanel.isCollapsed() }
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