"use client";

import React, { useEffect, useState } from "react";

import { useLocale } from "./Epub/AppLocale";
import progressionStyles from "./assets/styles/readerProgression.module.css";

import { ThProgression } from "@/core/Components/Reader/ThProgression";

import { useAppSelector } from "@/lib/hooks";

import parseTemplate from "json-templates";

export interface UnstableProgressionObject {
  totalPositions?: number;
  currentPositions?: number[];
  relativeProgression?: number;
  currentChapter?: string;
  totalProgression?: number;
  currentPublication?: string;
}

export const StatefulReaderProgression = () => {
  const locale = useLocale();

  const jsonTemplate = parseTemplate(locale.reader.app.progression.of);
  const progression: UnstableProgressionObject = useAppSelector(state => state.publication.progression);

  const [current, setCurrent] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (progression.totalPositions && progression.currentPositions) {
      setCurrent(progression.currentPositions.length === 2 ? `${progression.currentPositions[0]}–${progression.currentPositions[1]}` : `${progression.currentPositions}`);
      setReference(`${progression.totalPositions}`);
    } else if (progression.totalProgression !== undefined && progression.currentPublication) {
      setCurrent(`${Math.round(progression.totalProgression * 100)}%`);
      setReference(progression.currentPublication);
    } else if (progression.relativeProgression !== undefined && progression.currentChapter) {
      setCurrent(`${Math.round(progression.relativeProgression * 100)}%`);
      setReference(progression.currentChapter);
    } else {
      setCurrent("");
      setReference("");
    }
  }, [progression])

  return (
    <>
    {( current && reference ) 
    && <ThProgression 
      id={ progressionStyles.current } 
      aria-label={ locale.reader.app.progression.wrapper }
    >
      { jsonTemplate({ current: current, reference: reference }) }
    </ThProgression>}
    </>
  )
}