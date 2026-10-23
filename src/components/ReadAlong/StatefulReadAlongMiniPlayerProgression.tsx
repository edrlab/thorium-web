"use client";

import { RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import progressionStyles from "../assets/styles/thorium-web.reader.progression.module.css";
import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";

import { ThProgressionFormat } from "@/preferences/models";
import { ThFormatPref } from "@/preferences";

import { ThProgression } from "@/core/Components/Reader/ThProgression";

import { useI18n } from "@/i18n/useI18n";
import { useProgressionFormat } from "../hooks/useProgressionFormat";
import { useProgressionText } from "../hooks/useProgressionText";
import { useReadAlongMiniPlayerType } from "./Hooks/useReadAlongMiniPlayerType";

import classNames from "classnames";

// Fills the space the mini player leaves after its player actions, without affecting its layout
export const StatefulReadAlongMiniPlayerProgression = ({
  containerRef,
  miniPlayerRef,
  playerActionsRef,
  formatPref,
  fallbackVariant
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  miniPlayerRef: RefObject<HTMLElement | null>;
  playerActionsRef: RefObject<HTMLDivElement | null>;
  formatPref?: ThFormatPref<ThProgressionFormat | ThProgressionFormat[]>;
  fallbackVariant: ThProgressionFormat | Array<ThProgressionFormat>;
}) => {
  const { t } = useI18n();
  const miniPlayerType = useReadAlongMiniPlayerType();
  const displayFormat = useProgressionFormat(formatPref, fallbackVariant);
  const getProgressionText = useProgressionText();

  const normalText = useMemo(() => getProgressionText(displayFormat), [getProgressionText, displayFormat]);
  const compactText = useMemo(() => getProgressionText(displayFormat, true), [getProgressionText, displayFormat]);

  const [visibleText, setVisibleText] = useState("");

  const normalGhostRef = useRef<HTMLDivElement>(null);
  const compactGhostRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const computeFit = useCallback(() => {
    const container = containerRef.current;
    const playerActions = playerActionsRef.current;
    if (!container || !playerActions) return;

    const containerRect = container.getBoundingClientRect();
    const playerActionsRect = playerActions.getBoundingClientRect();
    const available = getComputedStyle(container).direction === "rtl"
      ? playerActionsRect.left - containerRect.left
      : containerRect.right - playerActionsRect.right;

    const fits = (text: string, ghost: HTMLDivElement | null) =>
      !!text && !!ghost && ghost.getBoundingClientRect().width <= available;

    setVisibleText(
      fits(normalText, normalGhostRef.current)
        ? normalText
        : fits(compactText, compactGhostRef.current)
          ? compactText
          : ""
    );
  }, [containerRef, playerActionsRef, normalText, compactText]);

  // The player actions can move without resizing, e.g. when the metadata changes, so this also runs on progress updates
  useLayoutEffect(() => {
    computeFit();
  }, [computeFit, getProgressionText]);

  useEffect(() => {
    const scheduleFit = () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        computeFit();
      });
    };

    const observer = new ResizeObserver(scheduleFit);
    const observed = [
      containerRef.current,
      normalGhostRef.current,
      compactGhostRef.current,
      ...Array.from(miniPlayerRef.current?.children ?? [])
    ];
    observed.forEach(el => el && observer.observe(el));

    return () => {
      observer.disconnect();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [computeFit, containerRef, miniPlayerRef, miniPlayerType]);

  const className = classNames(progressionStyles.wrapper, readAlongStyles.miniPlayerProgression);

  return (
    <>
    <div className={ readAlongStyles.miniPlayerProgressionGhost } aria-hidden="true">
      <div ref={ normalGhostRef } className={ className }>{ normalText }</div>
      <div ref={ compactGhostRef } className={ className }>{ compactText }</div>
    </div>
    { visibleText && (
      <ThProgression
        id="readAlong-miniPlayer-progression"
        className={ className }
        aria-label={ t("reader.app.progression.wrapper") }
      >
        { visibleText }
      </ThProgression>
    ) }
    </>
  );
};
