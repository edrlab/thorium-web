"use client";

import { useCallback, useEffect } from "react";

import { Link } from "@readium/shared";
import { ThActionsKeys, ThDockingKeys, ThSheetTypes } from "@/preferences/models";
import { StatefulActionContainerProps } from "../models/actions";

import tocStyles from "./assets/styles/thorium-web.toc.module.css";

import { StatefulSheetWrapper } from "../../Sheets/StatefulSheetWrapper";
import { Selection } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useDocking } from "../../Docking/hooks/useDocking";
import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setTocEntry } from "@/lib/publicationReducer";
import { findTocItemById } from "@/helpers/buildTocTree";
import { setImmersive, setUserNavigated } from "@/lib/readerReducer";

import { isActiveElement } from "@/core/Helpers/focusUtilities";

import { useTocContent } from "./useTocContent";
import { TocContent } from "./TocContent";

export const StatefulTocContainer = ({ triggerRef }: StatefulActionContainerProps) => {
  const { t } = useI18n();

  const toc = useAppSelector(state => state.publication.toc);
  const tocEntry = toc?.currentEntry ?? undefined;
  const tocEntryId = tocEntry?.id;
  const tocTree = toc?.tree;

  const { goLink, getScriptMode } = useNavigator().unified;
  // vertical-cjk has RTL reading progression but lays out as LTR in the TOC
  const isRTL = getScriptMode() === "rtl";

  const profile = useAppSelector(state => state.reader.profile);
  const actionState = useAppSelector(state => profile ? state.actions.keys[profile][ThActionsKeys.toc] : undefined);
  const dispatch = useAppDispatch();
  const docking = useDocking(ThActionsKeys.toc);
  const sheetType = docking.sheetType;

  const setOpen = useCallback((value: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ key: ThActionsKeys.toc, isOpen: value, profile }));
    }
  }, [dispatch, profile]);

  const { expandedKeys, setExpandedKeys, filterValue, setFilterValue, displayedTocTree, treeRef, searchInputRef } =
    useTocContent({ isOpen: actionState?.isOpen ?? false, tocTree, tocEntry: tocEntryId });

  const handleAction = (keys: Selection) => {
    if (keys === "all" || !keys || keys.size === 0) return;

    const key = [...keys][0] as string;
    const matched = findTocItemById(tocTree || [], key);

    if (!matched) return;

    const link: Link = new Link({ href: matched.href });

    const cb = actionState?.isOpen &&
      (sheetType === ThSheetTypes.dockedStart || sheetType === ThSheetTypes.dockedEnd)
        ? () => {
          dispatch(setTocEntry(matched));
          dispatch(setImmersive(true));
          dispatch(setUserNavigated(true));
        }
        : () => {
          dispatch(setTocEntry(matched));
          dispatch(setImmersive(true));
          dispatch(setUserNavigated(true));
          setOpen(false);
        };

    goLink(link, true, cb);
  };

  // Since React Aria components intercept keys and do not continue propagation
  // we have to handle the escape key in capture phase
  useEffect(() => {
    if (actionState?.isOpen && (!actionState?.docking || actionState?.docking === ThDockingKeys.transient)) {
      const handleEscape = (event: KeyboardEvent) => {
        if ((!isActiveElement(searchInputRef.current) && !filterValue) && event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleEscape, true);

      return () => {
        document.removeEventListener("keydown", handleEscape, true);
      };
    }
  }, [actionState, setOpen, filterValue, searchInputRef]);

  return (
    <StatefulSheetWrapper
      sheetType={ sheetType }
      sheetProps={ {
        id: ThActionsKeys.toc,
        triggerRef: triggerRef,
        heading: t("reader.tableOfContents.title"),
        className: tocStyles.wrapper,
        placement: "bottom",
        isOpen: actionState?.isOpen || false,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
        resetFocus: tocEntryId,
        focusWithinRef: treeRef
      } }
    >
      <TocContent
        filterValue={ filterValue }
        onFilterChange={ setFilterValue }
        displayedTocTree={ displayedTocTree }
        tocTree={ tocTree }
        tocEntry={ tocEntryId }
        expandedKeys={ expandedKeys }
        onExpandedChange={ setExpandedKeys }
        onSelectionChange={ handleAction }
        isRTL={ isRTL }
        treeRef={ treeRef }
        searchInputRef={ searchInputRef }
      />
    </StatefulSheetWrapper>
  );
};
