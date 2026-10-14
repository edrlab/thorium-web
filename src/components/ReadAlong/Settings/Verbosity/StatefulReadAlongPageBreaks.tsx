"use client";

import { Key, useCallback } from "react";

import { GndRole } from "@readium/navigator";
import { ThReadAlongKeys } from "@/preferences";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { ReadAlongPlacement, readAlongPlacements, useVerbosityPlacement } from "./hooks/useVerbosityPlacement";

const PAGE_BREAK_ROLES: GndRole[] = ["pagebreak"];

export const StatefulReadAlongPageBreaks = ({ standalone = true }: StatefulSettingsItemProps) => {
  const { t } = useI18n();

  const readAloud = useNavigator().readAloud;
  const { placement, setPlacement } = useVerbosityPlacement(ThReadAlongKeys.pageBreaks, PAGE_BREAK_ROLES, "pagebreak");

  const items = readAlongPlacements.map((value) => ({
    id: value,
    label: t(`_pendingThoriumLocales.reader.readAlong.preferences.pageBreaks.values.${ value }`)
  }));

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!key) return;
    await setPlacement(key as ReadAlongPlacement);
  }, [setPlacement]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t("_pendingThoriumLocales.reader.readAlong.preferences.pageBreaks.title") }
      selectedKey={ placement }
      onSelectionChange={ updatePreference }
      isDisabled={ !readAloud }
      compounds={ {
        listbox: (
          <ListBox
            className={ settingsStyles.dropdownListbox }
            items={ items }
          >
            { (item) => (
              <ListBoxItem
                className={ settingsStyles.dropdownListboxItem }
                id={ item.id }
                key={ item.id }
                textValue={ item.label }
              >
                { item.label }
              </ListBoxItem>
            )}
          </ListBox>
        )
      }}
    />
  )
}
