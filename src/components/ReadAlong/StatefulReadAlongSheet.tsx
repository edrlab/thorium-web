"use client";

import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";
import sheetStyles from "../Sheets/assets/styles/thorium-web.sheets.module.css";
import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";

import { ThBottomSheet } from "@/core/Components/Containers/ThBottomSheet";
import { ThContainerHeader } from "@/core/Components/Containers/ThContainerHeader";
import { ThContainerBody } from "@/core/Components/Containers/ThContainerBody";
import { StatefulReadAlongMiniPlayer } from "./StatefulReadAlongMiniPlayer";

import { useI18n } from "@/i18n/useI18n";
import { useAppSelector } from "@/lib/hooks";

import classNames from "classnames";

export const StatefulReadAlongSheet = ({ isOpen }: { isOpen: boolean }) => {
  const { t } = useI18n();
  const prefersReducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);

  return (
    <ThBottomSheet
      isOpen={ isOpen }
      isDismissable={ false }
      isKeyboardDismissDisabled={ true }
      detent="content"
      disableScrollLocking={ true }
      prefersReducedMotion={ prefersReducedMotion }
      compounds={ {
        container: {
          className: classNames(sheetStyles.draggable, sheetStyles.draggableContentHeightDetent)
        },
        backdrop: {
          className: readAlongStyles.miniPlayerSheetBackdrop
        }
      } }
    >
      <ThContainerHeader
        label={ t("reader.actions.readAloud.compact") }
        compounds={ {
          heading: {
            className: readerStyles.srOnly
          }
        } }
      />
      <ThContainerBody className={ readAlongStyles.miniPlayerSheetBody }>
        <StatefulReadAlongMiniPlayer />
      </ThContainerBody>
    </ThBottomSheet>
  );
};
