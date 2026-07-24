"use client";

import React, { useRef, useEffect } from "react";

import { StatefulSheet } from "./models/sheets";
import { ThSheetHeaderVariant } from "@/preferences/models";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { ThModal } from "@/core/Components/Containers/ThModal";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { ThNavigationButton } from "@/core/Components/Buttons/ThNavigationButton";
import { StatefulDocker } from "../Docking/StatefulDocker";

import { useI18n } from "@/i18n";
import { useWebkitPatch } from "./hooks/useWebkitPatch";

import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";
import { prefixString } from "@/core/Helpers/prefixString";

export interface StatefulModalBaseProps extends StatefulSheet {
  sheetClassName: string;
  dialogClassName?: string;
};

export const StatefulModalBase = ({
    id,
    heading,
    headerVariant,
    className,
    sheetClassName,
    dialogClassName,
    isOpen,
    onOpenChange,
    onClosePress,
    docker,
    children,
    resetFocus,
    focusWithinRef,
    focusSelector,
    scrollTopOnFocus,
    dismissEscapeKeyClose
  }: StatefulModalBaseProps) => {
  const { t } = useI18n()
  const direction = useAppSelector(state => state.reader.direction);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetHeaderRef = useRef<HTMLDivElement | null>(null);
  const sheetBodyRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen && sheetRef.current && sheetHeaderRef.current) {
      sheetRef.current.style.setProperty(
        `--${ prefixString("sheet-sticky-header") }`,
        `${ sheetHeaderRef.current.clientHeight }px`
      );
    }
  }, [isOpen]);

  // Warning: This is a temporary fix for a bug in React Aria Components.
  useWebkitPatch(!!isOpen);

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <ThModal
        id={ id }
        ref={ sheetRef }
        focusOptions={{
          withinRef: focusWithinRef ?? sheetBodyRef,
          trackedState: isOpen,
          fallbackRef: sheetCloseRef,
          withSelector: focusSelector,
          action: {
            type: "focus",
            options: {
              preventScroll: scrollTopOnFocus ? true : false,
              scrollContainerToTop: scrollTopOnFocus
            }
          },
          updateState: resetFocus
        }}
        compounds={{
          dialog: {
            className: classNames(sheetStyles.dialog, dialogClassName, className)
          }
        }}
        isOpen={ isOpen }
        onOpenChange={ onOpenChange }
        isDismissable={ true }
        className={ sheetClassName }
        isKeyboardDismissDisabled={ dismissEscapeKeyClose }
      >
        <ThContainerHeader
          ref={ sheetHeaderRef }
          className={ sheetStyles.header }
          label={ heading }
          compounds={{
            heading: {
              className: sheetStyles.heading
            }
          }}
        >
          { headerVariant === ThSheetHeaderVariant.previous
              ? <ThNavigationButton
                direction={ direction === "ltr" ? "left" : "right" }
                label={ t("reader.app.back.trigger") }
                ref={ sheetCloseRef }
                className={ classNames(className, readerSharedUI.backButton) }
                aria-label={ t("reader.app.back.trigger") }
                onPress={ onClosePress }
              />
              : <StatefulDocker
                id={ id }
                keys={ docker || [] }
                ref={ sheetCloseRef }
                onClose={ onClosePress }
              />
            }
        </ThContainerHeader>
        <ThContainerBody
          ref={ sheetBodyRef }
          className={ sheetStyles.body }
        >
          { children }
        </ThContainerBody>
      </ThModal>
      </>
    )
  }
}
