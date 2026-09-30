"use client";

import React from "react";

import { useObjectRef } from "react-aria";

import { TooltipProps } from "react-aria-components";
import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { ThShortcutConfig } from "@/preferences/models/actions";

import readerSharedUI from "../../assets/styles/thorium-web.button.module.css";

import { ThActionButton, ThActionButtonProps } from "@/core/Components/Buttons/ThActionButton";
import { StatefulShortcut } from "./StatefulShortcut";

import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";

import { useAppDispatch } from "@/lib/hooks";
import { setImmersive } from "@/lib/readerReducer";

import { isActiveElement, isKeyboardTriggered } from "@/core/Helpers/focusUtilities";
import classNames from "classnames";

export interface StatefulActionIconProps extends ThActionButtonProps {
  visibility?: ThCollapsibilityVisibility;
  placement?: TooltipProps["placement"];
  tooltipLabel?: string;
  shortcut?: ThShortcutConfig | null;
}

export const StatefulActionIcon = ({
  ref: externalRef,
  visibility,
  placement,
  tooltipLabel,
  shortcut,
  children,
  ...props
}: StatefulActionIconProps) => {
  const { theming, shortcuts } = useSharedPreferences();

  const triggerRef = useObjectRef(externalRef ?? null);

  const dispatch = useAppDispatch();

  const handleClassNameFromState = () => {
    let className = "";

    switch(visibility) {
      case ThCollapsibilityVisibility.always:
        className = readerSharedUI.alwaysVisible;
        break;
      case ThCollapsibilityVisibility.partially:
        className = readerSharedUI.partiallyVisible;
        break;
      case ThCollapsibilityVisibility.overflow:
      default:
        break;
    }

    return className
  };

  const defaultOnPressFunc = () => {
    dispatch(setImmersive(false));
  };

  const handleImmersive = (event: React.FocusEvent) => {
    // Check whether the focus was triggered by keyboard…
    // We don’t have access to type/modality, unlike onPress
    if (isKeyboardTriggered(event.target)) {
      dispatch(setImmersive(false));
    }
  };

  const blurOnEsc = (event: React.KeyboardEvent) => {
    if (triggerRef.current && isActiveElement(triggerRef.current) && event.code === "Escape") {
      triggerRef.current.blur();
    }
  };

  return (
    <ThActionButton
      ref={ triggerRef }
      className={ classNames(readerSharedUI.icon, handleClassNameFromState(), props.className) }
      onPress={ props.onPress || defaultOnPressFunc }
      onKeyDown={ blurOnEsc }
      onFocus={ handleImmersive }
      compounds={ tooltipLabel ? {
        tooltipTrigger: {
          delay: theming.icon.tooltipDelay,
          closeDelay: theming.icon.tooltipDelay
        },
        tooltip: {
          className: readerSharedUI.tooltip,
          placement: placement,
          offset: theming.icon.tooltipOffset || 0
        },
        label: (
          <>
            { tooltipLabel }
            { shortcut && shortcuts.displayIn?.includes("tooltip") && <StatefulShortcut className={ readerSharedUI.tooltipShortcut } combo={ shortcut } /> }
          </>
        )
      } : undefined }
      { ...Object.fromEntries(Object.entries(props).filter(([key]) => key !== "className")) }
    >
      { children }
    </ThActionButton>
  )
};