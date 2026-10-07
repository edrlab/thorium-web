"use client";

import readAlongStyles from "./assets/styles/thorium-web.readAlong.module.css";
import audioStyles from "../Audio/controls/assets/styles/thorium-web.audioPlayback.module.css";
import readerSharedUI from "../assets/styles/thorium-web.button.module.css";

import ExpandIcon from "./assets/icons/expand_less.svg";

import { StatefulActionIcon } from "../Actions/Triggers/StatefulActionIcon";
import { ThMiniPlayer } from "@/core/Components/Audio/ThMiniPlayer";
import { ThPlaybackControls } from "@/core/Components/Audio/ThPlaybackControls";
import { ThCloseButton } from "@/core/Components/Buttons/ThCloseButton";
import { StatefulSkipBackwardButton } from "../Audio/controls/StatefulSkipBackwardButton";
import { StatefulPlayPauseButton } from "../Audio/controls/StatefulPlayPauseButton";
import { StatefulSkipForwardButton } from "../Audio/controls/StatefulSkipForwardButton";
import { AudioActionPair } from "../Audio/actions/StatefulAudioMediaActions";

import { ThMiniPlayerTypes } from "@/preferences/models";

import { useNavigator } from "@/core/Navigator";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { usePlugins } from "@/components/Plugins/PluginProvider";
import { useReadAlongState } from "./Hooks/useReadAlongState";
import { useReadAlongPlacement } from "./Hooks/useReadAlongPlacement";
import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

export const StatefulReadAlongMiniPlayer = () => {
  const { t } = useI18n();
  const { readAloud } = useNavigator();
  const progress = useAppSelector(state => state.publication.progress);
  const isLoading = useAppSelector(state => state.readAlongPlayer.status === "loading");
  const { setActive, setExpanded } = useReadAlongState();
  const placement = useReadAlongPlacement();
  const { preferences } = usePreferences();
  const { readAlongActionsMap } = usePlugins();

  const displayOrder = preferences.readAlong.actions.miniPlayer.displayOrder;

  const isDisabled = !readAloud || isLoading;
  const canExpand = placement === ThMiniPlayerTypes.bottomBar;

  return (
    <ThMiniPlayer
      className={ readAlongStyles.miniPlayer }
      heading={ progress?.title || "" }
      subheading={ progress?.progression?.currentChapter }
      onExpand={ canExpand ? () => setExpanded(true) : undefined }
      expandLabel={ t("_pendingThoriumLocales.reader.readAlong.player.expand") }
      controls={
        <ThPlaybackControls
          className={ audioStyles.audioControls }
          aria-label={ t("audio.player.controls") }
          skipBackward={ <StatefulSkipBackwardButton isDisabled={ isDisabled } /> }
          playPause={ <StatefulPlayPauseButton isDisabled={ isDisabled } /> }
          skipForward={ <StatefulSkipForwardButton isDisabled={ isDisabled } /> }
        />
      }
      actions={
        <>
          { displayOrder.map(key => {
            const action = readAlongActionsMap[key];
            if (!action) return null;
            return <AudioActionPair key={ key } action={ action } />;
          }) }
          { canExpand &&
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
        </>
      }
      compounds={ {
        metadata: { className: readAlongStyles.miniPlayerMetadata },
        expandButton: { className: readAlongStyles.miniPlayerMetadata },
        heading: { className: readAlongStyles.miniPlayerHeading },
        subheading: { className: readAlongStyles.miniPlayerSubheading },
        controls: { className: readAlongStyles.miniPlayerControls },
        actions: { className: readAlongStyles.miniPlayerActions }
      } }
    />
  );
};
