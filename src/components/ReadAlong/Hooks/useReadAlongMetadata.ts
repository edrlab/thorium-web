"use client";

import { useEffect } from "react";

import { Publication } from "@readium/shared";

import { useAppDispatch } from "@/lib/hooks";
import { setReadAlongMetadata } from "@/lib/readAlongPlayerReducer";

// Action targets don't receive the publication, so the player reads it from the store
export const useReadAlongMetadata = (publication: Publication) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const { metadata } = publication;

    dispatch(setReadAlongMetadata({
      title: metadata.title.getTranslation("en"),
      subtitle: metadata.subtitle?.getTranslation("en"),
      authors: metadata.authors?.items.map(author => author.name.getTranslation("en")),
      coverUrl: publication.getCover()?.toURL(publication.baseURL)
    }));

    return () => {
      dispatch(setReadAlongMetadata(null));
    };
  }, [publication, dispatch]);
};
