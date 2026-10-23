"use client";

import UndoIcon from "./assets/icons/undo.svg";

import { ThReadAlongActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulOverflowMenuItem } from "../../../Actions/Triggers/StatefulOverflowMenuItem";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import { useNavigator } from "@/core/Navigator";
import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export const StatefulReadAlongReattachTrigger = ({ ref, variant }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const { readAloud } = useNavigator();
  const isDetached = useAppSelector(state => state.readAlongPlayer.isDetached);
  const { actionsKeys } = useActionsPreferences();

  const shortcut = actionsKeys[ThReadAlongActionKeys.reattach]?.shortcut;

  const reattach = () => {
    readAloud?.reattach();
  };

  if (!readAloud || !isDetached) return null;

  if (variant === ThActionsTriggerVariant.menu) {
    return (
      <StatefulOverflowMenuItem
        label={ t("_pendingThoriumLocales.reader.readAlong.player.reattach") }
        SVGIcon={ UndoIcon }
        shortcut={ shortcut ?? null }
        id={ ThReadAlongActionKeys.reattach }
        onAction={ reattach }
      />
    );
  }

  return (
    <StatefulActionIcon
      ref={ ref }
      aria-label={ t("_pendingThoriumLocales.reader.readAlong.player.reattach") }
      tooltipLabel={ t("_pendingThoriumLocales.reader.readAlong.player.reattach") }
      shortcut={ shortcut }
      placement="top"
      onPress={ reattach }
    >
      <UndoIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
