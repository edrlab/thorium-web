"use client";

import React, { Ref } from "react";

import { Button, ButtonProps } from "react-aria-components";

import { HTMLAttributesWithRef, WithRef } from "../customTypes";

export interface ThMiniPlayerProps extends React.HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  /**
   * The metadata area renders only with a heading or a cover.
   */
  heading?: string;
  subheading?: string;
  /**
   * Makes the metadata area a button expanding the player.
   */
  onExpand?: () => void;
  /**
   * Prefix of the expand button’s accessible name, followed by the heading and subheading.
   */
  expandLabel?: string;
  /**
   * Rendered before the heading, inside the expand button when there is one, so it must be phrasing content.
   */
  cover?: React.ReactNode;
  /**
   * Actions on the player itself, e.g. expand and close, rendered after the controls.
   */
  playerActions?: React.ReactNode;
  controls?: React.ReactNode;
  /**
   * Rendered before the metadata.
   */
  actions?: React.ReactNode;
  compounds?: {
    expandButton?: WithRef<Omit<ButtonProps, "onPress" | "aria-label">, HTMLButtonElement>;
    metadata?: HTMLAttributesWithRef<HTMLDivElement>;
    text?: React.HTMLAttributes<HTMLSpanElement>;
    heading?: React.HTMLAttributes<HTMLSpanElement>;
    subheading?: React.HTMLAttributes<HTMLSpanElement>;
    playerActions?: HTMLAttributesWithRef<HTMLDivElement>;
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
  cover,
  playerActions,
  controls,
  actions,
  compounds,
  ...props
}: ThMiniPlayerProps) => {
  const metadataContent = (
    <>
      { cover }
      <span { ...compounds?.text }>
        { heading && <span { ...compounds?.heading }>{ heading }</span> }
        { subheading && <span { ...compounds?.subheading }>{ subheading }</span> }
      </span>
    </>
  );

  const hasMetadata = !!(heading || cover);
  const accessibleName = [heading, subheading].filter(Boolean).join(", ");

  return (
    <section ref={ ref } { ...props }>
      { actions && <div { ...compounds?.actions }>{ actions }</div> }
      { hasMetadata && (onExpand ? (
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
      )) }
      { controls && <div { ...compounds?.controls }>{ controls }</div> }
      { playerActions && <div { ...compounds?.playerActions }>{ playerActions }</div> }
    </section>
  );
};
