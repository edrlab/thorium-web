import { ShortcutRepresentation } from "@/core/Helpers/keyboardUtilities";
import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import {
  ThActionsKeys,
  ThAudioActionKeys,
  ThAudioKeys,
  ThAudioPlayerComponent,
  ThAudioProgressBarVariant,
  ThAudioPublicationMetadataComponent,
  ThBreakpoints,
  ThDockingTypes,
  ThDockingKeys,
  ThSheetTypes,
  ThThemeKeys,
  ThBackLinkVariant,
  lightTheme,
  darkTheme,
  defaultSettingsAction,
  defaultAudioVolumeAction,
  defaultAudioPlaybackRateAction,
  defaultAudioTocAction,
  defaultAudioSleepTimerAction,
  defaultAudioRemotePlaybackAction,
  defaultAudioContentProtectionConfig,
  defaultAudioVolume,
  defaultAudioPlaybackRate,
  defaultAudioSkipBackwardInterval,
  defaultAudioSkipForwardInterval,
  defaultAudioSleepTimer
} from "./models";
import { createAudioPreferences, ThAudioPreferences, AudioDefaultKeys, ThAudioAffordance } from "./audioPreferences";

export const defaultAudioPreferences: ThAudioPreferences<AudioDefaultKeys> =
  createAudioPreferences<AudioDefaultKeys>({
    theming: {
      header: {
        backLink: {
          variant: ThBackLinkVariant.arrow,
          visibility: "partially",
          href: "/"
        }
      },
      icon: {
        size: 24,
        tooltipOffset: 10
      },
      layout: {
        compact: {
          order: [
            ThAudioPlayerComponent.cover,
            ThAudioPlayerComponent.metadata,
            ThAudioPlayerComponent.playbackControls,
            ThAudioPlayerComponent.progressBar,
            ThAudioPlayerComponent.mediaActions
          ]
        },
        expanded: {
          start: [
            ThAudioPlayerComponent.cover,
            ThAudioPlayerComponent.metadata
          ],
          end: [
            ThAudioPlayerComponent.playbackControls,
            ThAudioPlayerComponent.progressBar,
            ThAudioPlayerComponent.mediaActions
          ]
        },
        publicationMetadata: {
          order: [
            ThAudioPublicationMetadataComponent.titleWithSubtitle
          ]
        },
        radius: 5,
        spacing: 20,
        progressBar: {
          variant: ThAudioProgressBarVariant.segmented
        },
        defaults: {
          dockingWidth: 340,
          scrim: "rgba(0, 0, 0, 0.2)"
        },
        constraints: {
          [ThSheetTypes.bottomSheet]: 600,
          [ThSheetTypes.popover]: 600,
          [ThSheetTypes.modal]: 600,
          cover: 300,
        }
      },
      breakpoints: {
        [ThBreakpoints.compact]: 600,
        [ThBreakpoints.medium]: 840,
        [ThBreakpoints.expanded]: 1200,
        [ThBreakpoints.large]: 1600,
        [ThBreakpoints.xLarge]: null
      },
      themes: {
        audioOrder: [
          "auto",
          ThThemeKeys.light,
          ThThemeKeys.dark
        ],
        systemThemes: {
          light: ThThemeKeys.light,
          dark: ThThemeKeys.dark
        },
        keys: {
          [ThThemeKeys.light]: lightTheme,
          [ThThemeKeys.dark]: darkTheme
        }
      }
    },

    actions: {
      primary: {
        displayOrder: [
          ThAudioActionKeys.volume,
          ThAudioActionKeys.playbackRate,
          ThAudioActionKeys.toc,
          ThAudioActionKeys.sleepTimer
        ],
        keys: {
          [ThAudioActionKeys.volume]: defaultAudioVolumeAction,
          [ThAudioActionKeys.playbackRate]: defaultAudioPlaybackRateAction,
          [ThAudioActionKeys.toc]: defaultAudioTocAction,
          [ThAudioActionKeys.sleepTimer]: defaultAudioSleepTimerAction,
        }
      },
      secondary: {
        displayOrder: [
          ThAudioActionKeys.remotePlayback,
          ThActionsKeys.settings
        ],
        collapse: {
          [ThBreakpoints.compact]: 2,
          [ThBreakpoints.medium]: 3
        },
        keys: {
          [ThAudioActionKeys.remotePlayback]: defaultAudioRemotePlaybackAction,
          [ThActionsKeys.settings]: defaultSettingsAction,
        }
      }
    },

    settings: {
      order: [
        ThAudioKeys.theme,
        ThAudioKeys.skipBackwardInterval,
        ThAudioKeys.skipForwardInterval,
        ThAudioKeys.autoPlay
      ],
      keys: {
        [ThAudioKeys.volume]: defaultAudioVolume,
        [ThAudioKeys.playbackRate]: defaultAudioPlaybackRate,
        [ThAudioKeys.skipBackwardInterval]: defaultAudioSkipBackwardInterval,
        [ThAudioKeys.skipForwardInterval]: defaultAudioSkipForwardInterval,
        [ThAudioKeys.sleepTimer]: defaultAudioSleepTimer
      }
    },

    contentProtection: defaultAudioContentProtectionConfig,

    affordances: {
      previous: ThAudioAffordance.toc,
      next: ThAudioAffordance.toc
    },

    shortcuts: {
      representation: ShortcutRepresentation.symbol,
      joiner: "+",
      displayIn: ["tooltip", "menuItem"]
    },

    docking: {
      displayOrder: [
        ThDockingKeys.transient,
        ThDockingKeys.start,
        ThDockingKeys.end
      ],
      // Only toc is dockable; others have dockable:none so dock panels are TOC-only
      // Matches EPUB config: no docking on compact/medium (mobile/tablet portrait)
      dock: {
        [ThBreakpoints.compact]: ThDockingTypes.none,
        [ThBreakpoints.medium]: ThDockingTypes.none,
        [ThBreakpoints.expanded]: ThDockingTypes.start,
        [ThBreakpoints.large]: ThDockingTypes.both,
        [ThBreakpoints.xLarge]: ThDockingTypes.both
      },
      collapse: true,
      keys: {
        [ThDockingKeys.start]: { 
          visibility: ThCollapsibilityVisibility.overflow, 
          shortcut: null 
        },
        [ThDockingKeys.end]: { 
          visibility: ThCollapsibilityVisibility.overflow, 
          shortcut: null 
        },
        [ThDockingKeys.transient]: { 
          visibility: ThCollapsibilityVisibility.overflow, 
          shortcut: null 
        }
      }
    }
  });
