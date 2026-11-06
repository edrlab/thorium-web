"use client";

import React from "react";

import { WithRef } from "../customTypes";

import { ThContainerProps } from "./ThContainer";

import { Dialog, DialogProps, Modal, ModalOverlayProps } from "react-aria-components";

import { useObjectRef } from "react-aria";
import { useFirstFocusable } from "./hooks/useFirstFocusable";
import { UseUniformPanelHeightProps, useUniformPanelHeight } from "./hooks/useUniformPanelHeight";

export interface ThModalProps extends Omit<ModalOverlayProps, "children">, ThContainerProps {
  /**
   * Max-height of the dialog in pixels, within the space the modal leaves it.
   */
  maxHeight?: number;
  uniformPanelHeightOptions?: Omit<UseUniformPanelHeightProps, "ref">;
  compounds?: {
    dialog: WithRef<DialogProps, HTMLDivElement>;
  }
}

export const ThModal = ({
  ref,
  id,
  focusOptions,
  maxHeight,
  uniformPanelHeightOptions,
  compounds,
  children,
  ...props
}: ThModalProps) => {
  const resolvedRef = useObjectRef(ref as React.RefObject<HTMLDivElement | null>);
  const { ref: dialogRefProp, style: dialogStyle, ...dialogProps } = compounds?.dialog ?? {};
  const dialogRef = useObjectRef(dialogRefProp as React.RefObject<HTMLDivElement | null> | undefined);

  const updatedFocusOptions = focusOptions ? {
    ...focusOptions,
    scrollerRef: focusOptions.scrollerRef || resolvedRef
  } : undefined;

  useFirstFocusable(updatedFocusOptions);

  // The dialog is the sized element, the modal is its full-viewport overlay
  useUniformPanelHeight({
    ref: dialogRef,
    isOpen: false,
    ...uniformPanelHeightOptions
  });

  return (
    <Modal
      ref={ resolvedRef }
      { ...props }
    >
      <Dialog
        id={ id }
        ref={ dialogRef }
        { ...dialogProps }
        style={ maxHeight ? { ...dialogStyle, maxHeight: `min(var(--visual-viewport-height, 100%), ${ maxHeight }px)` } : dialogStyle }
      >
        { children }
      </Dialog>
    </Modal>
  )
}