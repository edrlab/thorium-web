"use client";

import SkipNextIcon from "./assets/icons/skip_next.svg";

import { StatefulActionIcon } from "../../Actions/Triggers/StatefulActionIcon";
import audioStyles from "./assets/styles/thorium-web.audioPlayback.module.css";

import { useNavigator } from "@/core/Navigator";
import { useAppSelector } from "@/lib/hooks";
import { useI18n } from "@/i18n/useI18n";
import { useAudioPreferences } from "@/preferences";
import { ThAudioAffordance } from "@/preferences/audioPreferences";
import { useAdjacentTocItems } from "../../hooks/useAdjacentTocItems";
import { Link } from "@readium/shared";

export const StatefulNextButton = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useI18n();
  const { preferences } = useAudioPreferences();
  const { goForward, goLink } = useNavigator().media;
  const atEnd = useAppSelector(state => state.publication.atPublicationEnd);
  const nextTimelineItem = useAppSelector(state => state.publication.adjacentTimelineItems.next);
  const { next: nextTocItem } = useAdjacentTocItems();

  const affordance = preferences.affordances.next;
  const isTimeline = affordance === ThAudioAffordance.timeline;
  const isToc = affordance === ThAudioAffordance.toc;

  const nextItem = isToc ? nextTocItem : nextTimelineItem;

  const label = (isTimeline || isToc) && nextItem?.title
    ? nextItem.title
    : t("reader.actions.goToNextResource.descriptive");

  const handlePress = () => (isTimeline || isToc)
    ? nextItem && goLink(new Link({ href: nextItem.href }), false, () => {})
    : goForward(false, () => {});

  return (
    <StatefulActionIcon
      onPress={ handlePress }
      isDisabled={ isDisabled || ((isTimeline || isToc) ? !nextItem : atEnd) }
      aria-label={ label }
      tooltipLabel={ label }
      className={ audioStyles.audioNextButton }
    >
      <SkipNextIcon aria-hidden="true" focusable="false" />
    </StatefulActionIcon>
  );
};
