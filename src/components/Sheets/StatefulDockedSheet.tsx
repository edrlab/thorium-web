"use client";

import React, { useCallback, useRef } from "react";

import { useLocale } from "../Epub/AppLocale";

import { StatefulSheet } from "./models/sheets";
import { ThDockingKeys, ThSheetHeaderVariant, ThLayoutDirection } from "@/preferences/models/enums";

import sheetStyles from "./assets/styles/sheets.module.css";
import readerSharedUI from "../assets/styles/readerSharedUI.module.css";

import { ThDockedPanel } from "@/core/Components/Containers/ThDockedPanel";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { StatefulDocker } from "../Docking/StatefulDocker";
import { ThNavigationButton } from "@/core/Components/Buttons/ThNavigationButton";

import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";

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
    focusWithinRef
  }: StatefulDockedSheetProps) => {
  const dockPortal = flow && document.getElementById(flow);
  const dockedSheetHeaderRef = useRef<HTMLDivElement | null>(null);
  const dockedSheetBodyRef = useRef<HTMLDivElement | null>(null);
  const dockedSheetCloseRef = useRef<HTMLButtonElement | null>(null);

  const direction = useAppSelector(state => state.reader.direction);
  const locale = useLocale();

  const classFromFlow = useCallback(() => {
    if (flow === ThDockingKeys.start) {
      return direction === ThLayoutDirection.ltr ? sheetStyles.dockedSheetLeftBorder : sheetStyles.dockedSheetRightBorder;
    } else if (flow === ThDockingKeys.end) {
      return direction === ThLayoutDirection.ltr ? sheetStyles.dockedSheetRightBorder : sheetStyles.dockedSheetLeftBorder;
    }
  }, [flow, direction]);

  if (React.Children.toArray(children).length > 0) {
    return(
      <>
      <ThDockedPanel
        isOpen={ isOpen }
        portal={ dockPortal }
        focusOptions={ {
          withinRef: focusWithinRef ?? dockedSheetBodyRef, 
          trackedState: isOpen, 
          fallbackRef: dockedSheetCloseRef,
          autoFocus: false,
          updateState: resetFocus
        }}
        className={ classNames(sheetStyles.dockedSheet, className, classFromFlow()) }
        style={{
          "--sheet-sticky-header": dockedSheetHeaderRef.current ? `${ dockedSheetHeaderRef.current.clientHeight }px` : undefined
        }}
      >
        <ThContainerHeader 
          ref={ dockedSheetHeaderRef }
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
              ref={ dockedSheetCloseRef }
              className={ classNames(className, readerSharedUI.backButton) } 
              aria-label={ locale.reader.app.back.trigger }
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
          className={ sheetStyles.sheetBody }
        >
          { children }
        </ThContainerBody>
      </ThDockedPanel>
      </>
    )
  }
}