"use client";

import { StatefulSheet } from "./models/sheets";
import { StatefulModalBase } from "./StatefulModalBase";
import { ThSheetTypes } from "@/preferences/models";

import { useSharedPreferences } from "@/preferences/hooks/useSharedPreferences";
import { getSheetSizeConstraint } from "@/preferences/helpers/getSheetSizeConstraint";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";

export interface StatefulModalSheetProps extends StatefulSheet {
  /**
   * Subpanels take the height of the main panel, shown on open. A panel change is detected from `resetFocus`.
   */
  uniformPanelHeight?: boolean;
};

export const StatefulModalSheet = (props: StatefulModalSheetProps) => {
  const sharedPreferences = useSharedPreferences();

  return (
    <StatefulModalBase
      { ...props }
      maxHeight={ getSheetSizeConstraint(sharedPreferences.theming.layout.constraints[ThSheetTypes.modal], "height") }
      sheetClassName={ sheetStyles.modal }
      dialogClassName={ sheetStyles.modalDialog }
    />
  )
}
