"use client";

import React, { useCallback, useRef, useEffect } from "react";

import { StatefulSheet } from "./models/sheets";
import { ThDockingKeys, ThSheetHeaderVariant, ThLayoutDirection } from "@/preferences/models";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import { ThDockedPanel } from "@/core/Components/Containers/ThDockedPanel";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { StatefulDocker } from "../Docking/StatefulDocker";
import { ThNavigationButton } from "@/core/Components/Buttons/ThNavigationButton";

import { useI18n } from "@/i18n";

import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";
import { prefixString } from "@/core/Helpers/prefixString";

export interface StatefulDockedSheetProps extends StatefulSheet {
  flow: ThDockingKeys.start | ThDockingKeys.end | null;
}

export const StatefulDockedSheet = ({ 
    id,
    heading,
    headerVariant,
    className, 
    isOpen,
    onClosePress,
    docker, 
    flow,
    children,
    resetFocus,
    focusSelector,
    focusWithinRef
  }: StatefulDockedSheetProps) => {
  const { t } = useI18n()
  const dockPortal = flow && document.getElementById(flow);
  const dockedSheetRef = useRef<HTMLDivElement | null>(null);
  const dockedSheetHeaderRef = useRef<HTMLDivElement | null>(null);
  const dockedSheetBodyRef = useRef<HTMLDivElement | null>(null);
  const dockedSheetCloseRef = useRef<HTMLButtonElement | null>(null);

  const direction = useAppSelector(state => state.reader.direction);

  // Update the CSS variable when the sheet is open and header ref is available
  useEffect(() => {
    if (isOpen && dockedSheetRef.current && dockedSheetHeaderRef.current) {
      dockedSheetRef.current.style.setProperty(
        `--${ prefixString("sheet-sticky-header") }`,
        `${ dockedSheetHeaderRef.current.clientHeight }px`
      );
    }
  }, [isOpen]);

  const classFromFlow = useCallback(() => {
    if (flow === ThDockingKeys.start) {
      return direction === ThLayoutDirection.ltr ? sheetStyles.dockedLeftBorder : sheetStyles.dockedRightBorder;
    } else if (flow === ThDockingKeys.end) {
      return direction === ThLayoutDirection.ltr ? sheetStyles.dockedRightBorder : sheetStyles.dockedLeftBorder;
    }
  }, [flow, direction]);

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <ThDockedPanel
        id={ id }
        ref={ dockedSheetRef }
        isOpen={ isOpen }
        portal={ dockPortal }
        focusOptions={{
          withinRef: focusWithinRef ?? dockedSheetBodyRef,
          trackedState: isOpen,
          fallbackRef: dockedSheetCloseRef,
          withSelector: focusSelector,
          action: {
            type: "scrollIntoView",
            options: {
              behavior: "instant",
              block: "center",
              inline: "nearest"
            }
          },
          updateState: resetFocus
        }}
        className={ classNames(sheetStyles.docked, className, classFromFlow()) }
      >
        <ThContainerHeader 
          ref={ dockedSheetHeaderRef }
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
              ref={ dockedSheetCloseRef }
              className={ classNames(className, readerSharedUI.backButton) } 
              aria-label={ t("reader.app.back.trigger") }
              onPress={ onClosePress }
            /> 
            : <StatefulDocker 
              id={ id }
              keys={ docker || [] }
              ref={ dockedSheetCloseRef }
              onClose={ onClosePress }
            />
          } 
        </ThContainerHeader>
        <ThContainerBody 
          ref={ dockedSheetBodyRef }
          className={ sheetStyles.body }
        >
          { children }
        </ThContainerBody>
      </ThDockedPanel>
      </>
    )
  }
}