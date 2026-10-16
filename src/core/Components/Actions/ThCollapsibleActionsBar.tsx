"use client";

import React, { RefObject, useMemo, useRef } from "react";

const MENU_DEPENDENCIES = ["Trigger"];

import { ThActionEntry, ThActionsBar, ThActionsBarProps, ThActionsTriggerVariant } from "./ThActionsBar";
import { ThMenu, THMenuProps } from "../Menu/ThMenu";

import { useObjectRef } from "react-aria";
import { ToolbarRenderProps, useRenderProps } from "react-aria-components";
import { CollapsiblePref, useCollapsibility } from "./hooks/useCollapsibility";

export interface ThCollapsibleActionsBarProps extends ThActionsBarProps {
  id: string;
  items: ThActionEntry<string>[];
  prefs: CollapsiblePref;
  breakpoint?: string;
  targetPlacement?: "top" | "bottom";
  children?: never;
  compounds?: {
    menu: THMenuProps<string> | React.ReactElement<typeof ThMenu>;
  }
}

interface ThCollapsibleActionProps {
  Trigger: ThActionEntry<string>["Trigger"];
  Target: ThActionEntry<string>["Target"];
  associatedKey?: string;
  barRef: RefObject<HTMLDivElement | null>;
  targetPlacement: "top" | "bottom";
  triggerProps: Omit<ThActionsBarProps, "ref">;
}

const ThCollapsibleAction = ({
  Trigger,
  Target,
  associatedKey,
  barRef,
  targetPlacement,
  triggerProps
}: ThCollapsibleActionProps) => {
  const triggerRef = useRef<HTMLElement | null>(null);

  // Triggers that don't forward their ref leave the target anchored to the bar
  const anchorRef = useMemo<RefObject<HTMLElement | null>>(() => ({
    get current() {
      return triggerRef.current ?? barRef.current;
    }
  }), [barRef]);

  return (
    <>
    <Trigger
      ref={ triggerRef }
      variant={ ThActionsTriggerVariant.button }
      { ...(associatedKey ? { associatedKey: associatedKey } : {}) }
      { ...triggerProps }
    />
    { Target && <Target triggerRef={ anchorRef } placement={ targetPlacement } /> }
    </>
  )
}

export const ThCollapsibleActionsBar = ({
  ref,
  id,
  items,
  prefs,
  breakpoint,
  targetPlacement = "bottom",
  compounds,
  ...props
}: ThCollapsibleActionsBarProps) => {
  const resolvedRef = useObjectRef(ref);
  const Actions = useCollapsibility(items, prefs, breakpoint, resolvedRef);

  const isSpaceFit = prefs.collapse === true;
  const { className } = useRenderProps({ ...props, values: {} as ToolbarRenderProps });

  return (
    <>
    <ThActionsBar
      ref={ resolvedRef }
      { ...props }
    >
      { isSpaceFit && (
        // Hidden measurement clone — renders with the same className as the real bar
        // so gap, display, and any other CSS-driven layout is identical.
        // Plain div (not Toolbar) to avoid a nested role="toolbar".
        // Absolutely positioned so it is out of flow; aria-hidden to exclude from AT.
        <div ref={ Actions.getGhostRef } className={ className } aria-hidden="true" style={{ position: "absolute", visibility: "hidden", pointerEvents: "none" }}>
          { items.map(({ Trigger, key }) =>
            <span key={ key } ref={ Actions.getItemRef(key) }>
              <Trigger variant={ ThActionsTriggerVariant.button } { ...props } />
            </span>
          )}
        </div>
      )}

      { Actions.ActionIcons.map(({ Trigger, Target, key, associatedKey }) =>
          <ThCollapsibleAction
            key={ key }
            Trigger={ Trigger }
            Target={ Target }
            associatedKey={ associatedKey }
            barRef={ resolvedRef }
            targetPlacement={ targetPlacement }
            triggerProps={ props }
          />
        )
      }

      { React.isValidElement(compounds?.menu)
        ? (React.cloneElement(compounds.menu, {
          id: id,
          triggerRef: resolvedRef,
          items: Actions.MenuItems,
          dependencies: MENU_DEPENDENCIES,
        } as THMenuProps<string>))
        : (<ThMenu
          id={ id }
          triggerRef={ resolvedRef }
          items={ Actions.MenuItems }
          dependencies={ MENU_DEPENDENCIES }
          { ...compounds?.menu }
        />
      )}
    </ThActionsBar>
    </>
  )
}
