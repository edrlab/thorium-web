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

import { Link } from "@readium/shared";

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

  const { goLink } = useNavigator().unified;

  const buildNode = useCallback((
    title: string | undefined,
    compactKey: string,
    descriptiveKey: string
  ) => {
    return breakpoint !== ThBreakpoints.compact && breakpoint !== ThBreakpoints.medium ? (
      <>
        <span className={ readerStyles.srOnly }>{ t(descriptiveKey) }</span>
        <span className={ readerPaginationStyles.label }>{ title || t(compactKey) }</span>
      </>
    ) : (
      <span className={ readerPaginationStyles.label }>{ t(compactKey) }</span>
    );
  }, [t, breakpoint]);

  const updateLinks = useCallback(() => {
    const previous = adjacentTimelineItems.previous;
    const next = adjacentTimelineItems.next;

    const previousLink: ThPaginationLinkProps | undefined = previous ? {
      node: buildNode(
        previous.title,
        isFXL ? "reader.actions.goToPreviousPage.compact" : "reader.actions.goToPreviousChapter.compact",
        isFXL ? "reader.actions.goToPreviousPage.descriptive" : "reader.actions.goToPreviousChapter.descriptive"
      ),
      onPress: () => goLink(new Link({ href: previous.href }), !reducedMotion, () => {})
    } : undefined;

    const nextLink: ThPaginationLinkProps | undefined = next ? {
      node: buildNode(
        next.title,
        isFXL ? "reader.actions.goToNextPage.compact" : "reader.actions.goToNextChapter.compact",
        isFXL ? "reader.actions.goToNextPage.descriptive" : "reader.actions.goToNextChapter.descriptive"
      ),
      onPress: () => goLink(new Link({ href: next.href }), !reducedMotion, () => {})
    } : undefined;

    return isRTL
      ? { left: nextLink, right: previousLink }
      : { left: previousLink, right: nextLink };
  }, [goLink, buildNode, adjacentTimelineItems, reducedMotion, isFXL, isRTL]);

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
