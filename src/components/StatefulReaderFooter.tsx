"use client";

import React from "react";

import { useLocale } from "./Epub/AppLocale"
import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch } from "@/lib/hooks";

import { ThFooter } from "@/core/Components/Reader/ThFooter";
import { StatefulReaderProgression } from "./StatefulReaderProgression";

export const StatefulReaderFooter = () => {
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const setHover = () => {
    dispatch(setHovering(true));
  };

  const removeHover = () => {
    dispatch(setHovering(false));
  };

  return(
    <>
    <ThFooter 
      id="bottom-bar" 
      aria-label={ locale.reader.app.footer.label } 
      onMouseEnter={ setHover } 
      onMouseLeave={ removeHover }
    >
      <StatefulReaderProgression />
    </ThFooter>
    </>
  )
}