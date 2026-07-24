"use client";

import React from "react";

import { WithRef } from "../../customTypes";

import { 
  Button,
  ButtonProps, 
  Label, 
  LabelProps, 
  ListBox, 
  ListBoxItem, 
  ListBoxItemProps, 
  ListBoxProps, 
  Popover, 
  PopoverProps, 
  Select, 
  SelectProps 
} from "react-aria-components";
import { ThDropdownButton, ThDropdownButtonProps } from "./ThDropdownButton";

export interface ThDropdownEntry {
  id: string;
  label: string;
  value: string;
}

export interface ThDropdownProps extends SelectProps<object> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  label?: string;
  items?: Iterable<ThDropdownEntry>;
  children?: never;
  compounds?: {
    /**
     * Props for the label component. See `LabelProps` for more information.
     */
    label?: WithRef<LabelProps, HTMLLabelElement>;
    /**
     * Props for the button component. See `ThDropdownButtonProps` for more information.
     * Alternatively you can provide your own Button component
     */
    button?: WithRef<ButtonProps, HTMLButtonElement> | React.ReactElement<typeof Button>;
    /**
     * Props for the popover component. See `PopoverProps` for more information.
     */
    popover?: WithRef<PopoverProps, HTMLDivElement>;
    /**
     * Props for the listbox component. See `LisboxProps` for more information.
     * Alternatively you can provide your own Listbox component
     */
    listbox?: WithRef<ListBoxProps<ThDropdownEntry>, HTMLDivElement> | React.ReactElement<typeof ListBox | HTMLDivElement>;
    /**
     * Props for the listboxItem component. See `ListBoxItemProps` for more information.
     */
    listboxItem?: ListBoxItemProps<ThDropdownEntry>;
  }
}

export const ThDropdown = ({
  ref,
  label,
  items,
  compounds,
  ...props
}: ThDropdownProps) => {
  if (!items && !React.isValidElement(compounds?.listbox)) {
    return null;
  }

  return(
    <>
    <Select
      ref={ ref }
      { ...props }
    >
      { label && <Label { ...compounds?.label }>
          { label }
        </Label>
      }
      { compounds?.button && React.isValidElement(compounds.button) 
        ? compounds.button 
        : <ThDropdownButton { ...compounds?.button as ThDropdownButtonProps } />
      }
      <Popover
        { ...compounds?.popover }
      >
      { compounds?.listbox && React.isValidElement(compounds.listbox) 
        ? compounds.listbox 
        : <ListBox 
            items={ items } 
            { ...compounds?.listbox }>
            { (item: ThDropdownEntry) => <ListBoxItem 
                { ...compounds?.listboxItem }
                id={ item.id } 
                key={ item.id } 
                textValue={ item.value || undefined }
              >
                { item.label }
              </ListBoxItem>
            }
          </ListBox>
      }
      </Popover>
    </Select>
    </>
  )
}
