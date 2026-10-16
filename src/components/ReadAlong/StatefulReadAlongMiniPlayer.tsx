"use client";

import { useMemo } from "react";

import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import ExpandIcon from "./assets/icons/expand_less.svg";
import ReadAlongIcon from "./assets/icons/text_to_speech.svg";

import { ThActionEntry, ThActionsBar } from "@/core/Components/Actions/ThActionsBar";
import { ThMiniPlayerTypes } from "@/preferences/models";

import { StatefulActionIcon } from "../Actions/Triggers/StatefulActionIcon";
import { StatefulCollapsibleActionsBar } from "../Actions/StatefulCollapsibleActionsBar";
import { ThMiniPlayer } from "@/core/Components/Playback/ThMiniPlayer";
import { ThPlaybackControls } from "@/core/Components/Playback/ThPlaybackControls";
import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";
import { StatefulSkipBackwardButton } from "../Playback/controls/StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "../Playback/controls/StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "../Playback/controls/StatefulSkipForwardButton";

import { useNavigator } from "@/core/Navigator";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "@/components/Plugins/PluginProvider";
import { useReadAlongLanguage } from "./Hooks/useReadAlongLanguage";
import { useReadAlongState } from "./Hooks/useReadAlongState";
import { useReadAlongPlacement } from "./Hooks/useReadAlongPlacement";
import { usePlayPauseFocus } from "./Hooks/usePlayPauseFocus";
import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

import { proxyUrl } from "@/helpers/proxyUrl";

import classNames from "classnames";

export const StatefulReadAlongMiniPlayer = () => {
  const { t } = useI18n();
  const { readAloud } = useNavigator();
  const progress = useAppSelector(state => state.publication.progress);
  const coverUrl = useAppSelector(state => state.readAlongPlayer.metadata?.coverUrl);
  const language = useReadAlongLanguage();
  const scriptMode = useAppSelector(state => state.publication.scriptMode);
  const isLoading = useAppSelector(state => state.readAlongPlayer.status === "loading");
  const { setActive, setExpanded } = useReadAlongState();
  const placement = useReadAlongPlacement();
  const { preferences } = usePreferences();
  const { readAlongActionsMap } = usePlugins();

  const miniPlayerActions = preferences.readAlong.actions.miniPlayer;
  const actionsKeys = preferences.readAlong.actions.keys;

  // The metadata follows the publication's script, not its reading progression, so vertical CJK stays ltr
  const metadataDir = scriptMode === "rtl" ? "rtl" : "ltr";

  const isDisabled = !readAloud || isLoading;
  const isBottomBar = placement === ThMiniPlayerTypes.bottomBar;
  const playPauseRef = usePlayPauseFocus(isDisabled);

  const actionItems = useMemo(() => {
    const actionsItems: ThActionEntry<string>[] = [];

    miniPlayerActions.displayOrder.forEach((key) => {
      const action = readAlongActionsMap[key];
      if (action) {
        actionsItems.push({ key, Trigger: action.Trigger, Target: action.Target });
      } else {
        console.warn(`Action key "${ key }" not found in the plugin registry while present in preferences.`);
      }
    });

    return actionsItems;
  }, [miniPlayerActions.displayOrder, readAlongActionsMap]);

  return (
    <ThMiniPlayer
      className={ readAlongStyles.miniPlayer }
      heading={ progress?.title || "" }
      subheading={ progress?.progression?.currentChapter }
      // The sheet's drag indicator expands it, and buttons would block dragging
      onExpand={ isBottomBar ? () => setExpanded(true) : undefined }
      expandLabel={ t("_pendingThoriumLocales.reader.readAlong.player.expand") }
      cover={ coverUrl
        ? <img className={ readAlongStyles.miniPlayerCover } src={ proxyUrl(coverUrl) } alt="" crossOrigin="anonymous" />
        : <span className={ classNames(readAlongStyles.miniPlayerCover, readAlongStyles.miniPlayerCoverPlaceholder) }>
            <ReadAlongIcon aria-hidden="true" focusable="false" />
          </span>
      }
      playerActions={
        <ThActionsBar
          className={ readAlongStyles.miniPlayerPlayerActionsBar }
          aria-label={ t("_pendingThoriumLocales.reader.readAlong.player.actions") }
        >
          { isBottomBar &&
            <StatefulActionIcon
              aria-label={ t("_pendingThoriumLocales.reader.readAlong.player.expand") }
              tooltipLabel={ t("_pendingThoriumLocales.reader.readAlong.player.expand") }
              placement="top"
              onPress={ () => setExpanded(true) }
            >
              <ExpandIcon aria-hidden="true" focusable="false" />
            </StatefulActionIcon>
          }
          <ThCloseButton
            className={ readerSharedUI.closeButton }
            aria-label={ t("_pendingThoriumLocales.reader.readAlong.close") }
            onPress={ () => setActive(false) }
          />
        </ThActionsBar>
      }
      controls={
        <ThPlaybackControls
          className={ readAlongStyles.miniPlayerPlaybackControls }
          aria-label={ t("audio.player.controls") }
          skipBackward={ <StatefulSkipBackwardButton className={ readAlongStyles.skipBackwardButton } isDisabled={ isDisabled } /> }
          playPause={ <StatefulPlayPauseButton ref={ playPauseRef } className={ readAlongStyles.playPauseButton } isDisabled={ isDisabled } /> }
          skipForward={ <StatefulSkipForwardButton className={ readAlongStyles.skipForwardButton } isDisabled={ isDisabled } /> }
        />
      }
      actions={
        <StatefulCollapsibleActionsBar
          id="readAlong-miniPlayer-overflowMenu"
          className={ readAlongStyles.miniPlayerActionsBar }
          items={ actionItems }
          prefs={ { ...miniPlayerActions, keys: actionsKeys } }
          targetPlacement="top"
          aria-label={ t("_pendingThoriumLocales.reader.readAlong.player.mediaActions") }
        />
      }
      compounds={ {
        metadata: { className: readAlongStyles.miniPlayerMetadata, dir: metadataDir, lang: language },
        expandButton: { className: classNames(readAlongStyles.miniPlayerMetadata, readAlongStyles.miniPlayerExpandButton), dir: metadataDir, lang: language },
        text: { className: readAlongStyles.miniPlayerText },
        heading: { className: readAlongStyles.miniPlayerHeading },
        subheading: { className: readAlongStyles.miniPlayerSubheading },
        playerActions: { className: readAlongStyles.miniPlayerPlayerActions },
        controls: { className: readAlongStyles.miniPlayerControls },
        actions: { className: readAlongStyles.miniPlayerActions }
      } }
    />
  );
};
