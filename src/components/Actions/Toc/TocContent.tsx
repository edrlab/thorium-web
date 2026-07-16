"use client";

import { CSSProperties, RefObject } from "react";

import {
  Button,
  Collection,
  Key,
  Selection,
  Tree,
  TreeItem,
  TreeItemContent
} from "react-aria-components";

import { TocItem } from "@/helpers/buildTocTree";
import { ThFormSearchField } from "@/core/Components";

import Chevron from "./assets/icons/chevron_right.svg";
import tocStyles from "./assets/styles/thorium-web.toc.module.css";

import { useI18n } from "@/i18n/useI18n";

export interface TocContentProps {
  filterValue: string;
  onFilterChange: (value: string) => void;
  displayedTocTree: TocItem[];
  tocTree: TocItem[] | undefined;
  tocEntry: Key | string | undefined;
  expandedKeys: Set<Key>;
  onExpandedChange: (keys: Set<Key>) => void;
  onSelectionChange: (keys: Selection) => void;
  isRTL?: boolean;
  treeRef?: RefObject<HTMLDivElement | null>;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  compounds?: {
    tree?: { className?: string };
    treeWrapper?: { className?: string };
  };
}

export const TocContent = ({
  filterValue,
  onFilterChange,
  displayedTocTree,
  tocTree,
  tocEntry,
  expandedKeys,
  onExpandedChange,
  onSelectionChange,
  isRTL = false,
  treeRef,
  searchInputRef,
  compounds,
}: TocContentProps) => {
  const { t } = useI18n();

  if (!tocTree || tocTree.length === 0) {
    return <div className={ tocStyles.empty }>{ t("reader.tableOfContents.emptyState.description") }</div>;
  }

  return (
    <>
      <ThFormSearchField
        aria-label={ t("common.actions.search") }
        value={ filterValue }
        onChange={ onFilterChange }
        onClear={ () => onFilterChange("") }
        className={ tocStyles.search }
        compounds={ {
          label: { className: tocStyles.searchLabel },
          input: {
            ref: searchInputRef,
            className: tocStyles.searchInput,
            placeholder: t("common.actions.search")
          },
          searchIcon: { className: tocStyles.searchIcon, hidden: !!filterValue },
          clearButton: {
            className: tocStyles.clearButton,
            isDisabled: !filterValue,
            "aria-label": t("common.actions.clear")
          }
        } }
      />
      <div { ...compounds?.treeWrapper }>
      <Tree
        ref={ treeRef }
        aria-label={ t("reader.toc.entries") }
        selectionMode="single"
        items={ displayedTocTree }
        className={ [tocStyles.tree, compounds?.tree?.className].filter(Boolean).join(" ") }
        onSelectionChange={ onSelectionChange }
        selectedKeys={ tocEntry ? [tocEntry] : [] }
        expandedKeys={ expandedKeys }
        onExpandedChange={ onExpandedChange }
        dir={ isRTL ? "rtl" : "ltr" }
      >
        { function renderItem(item) {
          return (
            <TreeItem
              className={ tocStyles.treeItem }
              textValue={ item.title || "" }
            >
              <TreeItemContent>
                { item.children && (
                  <Button
                    slot="chevron"
                    className={ tocStyles.treeItemButton }
                    style={ { transform: isRTL ? "scaleX(-1)" : "none" } as CSSProperties }
                  >
                    <Chevron aria-hidden="true" focusable="false" />
                  </Button>
                ) }
                <div className={ tocStyles.treeItemText }>
                  <div className={ tocStyles.treeItemTextTitle }>{ item.title }</div>
                  { item.position && <div className={ tocStyles.treeItemTextPosition }>{ item.position }</div> }
                </div>
              </TreeItemContent>
              <Collection items={ item.children }>
                { renderItem }
              </Collection>
            </TreeItem>
          );
        } }
      </Tree>
      </div>
    </>
  );
};
