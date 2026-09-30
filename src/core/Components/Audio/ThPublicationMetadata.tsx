"use client";

import React from "react";

export interface ThPublicationMetadataProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  subtitle?: string;
  authors?: string[];
  /**
   * Order of the metadata items: "title", "titleWithSubtitle", "subtitleWithTitle", "authors".
   */
  order: string[];
  /**
   * Extra content rendered after the ordered items, e.g. the current chapter.
   */
  extra?: React.ReactNode;
  compounds?: {
    title?: React.HTMLAttributes<HTMLHeadingElement>;
    subtitle?: React.HTMLAttributes<HTMLParagraphElement>;
    authors?: React.HTMLAttributes<HTMLParagraphElement>;
  };
}

export const ThPublicationMetadata = ({
  title,
  subtitle,
  authors,
  order,
  extra,
  compounds,
  ...props
}: ThPublicationMetadataProps) => {
  const renderItem = (item: string) => {
    switch (item) {
      case "title":
        return <h1 key="title" { ...compounds?.title }>{ title }</h1>;

      case "titleWithSubtitle":
        return (
          <hgroup key="title-with-subtitle">
            <h1 { ...compounds?.title }>{ title }</h1>
            { subtitle && <p { ...compounds?.subtitle }>{ subtitle }</p> }
          </hgroup>
        );

      case "subtitleWithTitle":
        return (
          <hgroup key="subtitle-with-title">
            { subtitle && <p { ...compounds?.subtitle }>{ subtitle }</p> }
            <h1 { ...compounds?.title }>{ title }</h1>
          </hgroup>
        );

      case "authors":
        return authors && authors.length > 0
          ? <p key="authors" { ...compounds?.authors }>{ authors.join(", ") }</p>
          : null;

      default:
        return null;
    }
  };

  return (
    <header { ...props }>
      { order.map(renderItem) }
      { extra }
    </header>
  );
};
