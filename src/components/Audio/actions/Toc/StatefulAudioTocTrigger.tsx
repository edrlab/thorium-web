"use client";

import TocIcon from "@/components/Actions/Toc/assets/icons/toc.svg";

import { ThAudioActionKeys } from "@/preferences/models";
import { StatefulActionIcon } from "../../../Actions/Triggers/StatefulActionIcon";
import { StatefulActionTriggerProps } from "../../../Actions/models/actions";

import audioTocStyles from "./assets/styles/thorium-web.audioToc.module.css";

import { useI18n } from "@/i18n/useI18n";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleActionOpen } from "@/lib/actionsReducer";
import { useActionsPreferences } from "@/preferences/hooks/useActionsPreferences";

export const StatefulAudioTocTrigger = ({ ref }: StatefulActionTriggerProps) => {
  const { t } = useI18n();
  const profile = useAppSelector(state => state.reader.profile);
  const { actionsKeys } = useActionsPreferences();
  
  const shortcut = actionsKeys[ThAudioActionKeys.toc]?.shortcut;

  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);
  const isDisabled = !isTrackReady || isStalled;

  const dispatch = useAppDispatch();

  return (
    <StatefulActionIcon
      ref={ ref }
      tooltipLabel={ t("reader.tableOfContents.title") }
      shortcut={ shortcut }
      placement="top"
      onPress={ () => {
        if (profile) {
          dispatch(toggleActionOpen({ key: ThAudioActionKeys.toc, profile }));
        }
      } }
      isDisabled={ isDisabled }
      className={ audioTocStyles.button }
    >
      <TocIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
