"use client";

import SkipPreviousIcon from "./assets/icons/skip_previous.svg";

import { StatefulActionIcon } from "../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "./assets/styles/thorium-web.audioPlayback.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { ThAudioAffordance } from "@/preferences/audioPreferences";
import { useAdjacentTocItems } from "../../hooks/useAdjacentTocItems";
import { Link } from "@readium/shared";

export const StatefulPreviousButton = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();
  const { goBackward, goLink } = useNavigator().media;
  const atStart = useAppSelector(state => state.publication.atPublicationStart);
  const previousTimelineItem = useAppSelector(state => state.publication.adjacentTimelineItems.previous);
  const { previous: previousTocItem } = useAdjacentTocItems();

  const affordance = preferences.affordances.previous;
  const isTimeline = affordance === ThAudioAffordance.timeline;
  const isToc = affordance === ThAudioAffordance.toc;

  const previousItem = isToc ? previousTocItem : previousTimelineItem;

  const label = (isTimeline || isToc) && previousItem?.title
    ? previousItem.title
    : t("reader.actions.goToPreviousResource.descriptive");

  const handlePress = () => (isTimeline || isToc)
    ? previousItem && goLink(new Link({ href: previousItem.href }), false, () => {})
    : goBackward(false, () => {});

  return (
    <StatefulActionIcon
      onPress={ handlePress }
      isDisabled={ isDisabled || ((isTimeline || isToc) ? !previousItem : atStart) }
      aria-label={ label }
      tooltipLabel={ label }
      className={ audioStyles.audioPreviousButton }
    >
      <SkipPreviousIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
