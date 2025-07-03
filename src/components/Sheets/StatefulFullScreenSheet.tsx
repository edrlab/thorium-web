"use client";

import React, { useRef } from "react";

import { useLocale } from "../Epub/AppLocale";

import { StatefulSheet } from "./models/sheets";
import { ThSheetHeaderVariant } from "@/preferences/models/enums";

import sheetStyles from "./assets/styles/sheets.module.css";
import readerSharedUI from "../assets/styles/readerSharedUI.module.css";

import { ThModal } from "@/core/Components/Containers/ThModal";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { ThNavigationButton } from "@/core/Components/Buttons/ThNavigationButton";
import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";

import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";

export interface StatefulFullScreenSheetProps extends StatefulSheet {};

export const StatefulFullScreenSheet = ({
    heading,
    headerVariant,
    className, 
    isOpen,
    onOpenChange, 
    onClosePress,
    children,
    resetFocus,
    focusWithinRef,
    dismissEscapeKeyClose
  }: StatefulFullScreenSheetProps) => {
  const direction = useAppSelector(state => state.reader.direction);
  const fullScreenHeaderRef = useRef<HTMLDivElement | null>(null);
  const fullScreenBodyRef = useRef<HTMLDivElement | null>(null);
  const fullScreenCloseRef = useRef<HTMLButtonElement | null>(null);
  const locale = useLocale();

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <ThModal 
        ref={ fullScreenBodyRef }
        focusOptions={{
          withinRef: focusWithinRef ?? fullScreenBodyRef,
          trackedState: isOpen,
          fallbackRef: fullScreenCloseRef,
          updateState: resetFocus
        }}
        compounds={{
          dialog: {
            className: sheetStyles.sheetDialog
          }
        }}
        isOpen={ isOpen }
        onOpenChange={ onOpenChange }
        isDismissable={ true }
        className={ classNames(sheetStyles.fullScreenSheet, className) }
        isKeyboardDismissDisabled={ dismissEscapeKeyClose }
        style={{
          "--sheet-sticky-header": fullScreenHeaderRef.current ? `${ fullScreenHeaderRef.current.clientHeight }px` : undefined
        }}
      >
        <ThContainerHeader 
          ref={ fullScreenHeaderRef }
          className={ sheetStyles.sheetHeader }
          label={ heading }
          compounds={{
            heading: {
              className: sheetStyles.sheetHeading
            }
          }}
        >
          { headerVariant === ThSheetHeaderVariant.previous
              ? <ThNavigationButton
                direction={ direction === "ltr" ? "left" : "right" }
                label={ locale.reader.app.back.trigger }
                ref={ fullScreenCloseRef }
                className={ classNames(className, readerSharedUI.backButton) } 
                aria-label={ locale.reader.app.back.trigger }
                onPress={ onClosePress }
              />
              : <ThCloseButton
                ref={ fullScreenCloseRef }
                className={ readerSharedUI.closeButton } 
                aria-label={ locale.reader.app.docker.close.trigger } 
                onPress={ onClosePress }
              />
            }
        </ThContainerHeader>
        <ThContainerBody 
          ref={ fullScreenBodyRef }
          className={ sheetStyles.sheetBody }
        >
          { children }
        </ThContainerBody>
      </ThModal>
      </>
    )
  }
}