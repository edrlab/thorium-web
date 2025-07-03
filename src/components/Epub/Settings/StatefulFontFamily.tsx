"use client";

import { CSSProperties, Key, useCallback, useRef } from "react";

import { useLocale } from "../AppLocale";

import { StatefulSettingsItemProps } from "../../Settings/models/settings";

import settingsStyles from "../../Settings/assets/styles/settings.module.css";

import { ThDropdown } from "@/core/Components/Settings/ThDropdown";

import { ListBox, ListBoxItem } from "react-aria-components";

import { useEpubNavigator } from "@/core/Hooks/Epub/useEpubNavigator";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setFontFamily } from "@/lib/settingsReducer";
import { defaultFontFamilyOptions } from "@/preferences/models/const";

export const StatefulFontFamily = ({ standalone = true }: StatefulSettingsItemProps) => {
  const locale = useLocale();
  const fontFamily = useAppSelector(state => state.settings.fontFamily);
  const fontFamilyOptions = useRef(Object.entries(defaultFontFamilyOptions).map(([property, stack]) => ({
      id: property,
      label: locale.reader.settings.fontFamily.labels[property as keyof typeof locale.reader.settings.fontFamily.labels],
      value: stack
    }))
  );
  const dispatch = useAppDispatch();

  const { getSetting, submitPreferences } = useEpubNavigator();

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!key || key === fontFamily) return;

    const selectedOption = fontFamilyOptions.current.find((option) => option.id === key) as {
      id: keyof typeof defaultFontFamilyOptions;
      label: string;
      value: string | null;
    };
    
    if (selectedOption) {
      await submitPreferences({ fontFamily: selectedOption.value });
      
      const currentSetting = getSetting("fontFamily");
      const selectedOptionId = Object.keys(defaultFontFamilyOptions).find(key => defaultFontFamilyOptions[key as keyof typeof defaultFontFamilyOptions] === currentSetting) as keyof typeof defaultFontFamilyOptions;
      dispatch(setFontFamily(selectedOptionId || defaultFontFamilyOptions.publisher));
    }
  }, [fontFamily, submitPreferences, getSetting, dispatch]);

  return(
    <>
    <ThDropdown 
      { ...(standalone 
        ? { 
          className: settingsStyles.readerSettingsGroup,
          label: locale.reader.settings.fontFamily.title
        } 
        : {
          "aria-label": locale.reader.settings.fontFamily.title
        }) }
      selectedKey={ fontFamily }
      onSelectionChange={ async (key) => await updatePreference(key) }
      compounds={ {
        label: {
          className: settingsStyles.readerSettingsLabel
        },
        button: {
          className: settingsStyles.readerSettingsDropdownButton
        },
        popover: {
          className: settingsStyles.readerSettingsDropdownPopover,
          placement: "bottom"
        },
        listbox: (
          <ListBox
            className={ settingsStyles.readerSettingsDropdownListbox }
            items={ fontFamilyOptions.current }
          >
            { (item) => (
              <ListBoxItem
                className={ settingsStyles.readerSettingsDropdownListboxItem }
                id={ item.id }
                key={ item.id }
                textValue={ item.value || undefined }
                style={{ fontFamily: item.value || undefined } as CSSProperties}
              >
                { item.label }
              </ListBoxItem>
            )}
          </ListBox>
        )
      }}
    />
    </>
  )
}