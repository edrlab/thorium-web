import { ShortcutRepresentation } from "@/core/Helpers/keyboardUtilities";
import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import {
  ThActionsKeys,
  ThBreakpoints,
  ThDockingTypes,
  ThDockingKeys,
  ThSettingsKeys,
  ThSheetTypes,
  ThThemeKeys,
  ThSheetHeaderVariant,
  ThLayoutUI,
  ThBackLinkVariant,
  ThProgressionFormat,
  ThRunningHeadFormat,
  ThDocumentTitleFormat,
  ThArrowVariant,
  ThNavigationAffordance,
  lightTheme,
  darkTheme,
  paperTheme,
  sepiaTheme,
  contrast1Theme,
  contrast2Theme,
  contrast3Theme,
  defaultSettingsAction,
  defaultFullscreenAction,
  defaultTocAction,
  defaultJumpToPositionAction,
  defaultContentProtectionConfig,
  defaultFontCollection,
  defaultLetterSpacing,
  defaultLineHeights,
  defaultParagraphIndent,
  defaultParagraphSpacing,
  defaultSpacingPresets,
  defaultSpacingPresetsOrder,
  defaultSpacingSettingsMain,
  defaultSpacingSettingsSubpanel,
  defaultTextSettingsMain,
  defaultTextSettingsSubpanel,
  defaultWordSpacing,
  defaultZoom,
  // Language-specific font collections
  arabicFarsiCollection,
  chineseSimplifiedCollection,
  chineseTraditionalCollection,
  hebrewCollection,
  japaneseCollection,
  japaneseVerticalCollection,
  koreanCollection,
  tamilCollection,
} from "./models";
import { createPreferences, ThPreferences, DefaultKeys } from "./preferences";

export const defaultPreferences: ThPreferences<DefaultKeys> = createPreferences<DefaultKeys>({
  experiments: {
    reflow: ["experimentalHeaderFiltering", "experimentalZoom"],
    webPub: ["experimentalHeaderFiltering", "experimentalZoom"]
  },
  metadata: {
    documentTitle: {
      format: ThDocumentTitleFormat.title
    }
  },
  typography: {
    minimalLineLength: 40, // undefined | null | number of characters. If 2 cols will switch to 1 based on this
    optimalLineLength: 55, // number of characters. If auto layout, picks colCount based on this
    maximalLineLength: 70, // undefined | null | number of characters.
    pageGutter: 20
  },
  theming: {
    header: {
      backLink: {
        variant: ThBackLinkVariant.arrow,
        visibility: "partially",
        href: "/"
      },
      runningHead: {
        format: {
          reflow: {
            default: {
              variants: ThRunningHeadFormat.chapter,
              displayInImmersive: true,
              displayInFullscreen: false
            },
            breakpoints: {
              [ThBreakpoints.compact]: {
                variants: ThRunningHeadFormat.chapter,
                displayInImmersive: false,
                displayInFullscreen: false
              }
            }
          },
          fxl: {
            default: {
              variants: ThRunningHeadFormat.title,
              displayInImmersive: true,
              displayInFullscreen: true
            },
            breakpoints: {
              [ThBreakpoints.compact]: {
                variants: ThRunningHeadFormat.title,
                displayInImmersive: false,
                displayInFullscreen: true
              }
            }
          },
          webPub: {
            default: {
              variants: ThRunningHeadFormat.chapter,
              displayInImmersive: true,
              displayInFullscreen: true
            }
          }
        }
      }
    },
    progression: {
      format: {
        reflow: {
          default: {
            variants: [
              ThProgressionFormat.positionsPercentOfTotal,
              ThProgressionFormat.progressionOfResource
            ],
            displayInImmersive: true,
            displayInFullscreen: false
          },
          breakpoints: {
            [ThBreakpoints.compact]: {
              variants: [
                ThProgressionFormat.positionsOfTotal, 
                ThProgressionFormat.resourceProgression
              ],
              displayInImmersive: false,
              displayInFullscreen: false
            }
          }
        },
        fxl: {
          default: {
            variants: [
              ThProgressionFormat.positionsOfTotal, 
              ThProgressionFormat.overallProgression,
              ThProgressionFormat.none
            ],
            displayInImmersive: true,
            displayInFullscreen: true
          },
          breakpoints: {
            [ThBreakpoints.compact]: {
              variants: [
                ThProgressionFormat.positions, 
                ThProgressionFormat.overallProgression,
                ThProgressionFormat.none
              ],
              displayInImmersive: false,
              displayInFullscreen: true
            }
          }
        },
        webPub: {
          default: {
            variants: [
              ThProgressionFormat.readingOrderIndex, 
              ThProgressionFormat.none
            ],
            displayInImmersive: true,
            displayInFullscreen: true
          }
        }
      }
    },
    arrow: {
      size: 40, // Size of the left and right arrows in px
      offset: 5 // offset of the arrows from the edges in px
    },
    icon: {
      size: 24, // Size of icons in px
      tooltipOffset: 10 // offset of tooltip in px
    },
    layout: {
      ui: {
        reflow: ThLayoutUI.layered,
        fxl: ThLayoutUI.layered,
        webPub: ThLayoutUI.stacked,
      },
      radius: 5, // border-radius of containers
      spacing: 20, // padding of containers/sheets
      defaults: {
        dockingWidth: 340, // default width of resizable panels
        scrim: "rgba(0, 0, 0, 0.2)" // default scrim/underlay bg-color
      },
      constraints: {
        [ThSheetTypes.bottomSheet]: 600, // Max-width of all bottom sheets
        [ThSheetTypes.popover]: 600, // Max-width of all popover sheets
        [ThSheetTypes.modal]: 600, // Max-width of all modal sheets
        pagination: 1024, // Max-width of pagination component
        dropdown: 250 // Max-height of main UI dropdowns
      }
    },
    breakpoints: {
      // See https://m3.material.io/foundations/layout/applying-layout/window-size-classes
      [ThBreakpoints.compact]: 600, // Phone in portrait
      [ThBreakpoints.medium]: 840, // Tablet in portrait, Foldable in portrait (unfolded)
      [ThBreakpoints.expanded]: 1200, // Phone in landscape, Tablet in landscape, Foldable in landscape (unfolded), Desktop
      [ThBreakpoints.large]: 1600, // Desktop
      [ThBreakpoints.xLarge]: null // Desktop Ultra-wide
    },
    themes: {
      reflowOrder: [
        "auto", 
        ThThemeKeys.light, 
        ThThemeKeys.paper,
        ThThemeKeys.sepia, 
        ThThemeKeys.dark, 
        ThThemeKeys.contrast1, 
        ThThemeKeys.contrast2, 
        ThThemeKeys.contrast3
      ],
      fxlOrder: [
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
        [ThThemeKeys.dark]: darkTheme,
        [ThThemeKeys.paper]: paperTheme,
        [ThThemeKeys.sepia]: sepiaTheme,
        [ThThemeKeys.contrast1]: contrast1Theme,
        [ThThemeKeys.contrast2]: contrast2Theme,
        [ThThemeKeys.contrast3]: contrast3Theme
      }
    },
  },
  contentProtection: defaultContentProtectionConfig,
  affordances: { 
    scroll: {
      hintInImmersive: true,
      toggleOnMiddlePointer: ["tap", "click"],
      hideOnForwardScroll: true,
      showOnBackwardScroll: true,
      affordance: ThNavigationAffordance.timeline
    },
    paginated: {
      reflow: {
        default: {
          variant: ThArrowVariant.layered,
          discard: ["navigation"],
          hint: ["layoutChange"]
        },
        breakpoints: {
          [ThBreakpoints.large]: {
            variant: ThArrowVariant.stacked
          },
          [ThBreakpoints.xLarge]: {
            variant: ThArrowVariant.stacked
          }
        }
      },
      fxl: {
        // Note FXL arrows are always layered
        // FXL navigator is using the window width to calculate the layout
        // so we need to force the layered variant to prevent layout issues
        default: {
          variant: ThArrowVariant.layered,
          discard: ["navigation"],
          hint: "none"
        }
      }
    }
  },
  shortcuts: {
    representation: ShortcutRepresentation.symbol,
    joiner: "+",
    displayIn: ["tooltip", "menuItem"]
  },
  actions: {
    reflowOrder: [
      ThActionsKeys.settings,
      ThActionsKeys.toc,
      ThActionsKeys.fullscreen,
      ThActionsKeys.jumpToPosition
    ],
    fxlOrder: [
      ThActionsKeys.settings,
      ThActionsKeys.toc,
      ThActionsKeys.fullscreen,
      ThActionsKeys.jumpToPosition
    ],
    webPubOrder: [
      ThActionsKeys.settings,
      ThActionsKeys.toc,
      ThActionsKeys.fullscreen
    ],
    collapse: true,
    keys: {
      [ThActionsKeys.settings]: defaultSettingsAction,
      [ThActionsKeys.fullscreen]: defaultFullscreenAction,
      [ThActionsKeys.toc]: defaultTocAction,
      [ThActionsKeys.jumpToPosition]: defaultJumpToPositionAction,
    }
  },
  docking: {
    displayOrder: [
      ThDockingKeys.transient,
      ThDockingKeys.start,
      ThDockingKeys.end
    ],
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
  },
  settings: {
    reflowOrder: [
      ThSettingsKeys.zoom,
      ThSettingsKeys.textGroup,
      ThSettingsKeys.theme,
      ThSettingsKeys.spacingGroup,
      ThSettingsKeys.layout,
      ThSettingsKeys.columns
    ],
    fxlOrder: [
      ThSettingsKeys.theme,
      ThSettingsKeys.columns
    ],
    webPubOrder: [
      ThSettingsKeys.zoom,
      ThSettingsKeys.textGroup,
      ThSettingsKeys.spacingGroup
    ],
    keys: {
      [ThSettingsKeys.fontFamily]: {
        default: defaultFontCollection,
        arabic: { supportedLanguages: ["ar", "fa"], fonts: arabicFarsiCollection },
        hebrew: { supportedLanguages: ["he"], fonts: hebrewCollection },
        "chinese-simplified": { supportedLanguages: ["zh", "zh-hans", "zh-cn"], fonts: chineseSimplifiedCollection },
        "chinese-traditional": { supportedLanguages: ["zh-hant", "zh-tw", "zh-hk"], fonts: chineseTraditionalCollection },
        japanese: { supportedLanguages: ["ja"], fonts: japaneseCollection },
        "japanese-vertical": { supportedLanguages: ["ja-v"], fonts: japaneseVerticalCollection },
        korean: { supportedLanguages: ["ko"], fonts: koreanCollection },
        tamil: { supportedLanguages: ["ta"], fonts: tamilCollection }
      },
      [ThSettingsKeys.letterSpacing]: defaultLetterSpacing,
      [ThSettingsKeys.lineHeight]: {
        allowUnset: false,
        keys: defaultLineHeights
      },
      [ThSettingsKeys.paragraphIndent]: defaultParagraphIndent,
      [ThSettingsKeys.paragraphSpacing]: defaultParagraphSpacing,
      [ThSettingsKeys.wordSpacing]: defaultWordSpacing,
      [ThSettingsKeys.zoom]: defaultZoom
    },
    text: {
      header: ThSheetHeaderVariant.previous,
      main: defaultTextSettingsMain,
      subPanel: defaultTextSettingsSubpanel
    },
    spacing: {
      header: ThSheetHeaderVariant.previous,
      main: defaultSpacingSettingsMain,
      subPanel: defaultSpacingSettingsSubpanel,
      presets: {
        reflowOrder: defaultSpacingPresetsOrder,
        webPubOrder: defaultSpacingPresetsOrder,
        keys: defaultSpacingPresets
      }
    }
  }
})