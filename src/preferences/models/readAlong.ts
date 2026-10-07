import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThActionsTokens, ThAudioActionsTokens, ThDockingTypes, ThSheetHeaderVariant, ThSheetTypes, TEXT_INPUT_SELECTORS } from "./actions";
import { ThSettingsTimerPref, ThSettingsTimerVariant } from "./audio";
import { ThBreakpoints } from "./ui";
import { ThSettingsRangePrefRequired, ThSettingsRangeVariant, ThSettingsRangePlaceholder } from "./settings";

import { DecorationStyleType } from "@readium/navigator";

export enum ThReadAlongActionKeys {
  volume = "readAlong.volume",
  rate = "readAlong.rate",
  sleepTimer = "readAlong.sleepTimer",
  settings = "readAlong.settings"
}

export enum ThReadAlongKeys {
  voice = "voice",
  rate = "rate",
  pitch = "pitch",
  volume = "volume",
  pauseDuration = "pauseDuration",
  autoPause = "autoPause",
  segmentation = "segmentation",
  verbosity = "verbosity",
  language = "language",
  format = "format",
  inlineContextualization = "inlineContextualization",
  utteranceStyle = "utteranceStyle",
  wordStyle = "wordStyle",
  sleepTimer = "sleepTimer",
  highlightGroup = "highlightGroup",
  highlightPresets = "highlightPresets"
}

// Settings left out of the settings menu when their action is displayed in the player
export const readAlongActionSettings: Partial<Record<ThReadAlongActionKeys, ThReadAlongKeys>> = {
  [ThReadAlongActionKeys.rate]: ThReadAlongKeys.rate,
  [ThReadAlongActionKeys.volume]: ThReadAlongKeys.volume
};

export enum ThReadAlongHighlightKeys {
  highlightPresets = "highlightPresets",
  utteranceStyle = "utteranceStyle",
  wordStyle = "wordStyle"
}

export enum ThReadAlongHighlightPresetKeys {
  sentenceAndWord = "sentenceAndWord",
  word = "word",
  mask = "mask",
  custom = "custom"
}

export enum ThReadAlongSettingsContainerKeys {
  initial = "initial",
  highlight = "highlight"
}

export enum ThMiniPlayerTypes {
  bottomSheet = "bottomSheet",
  bottomBar = "bottomBar"
}

export interface ThReadAlongActionTokens extends ThActionsTokens {
  miniPlayer: {
    defaultType: ThMiniPlayerTypes;
    breakpoints: BreakpointsMap<ThMiniPlayerTypes>;
  };
}

export interface ThReadAlongStylePref {
  swatches: string[];
}

// Only which styles apply: their colors come from the reading theme
export interface ThReadAlongHighlightPreset {
  [ThReadAlongHighlightKeys.utteranceStyle]: Exclude<DecorationStyleType, "template"> | false;
  [ThReadAlongHighlightKeys.wordStyle]: Exclude<DecorationStyleType, "template" | "mask"> | false;
}

export interface ThReadAlongHighlightPresets {
  order: ThReadAlongHighlightPresetKeys[];
  keys: {
    [key in Exclude<ThReadAlongHighlightPresetKeys, ThReadAlongHighlightPresetKeys.custom>]?: ThReadAlongHighlightPreset;
  };
}

export const defaultReadAlongAction: ThReadAlongActionTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: {
    label: "R",
    keyCombos: [{ keyCode: 82, shift: true, alt: true, suppressOnInteractiveElement: TEXT_INPUT_SELECTORS }]
  },
  miniPlayer: {
    defaultType: ThMiniPlayerTypes.bottomBar,
    breakpoints: {
      [ThBreakpoints.compact]: ThMiniPlayerTypes.bottomSheet
    }
  },
  sheet: {
    defaultSheet: ThSheetTypes.dockedEnd,
    fallbackSheet: ThSheetTypes.popover,
    breakpoints: {}
  },
  docked: {
    dockable: ThDockingTypes.end,
    reserved: true,
    dragIndicator: false,
    width: 360,
    minWidth: 320,
    maxWidth: 450
  }
};

export const defaultReadAlongVolumeAction: ThAudioActionsTokens = {
  visibility: ThCollapsibilityVisibility.always,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.compactPopover,
    breakpoints: {}
  },
  docked: { dockable: ThDockingTypes.none }
};

export const defaultReadAlongRateAction: ThAudioActionsTokens = {
  visibility: ThCollapsibilityVisibility.always,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.compactPopover,
    breakpoints: { [ThBreakpoints.compact]: ThSheetTypes.bottomSheet }
  },
  snapped: {
    minHeight: "content-height"
  },
  docked: { dockable: ThDockingTypes.none }
};

export const defaultReadAlongSleepTimerAction: ThAudioActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.modal,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet,
      [ThBreakpoints.medium]: ThSheetTypes.bottomSheet
    }
  },
  snapped: {
    minHeight: "content-height"
  },
  docked: { dockable: ThDockingTypes.none }
};

// Popover rather than compact popover, its header holds the back button of the highlight submenu
export const defaultReadAlongSettingsAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  snapped: {
    peekHeight: 50,
    minHeight: 30,
    maxHeight: 100
  },
  docked: { dockable: ThDockingTypes.none }
};

export const defaultReadAlongRate: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.sliderWithPresets,
  range: [0.5, 3],
  step: 0.05,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [0.75, 1, 1.25, 1.5, 2]
};

export const defaultReadAlongPitch: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.slider,
  range: [0, 2],
  step: 0.1,
  placeholder: ThSettingsRangePlaceholder.range
};

export const defaultReadAlongVolume: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.slider,
  range: [0, 1],
  step: 0.05,
  placeholder: ThSettingsRangePlaceholder.range
};

export const defaultReadAlongPauseDuration: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.numberField,
  range: [0, 5000],
  step: 100,
  placeholder: ThSettingsRangePlaceholder.range
};

export const defaultReadAlongUtteranceStyle: ThReadAlongStylePref = {
  swatches: ["#ffeb3b80", "#8bc34a80", "#4fc3f780", "#f48fb180", "#ffb74d80"]
};

export const defaultReadAlongWordStyle: ThReadAlongStylePref = {
  swatches: ["#e53935", "#1e88e5", "#43a047", "#8e24aa", "#212121"]
};

export const defaultReadAlongSleepTimer: ThSettingsTimerPref = {
  variant: ThSettingsTimerVariant.presetList,
  presets: [15, 30, 45, 60, 90]
};

export const defaultReadAlongHighlightMain = [
  ThReadAlongHighlightKeys.highlightPresets
];

export const defaultReadAlongHighlightSubpanel = [
  ThReadAlongHighlightKeys.highlightPresets,
  ThReadAlongHighlightKeys.utteranceStyle,
  ThReadAlongHighlightKeys.wordStyle
];

export const defaultReadAlongHighlightPresets: ThReadAlongHighlightPresets = {
  order: [
    ThReadAlongHighlightPresetKeys.sentenceAndWord,
    ThReadAlongHighlightPresetKeys.word,
    ThReadAlongHighlightPresetKeys.mask,
    ThReadAlongHighlightPresetKeys.custom
  ],
  keys: {
    [ThReadAlongHighlightPresetKeys.sentenceAndWord]: {
      [ThReadAlongHighlightKeys.utteranceStyle]: DecorationStyleType.Highlight,
      [ThReadAlongHighlightKeys.wordStyle]: DecorationStyleType.Highlight
    },
    [ThReadAlongHighlightPresetKeys.word]: {
      [ThReadAlongHighlightKeys.utteranceStyle]: false,
      [ThReadAlongHighlightKeys.wordStyle]: DecorationStyleType.Highlight
    },
    [ThReadAlongHighlightPresetKeys.mask]: {
      [ThReadAlongHighlightKeys.utteranceStyle]: DecorationStyleType.Mask,
      [ThReadAlongHighlightKeys.wordStyle]: DecorationStyleType.Highlight
    }
  }
};

export const defaultReadAlongPreferences = {
  actions: {
    miniPlayer: {
      displayOrder: [
        ThReadAlongActionKeys.settings
      ]
    },
    expanded: {
      displayOrder: [
        ThReadAlongActionKeys.volume,
        ThReadAlongActionKeys.rate,
        ThReadAlongActionKeys.sleepTimer,
        ThReadAlongActionKeys.settings
      ]
    },
    keys: {
      [ThReadAlongActionKeys.volume]: defaultReadAlongVolumeAction,
      [ThReadAlongActionKeys.rate]: defaultReadAlongRateAction,
      [ThReadAlongActionKeys.sleepTimer]: defaultReadAlongSleepTimerAction,
      [ThReadAlongActionKeys.settings]: defaultReadAlongSettingsAction
    }
  },
  settings: {
    order: [
      ThReadAlongKeys.voice,
      ThReadAlongKeys.rate,
      ThReadAlongKeys.pitch,
      ThReadAlongKeys.volume,
      ThReadAlongKeys.highlightGroup,
      ThReadAlongKeys.autoPause,
      ThReadAlongKeys.pauseDuration,
      ThReadAlongKeys.verbosity,
      ThReadAlongKeys.language,
      ThReadAlongKeys.inlineContextualization
    ],
    keys: {
      [ThReadAlongKeys.rate]: defaultReadAlongRate,
      [ThReadAlongKeys.pitch]: defaultReadAlongPitch,
      [ThReadAlongKeys.volume]: defaultReadAlongVolume,
      [ThReadAlongKeys.pauseDuration]: defaultReadAlongPauseDuration,
      [ThReadAlongKeys.utteranceStyle]: defaultReadAlongUtteranceStyle,
      [ThReadAlongKeys.wordStyle]: defaultReadAlongWordStyle,
      [ThReadAlongKeys.sleepTimer]: defaultReadAlongSleepTimer
    },
    highlight: {
      header: ThSheetHeaderVariant.previous,
      main: defaultReadAlongHighlightMain,
      subPanel: defaultReadAlongHighlightSubpanel,
      presets: defaultReadAlongHighlightPresets
    }
  }
};
