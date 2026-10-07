"use client";

import { useCallback, useEffect } from "react";

import { ThActionsKeys, ThDockingKeys, ThMiniPlayerTypes } from "@/preferences/models";
import { StatefulActionContainerProps } from "../Actions/models/actions";

import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import CollapseIcon from "./assets/icons/expand_more.svg";

import { StatefulSheetWrapper } from "../Sheets/StatefulSheetWrapper";
import { StatefulActionIcon } from "../Actions/Triggers/StatefulActionIcon";
import { StatefulReadAlongPlayer } from "./StatefulReadAlongPlayer";

import { useDocking } from "../Docking/hooks/useDocking";
import { useReadAlongState } from "./Hooks/useReadAlongState";
import { useReadAlongPlacement } from "./Hooks/useReadAlongPlacement";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

export const StatefulReadAlongContainer = ({ triggerRef }: StatefulActionContainerProps) => {
  const { t } = useI18n();

  const profile = useAppSelector(state => state.reader.profile);
  const actionState = useAppSelector(state => profile ? state.actions.keys[profile][ThActionsKeys.readAlong] : undefined);
  const dispatch = useAppDispatch();
  const { isActive, setActive } = useReadAlongState();
  const docking = useDocking(ThActionsKeys.readAlong, { canReserve: isActive });
  const sheetType = docking.sheetType;
  const placement = useReadAlongPlacement();

  const setOpen = useCallback((value: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ key: ThActionsKeys.readAlong, isOpen: value, profile }));
    }
  }, [dispatch, profile]);

  // Since React Aria components intercept keys and do not continue propagation
  // we have to handle the escape key in capture phase
  useEffect(() => {
    if (actionState?.isOpen && (!actionState?.docking || actionState?.docking === ThDockingKeys.transient)) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleEscape, true);

      return () => {
        document.removeEventListener("keydown", handleEscape, true);
      };
    }
  }, [actionState, setOpen]);

  return (
    <StatefulSheetWrapper
      sheetType={ sheetType }
      sheetProps={ {
        id: ThActionsKeys.readAlong,
        triggerRef: triggerRef,
        heading: t("reader.actions.readAloud.compact"),
        placement: "bottom",
        // The compact bottom sheet hosts the expanded player itself
        isOpen: (actionState?.isOpen && placement !== ThMiniPlayerTypes.bottomSheet) || false,
        onOpenChange: setOpen,
        onClosePress: () => setActive(false),
        docker: docking.getDocker(),
        headerActions: (
          <StatefulActionIcon
            className={ readerSharedUI.dockerButton }
            aria-label={ t("_pendingThoriumLocales.reader.readAlong.player.collapse") }
            tooltipLabel={ t("_pendingThoriumLocales.reader.readAlong.player.collapse") }
            placement="bottom"
            onPress={ () => setOpen(false) }
          >
            <CollapseIcon aria-hidden="true" focusable="false" />
          </StatefulActionIcon>
        )
      } }
    >
      <StatefulReadAlongPlayer />
    </StatefulSheetWrapper>
  );
};
