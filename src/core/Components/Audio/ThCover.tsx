"use client";

import React, { Ref } from "react";

export interface ThCoverProps extends Omit<React.HTMLAttributes<HTMLElement>, "placeholder"> {
  ref?: Ref<HTMLElement>;
  src?: string;
  alt: string;
  isLoading?: boolean;
  placeholder?: React.ReactNode;
  loadingIndicator?: React.ReactNode;
  compounds?: {
    image?: Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
    placeholder?: React.HTMLAttributes<HTMLDivElement>;
    loadingOverlay?: React.HTMLAttributes<HTMLDivElement>;
  };
}

export const ThCover = ({
  ref,
  src,
  alt,
  isLoading,
  placeholder,
  loadingIndicator,
  compounds,
  ...props
}: ThCoverProps) => {
  return (
    <figure ref={ ref } { ...props }>
      { src ? (
        <img
          src={ src }
          alt={ alt }
          { ...compounds?.image }
        />
      ) : (
        <div { ...compounds?.placeholder }>
          { isLoading ? loadingIndicator : placeholder }
        </div>
      ) }
      { src && isLoading && loadingIndicator && (
        <div aria-hidden="true" { ...compounds?.loadingOverlay }>
          { loadingIndicator }
        </div>
      ) }
    </figure>
  );
};
