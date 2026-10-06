"use client";

import { useId } from "react";

import { HTMLAttributesWithRef, WithRef } from "../customTypes";

import {
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorSwatchPickerItemProps,
  ColorSwatchPickerProps,
  ColorSwatchProps,
  Heading,
  HeadingProps
} from "react-aria-components";

export interface ThColorSwatchPickerProps extends Omit<ColorSwatchPickerProps, "children"> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  swatches: string[];
  heading?: string;
  isDisabled?: boolean;
  compounds?: {
    /**
     * Props for the wrapper component. See `HTMLAttributesWithRef` for more information.
     */
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>;
    /**
     * Props for the heading component. See `HeadingProps` for more information.
     */
    heading?: WithRef<HeadingProps, HTMLHeadingElement>;
    /**
     * Props for each swatch item. See `ColorSwatchPickerItemProps` for more information.
     */
    item?: Omit<ColorSwatchPickerItemProps, "color" | "children">;
    /**
     * Props for the swatch inside each item. See `ColorSwatchProps` for more information.
     */
    swatch?: ColorSwatchProps;
  }
}

export const ThColorSwatchPicker = ({
  ref,
  swatches,
  heading,
  isDisabled,
  compounds,
  ...props
}: ThColorSwatchPickerProps) => {
  const headingId = useId();

  return(
    <>
    <div { ...compounds?.wrapper }>
      { heading && <Heading id={ headingId } { ...compounds?.heading }>
          { heading }
        </Heading>
      }
      <ColorSwatchPicker
        ref={ ref }
        aria-labelledby={ heading && !props["aria-label"] ? headingId : undefined }
        { ...props }
      >
        { swatches.map((swatch) =>
          <ColorSwatchPickerItem
            key={ swatch }
            { ...compounds?.item }
            color={ swatch }
            isDisabled={ isDisabled }
          >
            <ColorSwatch { ...compounds?.swatch } />
          </ColorSwatchPickerItem>
        ) }
      </ColorSwatchPicker>
    </div>
    </>
  )
}
