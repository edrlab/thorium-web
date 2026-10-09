"use client";

import React, { Ref } from "react";

import { Button, ButtonProps } from "react-aria-components";

import { HTMLAttributesWithRef, WithRef } from "../customTypes";

export interface ThMiniPlayerProps extends React.HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  heading: string;
  subheading?: string;
  /**
   * Makes the metadata area a button expanding the player.
   */
  onExpand?: () => void;
  /**
   * Prefix of the expand button’s accessible name, followed by the heading and subheading.
   */
  expandLabel?: string;
  controls?: React.ReactNode;
  actions?: React.ReactNode;
  compounds?: {
    expandButton?: WithRef<Omit<ButtonProps, "onPress" | "aria-label">, HTMLButtonElement>;
    metadata?: HTMLAttributesWithRef<HTMLDivElement>;
    heading?: React.HTMLAttributes<HTMLSpanElement>;
    subheading?: React.HTMLAttributes<HTMLSpanElement>;
    controls?: HTMLAttributesWithRef<HTMLDivElement>;
    actions?: HTMLAttributesWithRef<HTMLDivElement>;
  };
}

export const ThMiniPlayer = ({
  ref,
  heading,
  subheading,
  onExpand,
  expandLabel,
  controls,
  actions,
  compounds,
  ...props
}: ThMiniPlayerProps) => {
  const metadataContent = (
    <>
      <span { ...compounds?.heading }>{ heading }</span>
      { subheading && <span { ...compounds?.subheading }>{ subheading }</span> }
    </>
  );

  const accessibleName = [heading, subheading].filter(Boolean).join(", ");

  return (
    <section ref={ ref } { ...props }>
      { onExpand ? (
        <Button
          { ...compounds?.expandButton }
          aria-label={ expandLabel ? `${ expandLabel }: ${ accessibleName }` : accessibleName }
          onPress={ onExpand }
        >
          { metadataContent }
        </Button>
      ) : (
        <div { ...compounds?.metadata }>
          { metadataContent }
        </div>
      ) }
      { controls && <div { ...compounds?.controls }>{ controls }</div> }
      { actions && <div { ...compounds?.actions }>{ actions }</div> }
    </section>
  );
};
