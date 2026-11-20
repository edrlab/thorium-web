"use client";

import React from "react";

import { WithRef } from "../customTypes";

import { Button, ButtonProps, TooltipProps, TooltipTrigger } from "react-aria-components";
import { TooltipTriggerProps } from "react-aria";

import { ThTooltip } from "../Tooltips/ThTooltip";

export interface ThActionButtonProps extends ButtonProps {
  label?: string,
  ref?: React.ForwardedRef<HTMLButtonElement>,
  compounds?: {
    /**
     * Props for the tooltipTrigger component. See `TooltipTriggerProps` for more information.
     */
    tooltipTrigger?: WithRef<TooltipTriggerProps, HTMLDivElement>,
    /**
     * Props for the tooltip component. See `TooltipProps` for more information.
     */
    tooltip?: WithRef<TooltipProps, HTMLDivElement>,
    /**
     * Content for the tooltip
     */
    label: React.ReactNode
  }
}

export const ThActionButton = ({
  ref,
  compounds,
  children,
  ...props
}: ThActionButtonProps) => {  
  if (compounds) {
    return (
      <>
      <TooltipTrigger
        { ...compounds.tooltipTrigger }
      >
        <Button 
          ref={ ref }
          { ...props }
        >
          { children } 
        </Button>
        <ThTooltip
          arrowBoundaryOffset={ 0 }
          { ...compounds.tooltip }
        >
          { compounds.label }
        </ThTooltip>
      </TooltipTrigger>
      </>
    )
  } else {
    return (
      <>
      <Button 
        { ...props }
      >
        { children }
      </Button>
      </>
    )
  }
}