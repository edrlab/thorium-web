"use client";

import { ThActionsKeys } from "@/preferences/models";
import { StatefulActionTriggerProps } from "../Actions/models/actions";
import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";

import ReadAlongIcon from "./assets/icons/record_voice_over.svg";

import { StatefulOverflowMenuItem } from "../Actions/Triggers/StatefulOverflowMenuItem";
import { StatefulActionIcon } from "../Actions/Triggers/StatefulActionIcon";

import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";
import { useI18n } from "@/i18n/useI18n";

import { useReadAlongState } from "./Hooks/useReadAlongState";

export const StatefulReadAlongTrigger = ({ variant }: StatefulActionTriggerProps) => {
  const preferences = useActionsPreferences();
  const { t } = useI18n();
  const { isActive, setActive } = useReadAlongState();

  const label = isActive
    ? t("_pendingThoriumLocales.reader.readAlong.close")
    : t("reader.actions.readAloud.compact");

  const toggle = () => {
    setActive(!isActive);
  };

  return(
    <>
    { (variant && variant === ThActionsTriggerVariant.menu)
      ? <StatefulOverflowMenuItem
          label={ label }
          SVGIcon={ ReadAlongIcon }
          shortcut={ preferences.actionsKeys[ThActionsKeys.readAlong].shortcut }
          id={ ThActionsKeys.readAlong }
          onAction={ toggle }
        />
      : <StatefulActionIcon
          visibility={ preferences.actionsKeys[ThActionsKeys.readAlong].visibility }
          aria-label={ label }
          placement="bottom"
          tooltipLabel={ label }
          shortcut={ preferences.actionsKeys[ThActionsKeys.readAlong].shortcut }
          onPress={ toggle }
        >
          <ReadAlongIcon aria-hidden="true" focusable="false" />
        </StatefulActionIcon>
    }
    </>
  )
}
