"use client";

import React from "react";

import { WithRef } from "../customTypes";

import { ThContainerProps } from "./ThContainer";

import { Dialog, DialogProps, Modal, ModalOverlayProps } from "react-aria-components";

import { useObjectRef } from "react-aria";
import { useFirstFocusable } from "./hooks/useFirstFocusable";

export interface ThModalProps extends Omit<ModalOverlayProps, "children">, ThContainerProps {
  compounds?: {
    dialog: WithRef<DialogProps, HTMLDivElement>;
  }
}

export const ThModal = ({
  ref,
  id,
  focusOptions,
  compounds,
  children,
  ...props
}: ThModalProps) => {
  const resolvedRef = useObjectRef(ref as React.RefObject<HTMLDivElement | null>);

  const updatedFocusOptions = focusOptions ? {
    ...focusOptions,
    scrollerRef: focusOptions.scrollerRef || resolvedRef
  } : undefined;

  useFirstFocusable(updatedFocusOptions);

  return (
    <Modal
      ref={ resolvedRef }
      { ...props }
    >
      <Dialog id={ id } { ...compounds?.dialog }>
        { children }
      </Dialog>
    </Modal>
  )
}