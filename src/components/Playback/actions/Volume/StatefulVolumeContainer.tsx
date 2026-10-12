"use client";

import { useCallback } from "react";

import { ThSheetTypes } from "@/preferences/models";
import { ThSlider } from "@/core/Components/Settings/ThSlider";
import { StatefulActionContainerProps } from "../../../Actions/models/actions";

import { useI18n } from "@/i18n/useI18n";
import { useVolumeAction } from "./hooks/useVolumeAction";
import { useDocking } from "../../../Docking/hooks/useDocking";
import { StatefulSheetWrapper } from "@/components/Sheets/StatefulSheetWrapper";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";

import { isIOSish } from "@/core/Helpers/getPlatform";

export interface StatefulVolumeContainerProps extends StatefulActionContainerProps {
  className: string;
  compounds: {
    slider: { className: string };
    sliderTrack: { className: string };
    sliderThumb: { className: string };
  };
}

export const StatefulVolumeContainer = ({ triggerRef, placement = "top", className, compounds }: StatefulVolumeContainerProps) => {
  const { actionKey, config, range, volume, updateVolume } = useVolumeAction();
  const profile = useAppSelector(state => state.reader.profile);
  const isOpen = useAppSelector(state => profile ? state.actions.keys[profile][actionKey]?.isOpen ?? false : false);

  const { t } = useI18n();

  const dispatch = useAppDispatch();

  const updatePreference = useCallback(async (value: number | number[]) => {
    await updateVolume(Array.isArray(value) ? value[0] : value);
  }, [updateVolume]);

  const docking = useDocking(actionKey);

  const sliderOrientation = (docking.sheetType === ThSheetTypes.popover || docking.sheetType === ThSheetTypes.compactPopover)
    ? "vertical"
    : "horizontal";

  const setOpen = useCallback((open: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ key: actionKey, isOpen: open, profile }));
    }
  }, [dispatch, profile, actionKey]);

  if (isIOSish()) return null;

  return (
    <StatefulSheetWrapper
      sheetType={ docking.sheetType }
      sheetProps={ {
        id: actionKey,
        triggerRef,
        heading: t("reader.playback.preferences.audio.volume"),
        className,
        placement,
        isOpen,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
      } }
    >
      <ThSlider
        aria-label={ t("reader.playback.preferences.audio.volume") }
        className={ compounds.slider.className }
        orientation={ sliderOrientation }
        range={ range }
        step={ config.step }
        value={ volume }
        onChange={ updatePreference }
        compounds={ {
          track: { className: compounds.sliderTrack.className },
          thumb: { className: compounds.sliderThumb.className },
          output: { style: () => ({ display: "none" }) }
        } }
      />
    </StatefulSheetWrapper>
  );
};
