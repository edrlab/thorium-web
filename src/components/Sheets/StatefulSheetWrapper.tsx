"use client";

import { ReactNode } from "react";

import { ThDockingKeys, ThSheetTypes } from "@/preferences/models";

import { ThTypedComponentRenderer } from "@/core/Components/Containers/ThTypedComponentRenderer";
import { StatefulPopoverSheet, StatefulPopoverSheetProps } from "./StatefulPopoverSheet";
import { StatefulModalSheet, StatefulModalSheetProps } from "./StatefulModalSheet";
import { StatefulBottomSheet, StatefulBottomSheetProps } from "./BottomSheet";
import { StatefulFullScreenSheet, StatefulFullScreenSheetProps } from "./StatefulFullScreenSheet";
import { StatefulDockedSheet, StatefulDockedSheetProps } from "./StatefulDockedSheet";
import { StatefulCompactPopoverSheet } from "./StatefulCompactPopoverSheet";

const componentMap = {
  [ThSheetTypes.compactPopover]: StatefulCompactPopoverSheet,
  [ThSheetTypes.popover]: StatefulPopoverSheet,
  [ThSheetTypes.modal]: StatefulModalSheet,
  [ThSheetTypes.bottomSheet]: StatefulBottomSheet,
  [ThSheetTypes.fullscreen]: StatefulFullScreenSheet,
  [ThSheetTypes.dockedStart]: (props: StatefulDockedSheetProps) => <StatefulDockedSheet { ...props } flow={ ThDockingKeys.start } />,
  [ThSheetTypes.dockedEnd]: (props: StatefulDockedSheetProps) => <StatefulDockedSheet { ...props } flow={ ThDockingKeys.end } />
};

export const StatefulSheetWrapper = ({
  sheetType,
  sheetProps,
  children
}: {
  sheetType: ThSheetTypes,
  sheetProps: StatefulPopoverSheetProps | StatefulModalSheetProps | StatefulFullScreenSheetProps | StatefulDockedSheetProps | StatefulBottomSheetProps,
  children: ReactNode
}) => {

  return (
    <ThTypedComponentRenderer
      type={ sheetType }
      componentMap={ componentMap }
      props={ sheetProps }
    >
      { children }
    </ThTypedComponentRenderer>
  );
}