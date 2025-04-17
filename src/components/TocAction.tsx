import React, { useCallback, useEffect } from "react";

import { RSPrefs } from "@/preferences";

import Locale from "../resources/locales/en.json";

import Chevron from "./assets/icons/chevron_right.svg";

import { Link } from "@readium/shared";
import { ActionComponentVariant, ActionKeys, IActionComponentContainer, IActionComponentTrigger } from "@/models/actions";
import { SheetTypes } from "@/models/sheets";
import { LayoutDirection } from "@/models/layout";
import { TocItem } from "@/models/toc";
import { DockingKeys } from "@/models/docking";

import tocStyles from "./assets/styles/toc.module.css";

import TocIcon from "./assets/icons/toc.svg";

import { ActionIcon } from "./ActionTriggers/ActionIcon";
import { SheetWithType } from "./Sheets/SheetWithType";
import { OverflowMenuItem } from "./ActionTriggers/OverflowMenuItem";
import { Button, Collection, Selection } from "react-aria-components";
import {
  Tree,
  TreeItem,
  TreeItemContent
} from "react-aria-components";

import { useEpubNavigator } from "@/hooks/useEpubNavigator";
import { useDocking } from "@/hooks/useDocking";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setTocEntry } from "@/lib/publicationReducer";
import { setHovering, setImmersive } from "@/lib/readerReducer";

export const TocActionContainer: React.FC<IActionComponentContainer> = ({ triggerRef }) => {
  const tocEntry = useAppSelector(state => state.publication.tocEntry);
  const direction = useAppSelector(state => state.reader.direction);
  const isRTL = direction === LayoutDirection.rtl;

  const actionState = useAppSelector(state => state.actions.keys[ActionKeys.toc]);
  const tocTree = useAppSelector(state => state.publication.tocTree);
  const dispatch = useAppDispatch();

  const { goLink } = useEpubNavigator();

  const docking = useDocking(ActionKeys.toc);
  const sheetType = docking.sheetType;

  const setOpen = useCallback((value: boolean) => {
    dispatch(setActionOpen({ 
      key: ActionKeys.toc,
      isOpen: value 
    }));
  }, [dispatch]);

  const handleAction = (keys: Selection) => {
    if (keys === "all" || !keys || keys.size === 0) return;

    const key = [...keys][0];
    
    const el = document.querySelector(`[data-key=${key}]`);
    const href = el?.getAttribute("data-href");

    if (!href) return;

    const link: Link = new Link({ href: href });

    const cb = actionState.isOpen && 
      (sheetType === SheetTypes.dockedStart || sheetType === SheetTypes.dockedEnd)
        ? () => {
          dispatch(setTocEntry(key));
          dispatch(setImmersive(true));
          dispatch(setHovering(false));
        } 
        : () => {
          dispatch(setTocEntry(key));
          dispatch(setImmersive(true));
          dispatch(setHovering(false));
          dispatch(setActionOpen({ 
            key: ActionKeys.toc,
            isOpen: false 
          }));
        }

    goLink(link, true, cb);
  };

  // Since React Aria components intercept keys and do not continue propagation
  // we have to handle the escape key in capture phase
  useEffect(() => {
    if (actionState.isOpen && (!actionState.docking || actionState.docking === DockingKeys.transient)) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("keydown", handleEscape, true);

      return () => {
        document.removeEventListener("keydown", handleEscape, true);
      };
    }
  }, [actionState, setOpen]);

  const isItemInChildren = (item: TocItem, tocEntry?: string): boolean => {
    if (item.children && tocEntry) {
      return item.children.some(child => child.id === tocEntry || isItemInChildren(child, tocEntry));
    }
    return false;
  };

  return(
    <>
    <SheetWithType 
      sheetType={ sheetType }
      sheetProps={ {
        id: ActionKeys.toc,
        triggerRef: triggerRef, 
        heading: Locale.reader.toc.heading,
        className: tocStyles.toc,
        placement: "bottom",
        isOpen: actionState.isOpen || false,
        onOpenChangeCallback: setOpen,
        onClosePressCallback: () => setOpen(false),
        docker: docking.getDocker()
      } }
    >
      { tocTree && tocTree.length > 0 
      ? (<Tree
          aria-label={ Locale.reader.toc.entries }
          selectionMode="single"
          items={ tocTree }
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
                        { ...(isRTL ? { style: { transform: "scaleX(-1)" }} : {}) }
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
          }}
        </Tree>) 
      : <div className={ tocStyles.empty }>{ Locale.reader.toc.empty }</div>
    }
    </SheetWithType>
    </>
  )
}

export const TocAction: React.FC<IActionComponentTrigger> = ({ variant }) => {
  const actionState = useAppSelector(state => state.actions.keys[ActionKeys.toc]);
  const dispatch = useAppDispatch();

  const setOpen = (value: boolean) => {
    dispatch(setActionOpen({ 
      key: ActionKeys.toc,
      isOpen: value 
    }));
  }

  return(
    <>
    { (variant && variant === ActionComponentVariant.menu) 
      ? <OverflowMenuItem 
          label={ Locale.reader.toc.trigger }
          SVG={ TocIcon } 
          shortcut={ RSPrefs.actions.keys[ActionKeys.toc].shortcut }
          id={ ActionKeys.toc }
          onActionCallback={ () => setOpen(!actionState.isOpen) }
        />
      : <ActionIcon 
          visibility={ RSPrefs.actions.keys[ActionKeys.toc].visibility }
          ariaLabel={ Locale.reader.toc.trigger } 
          SVG={ TocIcon } 
          placement="bottom"
          tooltipLabel={ Locale.reader.toc.tooltip } 
          onPressCallback={ () => setOpen(!actionState.isOpen) }
        />
    }
    </>
  )
}