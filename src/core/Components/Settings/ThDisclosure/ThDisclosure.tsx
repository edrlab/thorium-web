"use client";

import React, { ComponentType, SVGProps } from "react";

import ExpandMoreIcon from "./assets/icons/expand_more.svg";

import { WithRef } from "../../customTypes";

import {
  Button,
  ButtonProps,
  Disclosure,
  DisclosurePanel,
  DisclosurePanelProps,
  DisclosureProps,
  Heading,
  HeadingProps
} from "react-aria-components";

export interface ThDisclosureProps extends Omit<DisclosureProps, "children"> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  label: string;
  icon?: ComponentType<SVGProps<SVGElement>>;
  children?: React.ReactNode;
  compounds?: {
    /**
     * Props for the heading wrapping the trigger. See `HeadingProps` for more information.
     */
    heading?: WithRef<HeadingProps, HTMLHeadingElement>;
    /**
     * Props for the trigger button. See `ButtonProps` for more information.
     */
    button?: WithRef<ButtonProps, HTMLButtonElement>;
    /**
     * Props for the panel. See `DisclosurePanelProps` for more information.
     */
    panel?: WithRef<Omit<DisclosurePanelProps, "children">, HTMLDivElement>;
  }
}

export const ThDisclosure = ({
  ref,
  label,
  icon: Icon = ExpandMoreIcon,
  children,
  compounds,
  ...props
}: ThDisclosureProps) => {
  return (
    <>
    <Disclosure
      ref={ ref }
      { ...props }
    >
      <Heading { ...compounds?.heading }>
        <Button
          slot="trigger"
          { ...compounds?.button }
        >
          <span>{ label }</span>
          <Icon aria-hidden="true" focusable="false" />
        </Button>
      </Heading>
      <DisclosurePanel { ...compounds?.panel }>
        { children }
      </DisclosurePanel>
    </Disclosure>
    </>
  )
}
