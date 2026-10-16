"use client";

import settingsStyles from "./assets/styles/thorium-web.reader.settings.module.css";

import { ThColorSwatchPicker, ThColorSwatchPickerProps } from "@/core/Components/Settings/ThColorSwatchPicker";

export interface StatefulColorSwatchPickerProps extends Omit<ThColorSwatchPickerProps, "compounds"> {
  standalone?: boolean;
}

export const StatefulColorSwatchPicker = ({
  standalone,
  heading,
  ...props
}: StatefulColorSwatchPickerProps) => {
  return(
    <>
    <ThColorSwatchPicker
      { ...props }
      { ...(standalone ? { heading: heading } : { "aria-label": heading }) }
      className={ settingsStyles.swatchPicker }
      compounds={{
        wrapper: {
          className: standalone ? settingsStyles.group : undefined
        },
        heading: {
          className: settingsStyles.label
        },
        item: {
          className: settingsStyles.swatchPickerItem
        },
        swatch: {
          className: settingsStyles.swatch
        }
      }}
    />
    </>
  )
}
