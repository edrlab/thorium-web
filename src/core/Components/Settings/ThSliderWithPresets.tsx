"use client";

import { useCallback } from "react";

import { RadioGroupProps } from "react-aria-components";

import { HTMLAttributesWithRef } from "../customTypes";
import { ThSlider, ThSliderProps } from "./ThSlider";
import { ThRadioGroup, ThRadioGroupProps } from "./ThRadioGroup";

export interface ThSliderWithPresetsProps extends Omit<ThSliderProps, "compounds"> {
  presets: number[];
  formatValue?: (value: number) => string;
  compounds?: {
    /**
     * Props for the outer wrapper div (contains slider + presets).
     */
    wrapper?: HTMLAttributesWithRef<HTMLDivElement>;
    /**
     * Compounds forwarded to the inner ThSlider.
     */
    slider?: ThSliderProps["compounds"];
    /**
     * Props for the RadioGroup element wrapping the presets.
     */
    presetsList?: Omit<RadioGroupProps, "value" | "onChange" | "children">;
    /**
     * Props for the inner wrapper div containing the Radio items (grid container).
     */
    presetsWrapper?: HTMLAttributesWithRef<HTMLDivElement>;
    /**
     * Props applied to each preset Radio.
     */
    preset?: ThRadioGroupProps["compounds"] extends infer C ? C extends { radio?: infer R } ? R : never : never;
    /**
     * Props applied to the label span inside each preset Radio.
     */
    presetLabel?: ThRadioGroupProps["compounds"] extends infer C ? C extends { radioLabel?: infer L } ? L : never : never;
  };
}

export const ThSliderWithPresets = ({
  presets,
  formatValue,
  value,
  onChange,
  compounds,
  range,
  step,
  isDisabled,
  ...props
}: ThSliderWithPresetsProps) => {
  const currentValue = Array.isArray(value) ? value[0] : value;

  const handleChange = useCallback((v: string) => {
    onChange?.([parseFloat(v)]);
  }, [onChange]);

  const radioValue = currentValue !== undefined && presets.includes(currentValue)
    ? String(currentValue)
    : "";

  const radioItems = presets.map((p) => ({
    id: String(p),
    value: String(p),
    label: formatValue ? formatValue(p) : String(p),
  }));

  return (
    <div { ...compounds?.wrapper }>
      <ThSlider
        value={ value }
        onChange={ onChange }
        range={ range }
        step={ step }
        compounds={ compounds?.slider }
        isDisabled={ isDisabled }
        { ...props }
      />
      <ThRadioGroup
        { ...compounds?.presetsList }
        value={ radioValue }
        onChange={ handleChange }
        items={ radioItems }
        isDisabled={ isDisabled }
        compounds={{
          wrapper: compounds?.presetsWrapper,
          radio: compounds?.preset,
          radioLabel: compounds?.presetLabel,
        }}
      />
    </div>
  );
};
