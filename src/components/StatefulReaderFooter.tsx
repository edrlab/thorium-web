"use client";

import { useCallback, useEffect, useRef } from "react";

import readerStyles from "./assets/styles/thorium-web.reader.app.module.css";
import readerPaginationStyles from "./assets/styles/thorium-web.reader.pagination.module.css";

import { ThBreakpoints, ThLayoutUI, ThFormatPref, ThProgressionFormat } from "@/preferences/models";

import { ThFooter } from "@/core/Components/Reader/ThFooter";
import { StatefulReaderProgression } from "./StatefulReaderProgression";
import { ThInteractiveOverlay } from "../core/Components/Reader/ThInteractiveOverlay";
import { StatefulReaderPagination } from "./StatefulReaderPagination";
import { ThPaginationLinkProps } from "@/core/Components/Reader/ThPagination";

import { useNavigator } from "@/core/Navigator";
import { useFocusWithin, useLocale } from "react-aria";
import { useI18n } from "@/i18n/useI18n";

import { setHovering } from "@/lib/readerReducer";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useIsScroll } from "@/hooks";

import classNames from "classnames";

export const StatefulReaderFooter = ({
  layout,
  progressionFormatPref,
  progressionFormatFallback
}: {
  layout: ThLayoutUI;
  progressionFormatPref?: ThFormatPref<ThProgressionFormat | ThProgressionFormat[]>;
  progressionFormatFallback: ThProgressionFormat | ThProgressionFormat[];
}) => {
  const { t } = useI18n();
  const { direction } = useLocale();
  const footerRef = useRef<HTMLDivElement>(null);
  const isImmersive = useAppSelector(state => state.reader.isImmersive);
  const isHovering = useAppSelector(state => state.reader.isHovering);
  const hasScrollAffordance = useAppSelector(state => state.reader.hasScrollAffordance);
  const isRTL = useAppSelector(state => state.publication.isRTL);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const isScroll = useIsScroll();
  const breakpoint = useAppSelector(state => state.theming.containerBreakpoint);
  const reducedMotion = useAppSelector(state => state.theming.prefersReducedMotion);
  const adjacentTimelineItems = useAppSelector(state => state.publication.adjacentTimelineItems);

  const dispatch = useAppDispatch();

  const { focusWithinProps } = useFocusWithin({
    onFocusWithin() {
      dispatch(setHovering(true));
    },
    onBlurWithin() {
      dispatch(setHovering(false));
    }
  });

  const setHover = () => {
    if (!hasScrollAffordance) {
      dispatch(setHovering(true));
    }
  };

  const removeHover = () => {
    if (!hasScrollAffordance) {
      dispatch(setHovering(false));
    }
  };

  const { previousLocator, nextLocator, go } = useNavigator().unified;

  const buildNode = useCallback((
    locator: ReturnType<typeof previousLocator>,
    title: string | undefined,
    compactKey: string,
    descriptiveKey: string
  ) => {
    if (!locator) return undefined;

    return breakpoint !== ThBreakpoints.compact && breakpoint !== ThBreakpoints.medium ? (
      <>
        <span className={ readerStyles.srOnly }>{ t(descriptiveKey) }</span>
        <span className={ readerPaginationStyles.label }>{ title || locator.title || t(compactKey) }</span>
      </>
    ) : (
      <span className={ readerPaginationStyles.label }>{ t(compactKey) }</span>
    );
  }, [t, breakpoint]);

  const updateLinks = useCallback(() => {
    const previous = previousLocator();
    const next = nextLocator();

    const previousLink: ThPaginationLinkProps | undefined = previous ? {
      node: buildNode(
        previous,
        adjacentTimelineItems.previous?.title,
        isFXL ? "reader.actions.goToPreviousPage.compact" : "reader.actions.goToPreviousChapter.compact",
        isFXL ? "reader.actions.goToPreviousPage.descriptive" : "reader.actions.goToPreviousChapter.descriptive"
      ),
      onPress: () => go(previous, !reducedMotion, () => {})
    } : undefined;

    const nextLink: ThPaginationLinkProps | undefined = next ? {
      node: buildNode(
        next,
        adjacentTimelineItems.next?.title,
        isFXL ? "reader.actions.goToNextPage.compact" : "reader.actions.goToNextChapter.compact",
        isFXL ? "reader.actions.goToNextPage.descriptive" : "reader.actions.goToNextChapter.descriptive"
      ),
      onPress: () => go(next, !reducedMotion, () => {})
    } : undefined;

    return isRTL
      ? { left: nextLink, right: previousLink }
      : { left: previousLink, right: nextLink };
  }, [go, previousLocator, nextLocator, buildNode, adjacentTimelineItems, reducedMotion, isFXL, isRTL]);

  useEffect(() => {
    updateLinks();
  }, [adjacentTimelineItems, updateLinks]);

  useEffect(() => {
    // Blur any focused element when entering immersive mode
    if (isImmersive) {
      const focusElement = document.activeElement;
      if (focusElement && footerRef.current?.contains(focusElement)) {
        (focusElement as HTMLElement).blur();
      }
    }
  }, [isImmersive]);

  return(
    <>
    <ThInteractiveOverlay
      className={ classNames(readerStyles.barOverlay, readerStyles.footerOverlay) }
      isActive={ layout === ThLayoutUI.layered && isImmersive && !isHovering }
      onMouseEnter={ setHover }
      onMouseLeave={ removeHover }
    />

    <ThFooter
      ref={ footerRef }
      className={ readerStyles.bottomBar }
      aria-label={ t("reader.app.footer.label") }
      onMouseEnter={ setHover }
      onMouseLeave={ removeHover }
      { ...focusWithinProps }
    >
      { (isScroll)
        ? <StatefulReaderPagination
            aria-label={ t("reader.navigation.scroll.wrapper") }
            links={ updateLinks() }
            dir={ direction }
            compounds={ {
              listItem: {
                className: readerPaginationStyles.listItem
              },
              leftButton: {
                className: readerPaginationStyles.leftButton,
                preventFocusOnPress: true
              },
              rightButton: {
                className: readerPaginationStyles.rightButton,
                preventFocusOnPress: true
              }
            } }
          >
            <StatefulReaderProgression
              className={ readerPaginationStyles.progression }
              formatPref={ progressionFormatPref }
              fallbackVariant={ progressionFormatFallback }
            />
          </StatefulReaderPagination>
        : <StatefulReaderProgression
            formatPref={ progressionFormatPref }
            fallbackVariant={ progressionFormatFallback }
          /> }
    </ThFooter>
    </>
  )
}
