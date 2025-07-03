"use client";

import React, { CSSProperties, useCallback, useEffect, useRef, useState } from "react";

import { useLocale } from "../../Epub/AppLocale";

import { Link } from "@readium/shared";
import { ThActionsKeys, ThDockingKeys, ThSheetTypes, ThLayoutDirection } from "@/preferences/models/enums";
import { StatefulActionContainerProps } from "../models/actions";
import { TocItem } from "@/helpers/createTocTree";

import tocStyles from "./assets/styles/toc.module.css";

import Chevron from "./assets/icons/chevron_right.svg";

import { StatefulSheetWrapper } from "../../Sheets/StatefulSheetWrapper";
import { ThFormSearchField } from "@/core/Components";
import { Button, Collection, Selection, useFilter } from "react-aria-components";
import {
  Tree,
  TreeItem,
  TreeItemContent
} from "react-aria-components";

import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";
import { useDocking } from "../../Docking/hooks/useDocking";
import { usePrevious } from "@/core/Hooks/usePrevious";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setTocEntry } from "@/lib/publicationReducer";
import { setHovering, setImmersive } from "@/lib/readerReducer";

import { isActiveElement } from "@/core/Helpers/focusUtilities";

export const StatefulTocContainer = ({ triggerRef }: StatefulActionContainerProps) => {
  const locale = useLocale();
  const treeRef = useRef<HTMLDivElement | null>(null);
  
  const tocEntry = useAppSelector(state => state.publication.tocEntry);
  const direction = useAppSelector(state => state.reader.direction);
  const isRTL = direction === ThLayoutDirection.rtl;

  const actionState = useAppSelector(state => state.actions.keys[ThActionsKeys.toc]);
  const tocTree = useAppSelector(state => state.publication.tocTree);
  const dispatch = useAppDispatch();

  const previousTocEntry = usePrevious(tocEntry);
  const [forceRerender, setForceRerender] = useState(0);

  const { goLink } = useEpubNavigator();

  const docking = useDocking(ThActionsKeys.toc);
  const sheetType = docking.sheetType;

  const { contains } = useFilter({ sensitivity: "base" });
   const [filterValue, setFilterValue] = React.useState("");
   const searchInputRef = React.useRef<HTMLInputElement>(null);

   const filterTocTree = (items: TocItem[], filterValue: string): TocItem[] => {
     if (!filterValue) {
       return items;
     }

     const recursiveFilter = (items: TocItem[]): TocItem[] => {
       return items.reduce((acc: TocItem[], item: TocItem) => {
         if (item.title && contains(item.title, filterValue)) {
           acc.push({ ...item, children: undefined });
         }
         if (item.children) {
           acc.push(...recursiveFilter(item.children));
         }
         return acc;
       }, []);
     };

     const result = recursiveFilter(items);
     return result.map((item: TocItem, index: number) => ({ ...item, key: `${item.id}-${index}` }));
   };

   const displayedTocTree = filterTocTree(tocTree || [], filterValue);

   const setOpen = useCallback((value: boolean) => {
    if (!value) setFilterValue("");

    dispatch(setActionOpen({ 
      key: ThActionsKeys.toc,
      isOpen: value 
    }));
  }, [dispatch, setFilterValue]);

  const handleAction = (keys: Selection) => {
    if (keys === "all" || !keys || keys.size === 0) return;

    const key = [...keys][0];
    
    const el = document.querySelector(`[data-key=${key}]`);
    const href = el?.getAttribute("data-href");

    if (!href) return;

    const link: Link = new Link({ href: href });

    const cb = actionState?.isOpen && 
      (sheetType === ThSheetTypes.dockedStart || sheetType === ThSheetTypes.dockedEnd)
        ? () => {
          dispatch(setTocEntry(key));
          dispatch(setImmersive(true));
          dispatch(setHovering(false));
        } 
        : () => {
          dispatch(setTocEntry(key));
          dispatch(setImmersive(true));
          dispatch(setHovering(false));
          setOpen(false);
        }

    goLink(link, true, cb);
  };

  // Since React Aria components intercept keys and do not continue propagation
  // we have to handle the escape key in capture phase
  useEffect(() => {
    if (actionState?.isOpen && (!actionState?.docking || actionState?.docking === ThDockingKeys.transient)) {      
      const handleEscape = (event: KeyboardEvent) => {
        if ((!isActiveElement(searchInputRef.current) && !filterValue) && event.key === "Escape" ) {
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleEscape, true);

      return () => {
        document.removeEventListener("keydown", handleEscape, true);
      };
    }
  }, [actionState, setOpen, filterValue]);

  // For docked sheets they are mounted before we could even retrieve tocEntry…
  // So we need to force a rerender as we cannot rely on dependencies prop
  // TODO: Once we handle fragments, etc. this can be removed, and we can add a condition
  // tocEntry has to be defined to render Tree
  useEffect(() => {
    if (
        (sheetType === ThSheetTypes.dockedStart || sheetType === ThSheetTypes.dockedEnd) && 
        tocEntry !== undefined && 
        previousTocEntry === undefined
      ) {
      setForceRerender(Math.random());
    }
  }, [sheetType, tocEntry, previousTocEntry]);

  const isItemInChildren = (item: TocItem, tocEntry?: string): boolean => {
    if (item.children && tocEntry) {
      return item.children.some(child => child.id === tocEntry || isItemInChildren(child, tocEntry));
    }
    return false;
  };

  return(
    <>
    <StatefulSheetWrapper 
      sheetType={ sheetType }
      sheetProps={ {
        id: ThActionsKeys.toc,
        triggerRef: triggerRef, 
        heading: locale.reader.toc.heading,
        className: tocStyles.toc,
        placement: "bottom",
        isOpen: actionState?.isOpen || false,
        onOpenChange: setOpen,
        onClosePress: () => setOpen(false),
        docker: docking.getDocker(),
        focusWithinRef: treeRef
      } }
    >
      { tocTree && tocTree.length > 0 
      ? (<>
        <ThFormSearchField
          aria-label={ locale.reader.toc.search.label }
          value={ filterValue }
          onChange={ setFilterValue }
          onClear={ () => setFilterValue("") }
          className={ tocStyles.tocSearch }
          compounds={{
            label: {
              className: tocStyles.tocSearchLabel
            },
            input: {
              ref: searchInputRef,
              className: tocStyles.tocSearchInput,
              placeholder: locale.reader.toc.search.placeholder
            },
            searchIcon: {
              className: tocStyles.tocSearchIcon,
              hidden: !!filterValue
            },
            clearButton: {
              className: tocStyles.tocClearButton,
              isDisabled: !filterValue
            }
          }}
        />
        <Tree
          // TODO: Remove this when we handle fragments
          key={ forceRerender }
          ref={ treeRef }
          aria-label={ locale.reader.toc.entries }
          selectionMode="single"
          items={ displayedTocTree }
          className={ tocStyles.tocTree }
          onSelectionChange={ handleAction }
          defaultSelectedKeys={ tocEntry ? [tocEntry] : [] }
          selectedKeys={ tocEntry ? [tocEntry] : [] }
          defaultExpandedKeys={ tocTree
            .filter(item => isItemInChildren(item, tocEntry))
            .map(item => item.id) 
          }
        >
          { function renderItem(item) {
            return (
              <TreeItem
                data-href={ item.href }
                className={ tocStyles.tocTreeItem }
                textValue={ item.title || "" }
              >
                <TreeItemContent>
                  { item.children
                    ? (<Button
                      slot="chevron"
                      className={ tocStyles.tocTreeItemButton }
                      { ...(isRTL ? { style: { transform: "scaleX(-1)" } } as CSSProperties : {}) }
                    >
                      <Chevron aria-hidden="true" focusable="false" />
                    </Button>)
                    : null
                  }
                  <div className={ tocStyles.tocTreeItemText }>
                    <div className={ tocStyles.tocTreeItemTextTitle }>{ item.title }</div>
                    { item.position && <div className={ tocStyles.tocTreeItemTextPosition }>{ item.position }</div> }
                  </div>
                </TreeItemContent>
                <Collection items={ item.children }>
                  { renderItem }
                </Collection>
              </TreeItem>
            );
          } }
        </Tree>
      </>) 
      : <div className={ tocStyles.empty }>{ locale.reader.toc.empty }</div>
    }
    </StatefulSheetWrapper>
    </>
  )
}