"use client";

import { Key, useCallback } from "react";

import { GndRole, Interruption } from "@readium/navigator";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import settingsStyles from "../../../Settings/assets/styles/thorium-web.reader.settings.module.css";

import { StatefulDropdown } from "../../../Settings/StatefulDropdown";
import { ListBox, ListBoxItem } from "react-aria-components";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";
import { interruptionValues, InterruptionSettingKey, useInterruption } from "./hooks/useInterruption";

export interface StatefulReadAlongInterruptionProps extends StatefulSettingsItemProps {
  settingKey: InterruptionSettingKey;
  role: GndRole;
}

export const StatefulReadAlongInterruption = ({ standalone = true, settingKey, role }: StatefulReadAlongInterruptionProps) => {
  const { t } = useI18n();

  const readAloud = useNavigator().readAloud;
  const { interruption, setInterruption } = useInterruption(settingKey, role);

  const items = interruptionValues.map((value) => ({
    id: value,
    label: t(`_pendingThoriumLocales.reader.readAlong.preferences.${ settingKey }.values.${ value }`)
  }));

  const updatePreference = useCallback(async (key: Key | null) => {
    if (!key) return;
    await setInterruption(key as Interruption);
  }, [setInterruption]);

  return (
    <StatefulDropdown
      standalone={ standalone }
      label={ t(`_pendingThoriumLocales.reader.readAlong.preferences.${ settingKey }.title`) }
      selectedKey={ interruption }
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
