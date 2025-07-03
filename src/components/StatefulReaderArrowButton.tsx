"use client";

import React, { useEffect, useRef, useState } from "react";

import { useLocale } from "./Epub/AppLocale";

import arrowStyles from "./assets/styles/readerArrowButton.module.css";
import readerSharedUI from "./assets/styles/readerSharedUI.module.css";

import { PressEvent } from "react-aria";

import { ThNavigationButton, ThNavigationButtonProps } from "@/core/Components/Buttons/ThNavigationButton";

import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePrevious } from "@/core/Hooks/usePrevious";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setArrows } from "@/lib/readerReducer";

import { isActiveElement } from "@/core/Helpers/focusUtilities";

import classNames from "classnames";

export interface StatefulReaderArrowButtonProps extends ThNavigationButtonProps {
  direction: "left" | "right";
  occupySpace: boolean;
}

export const StatefulReaderArrowButton = ({
  direction,
  occupySpace,
  className,
  isDisabled,
  onPress,
  ...props
}: StatefulReaderArrowButtonProps) => {
  const locale = useLocale();
  const RSPrefs = usePreferences();
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isRTL = useAppSelector(state => state.publication.isRTL);
  const hasArrows = useAppSelector(state => state.reader.hasArrows);

  const isScroll = useAppSelector(state => state.settings.scroll);
  const wasScroll = usePrevious(isScroll);

  const dispatch = useAppDispatch();

  const [isHovering, setIsHovering] = useState(false);

  const switchedFromScrollable = () => {
    return wasScroll && !isScroll;
  }

  const label = (
    direction === "right" && !isRTL || 
    direction === "left" && isRTL
  ) 
    ? locale.reader.navigation.goForward 
    : locale.reader.navigation.goBackward;

  const handleClassNameFromState = () => {
    let className = "";
    if (!hasArrows && !switchedFromScrollable()) {
      className = arrowStyles.visuallyHidden;
    }
    return className;
  };

  const handleClassNameFromSpaceProp = () => {
    let className = "";
    if (occupySpace) {
      className = arrowStyles.viewportLarge;
    }
    return className;
  };

  useEffect(() => {
    if ((isDisabled || (!hasArrows && !isHovering)) && isActiveElement(buttonRef.current)) {
      buttonRef.current!.blur();
    }
  });

  const blurOnEsc = (event: React.KeyboardEvent) => {    
    if (isActiveElement(buttonRef.current) && event.code === "Escape") {
      buttonRef.current!.blur();
    }
  };

  const handleOnPress = (e: PressEvent, cb: (e: PressEvent) => void) => {
    dispatch(setArrows(false));
    cb(e);
  }

  return (
    <>
    <ThNavigationButton 
      direction={ direction }
      ref= { buttonRef }
      aria-label={ label }
      onPress={ (e: PressEvent) => onPress && handleOnPress(e, onPress) }
      onHoverChange={ (isHovering: boolean) => setIsHovering(isHovering) } 
      onKeyDown={ blurOnEsc }
      className={ classNames(className, handleClassNameFromSpaceProp(), handleClassNameFromState()) }
      isDisabled={ isDisabled }
      preventFocusOnPress={ true }
      { ...props }
      compounds={ {
        tooltipTrigger: {
          delay: RSPrefs.theming.arrow.tooltipDelay,
          closeDelay: RSPrefs.theming.arrow.tooltipDelay
        },
        tooltip: {
          placement: direction === "left" ? "right" : "left",
          className: readerSharedUI.tooltip
        },
        label: label
      } }
    />
    </>
  )
}