"use client";

import { StatefulSheet } from "./models/sheets";
import { StatefulModalBase } from "./StatefulModalBase";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";

export interface StatefulFullScreenSheetProps extends StatefulSheet {};

export const StatefulFullScreenSheet = (props: StatefulFullScreenSheetProps) => {
  return (
    <StatefulModalBase
      { ...props }
      sheetClassName={ sheetStyles.fullscreen }
      // Its height is the viewport's, whatever the panel
      uniformPanelHeight={ false }
    />
  )
}
