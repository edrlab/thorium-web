"use client";

import TuneIcon from "../../../Actions/Settings/assets/icons/instant_mix.svg";

import { ThReadAlongActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export const StatefulReadAlongSettingsTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const { actionsKeys } = useActionsPreferences();

  const shortcut = actionsKeys[ThReadAlongActionKeys.settings]?.shortcut;

  const dispatch = useAppDispatch();

  return (
    <StatefulActionIcon
      ref={ ref }
      aria-label={ t("_pendingThoriumLocales.reader.readAlong.preferences.title") }
      tooltipLabel={ t("_pendingThoriumLocales.reader.readAlong.preferences.title") }
      shortcut={ shortcut }
      placement="top"
      onPress={ () => {
        if (profile) {
          dispatch(toggleActionOpen({ key: ThReadAlongActionKeys.settings, profile }));
        }
      } }
    >
      <TuneIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
