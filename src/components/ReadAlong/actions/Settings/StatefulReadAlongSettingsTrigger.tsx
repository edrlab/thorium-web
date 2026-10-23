"use client";

import TuneIcon from "../../../Actions/Settings/assets/icons/instant_mix.svg";

import { ThReadAlongActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../../../Actions/Triggers/StatefulOverflowMenuItem";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export const StatefulReadAlongSettingsTrigger = ({ ref, variant }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const { actionsKeys } = useActionsPreferences();

  const shortcut = actionsKeys[ThReadAlongActionKeys.settings]?.shortcut;

  const dispatch = useAppDispatch();

  const toggleOpen = () => {
    if (profile) {
      dispatch(toggleActionOpen({ key: ThReadAlongActionKeys.settings, profile }));
    }
  };

  if (variant === ThActionsTriggerVariant.menu) {
    return (
      <StatefulOverflowMenuItem
        label={ t("_pendingThoriumLocales.reader.readAlong.preferences.title") }
        SVGIcon={ TuneIcon }
        shortcut={ shortcut ?? null }
        id={ ThReadAlongActionKeys.settings }
        onAction={ toggleOpen }
      />
    );
  }

  return (
    <StatefulActionIcon
      ref={ ref }
      aria-label={ t("_pendingThoriumLocales.reader.readAlong.preferences.title") }
      tooltipLabel={ t("_pendingThoriumLocales.reader.readAlong.preferences.title") }
      shortcut={ shortcut }
      placement="top"
      onPress={ toggleOpen }
    >
      <TuneIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
