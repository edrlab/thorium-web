"use client";

import React, { use, useCallback } from "react";

import { useLocale } from "../AppLocale";

import AutoLayoutIcon from "./assets/icons/document_scanner.svg";
import OneColIcon from "./assets/icons/article.svg";
import TwoColsIcon from "./assets/icons/menu_book.svg";

import { StatefulRadioGroup } from "../../Settings/StatefulRadioGroup";

import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setColumnCount } from "@/lib/settingsReducer";

export const StatefulColumns = () => {
  const locale = useLocale();

  const isScroll = useAppSelector(state => state.settings.scroll);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const columnCount = useAppSelector(state => state.settings.columnCount) || "auto";
  const dispatch = useAppDispatch();

  const { submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (value: string) => {
    const colCount = value === "auto" ? null : Number(value);

    await submitPreferences({ columnCount: colCount });
    
    // TODO: See how best to handle this for 2 -> 1 column if minimal null
    dispatch(setColumnCount(value));
  }, [submitPreferences, dispatch]);

  return (
    <>
    <StatefulRadioGroup 
      standalone={ true }
      label={ locale.reader.settings.column.title }
      orientation="horizontal"
      value={ columnCount }
      onChange={ async (val: string) => await updatePreference(val) }
      isDisabled={ isScroll && !isFXL }
      items={[
        {
          icon: AutoLayoutIcon,
          label: locale.reader.settings.column.auto,
          value: "auto" 
        },
        {
          icon: OneColIcon,
          label: locale.reader.settings.column.one,
          value: "1" 
        },
        {
          icon: TwoColsIcon,
          label: locale.reader.settings.column.two, 
          value: "2" 
        }
      ]}
    />
    </>
  );
}