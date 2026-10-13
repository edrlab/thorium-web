import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThActionsTokens, ThAudioActionsTokens, ThDockingTypes, ThSheetHeaderVariant, ThSheetTypes, TEXT_INPUT_SELECTORS } from "./actions";
import { ThSettingsTimerPref, ThSettingsTimerVariant } from "./audio";
import { ThBreakpoints } from "./ui";
import { ThSettingsRangePrefRequired, ThSettingsRangeVariant, ThSettingsRangePlaceholder } from "./settings";

import { BuiltinDecorationStyle, DecorationStyleType, ReadAloudAutoPause } from "@readium/navigator";

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
  highlightPresets = "highlightPresets",
  prosodyGroup = "prosodyGroup",
  prosodyPresets = "prosodyPresets",
  voiceGroup = "voiceGroup"
}

export enum ThReadAlongHighlightKeys {
  highlightPresets = "highlightPresets",
  utteranceStyle = "utteranceStyle",
  wordStyle = "wordStyle"
}

export enum ThReadAlongHighlightPresetKeys {
  none = "none",
  sentenceAndWord = "sentenceAndWord",
  sentence = "sentence",
  word = "word",
  mask = "mask",
  custom = "custom"
}

export enum ThReadAlongProsodyKeys {
  prosodyPresets = "prosodyPresets",
  rate = "rate",
  pauseDuration = "pauseDuration",
  autoPause = "autoPause"
}

export enum ThReadAlongProsodyPresetKeys {
  default = "default",
  slow = "slow",
  fast = "fast",
  relaxed = "relaxed",
  custom = "custom"
}

export enum ThReadAlongVoiceKeys {
  voice = "voice",
  volume = "volume",
  pitch = "pitch",
  language = "language"
}

export enum ThReadAlongSettingsContainerKeys {
  initial = "initial",
  highlight = "highlight",
  prosody = "prosody",
  voice = "voice"
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
// Contrast enforcement is always disabled when the style is resolved against the reading theme
export type ThReadAlongHighlightStyle = Omit<BuiltinDecorationStyle, "enforceContrast">;

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

// Popover rather than compact popover, its header holds the back button of the submenus
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
  range: [0.5, 4],
  step: 0.05,
  placeholder: ThSettingsRangePlaceholder.range,
  presets: [0.75, 1, 1.25, 1.5, 1.75, 2]
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
  variant: ThSettingsTimerVariant.durationField,
  maxHours: 23
};

export const defaultReadAlongVoiceMain = [
  ThReadAlongVoiceKeys.voice
];

export const defaultReadAlongVoiceSubpanel = [
  ThReadAlongVoiceKeys.voice,
  ThReadAlongVoiceKeys.volume,
  ThReadAlongVoiceKeys.pitch,
  ThReadAlongVoiceKeys.language
];

export const defaultReadAlongHighlightMain = [
  ThReadAlongHighlightKeys.highlightPresets
];

export const defaultReadAlongHighlightSubpanel = [
  ThReadAlongHighlightKeys.highlightPresets,
  ThReadAlongHighlightKeys.utteranceStyle,
  ThReadAlongHighlightKeys.wordStyle
];

export const defaultReadAlongHighlightPresets = {
  order: [
    ThReadAlongHighlightPresetKeys.sentenceAndWord,
    ThReadAlongHighlightPresetKeys.sentence,
    ThReadAlongHighlightPresetKeys.word,
    ThReadAlongHighlightPresetKeys.mask,
    ThReadAlongHighlightPresetKeys.none,
    ThReadAlongHighlightPresetKeys.custom
  ],
  keys: {
    [ThReadAlongHighlightPresetKeys.sentenceAndWord]: {
      [ThReadAlongHighlightKeys.utteranceStyle]: { type: DecorationStyleType.Highlight },
      [ThReadAlongHighlightKeys.wordStyle]: { type: DecorationStyleType.Highlight }
    },
    [ThReadAlongHighlightPresetKeys.sentence]: {
      [ThReadAlongHighlightKeys.utteranceStyle]: { type: DecorationStyleType.Highlight },
      [ThReadAlongHighlightKeys.wordStyle]: false as const
    },
    [ThReadAlongHighlightPresetKeys.word]: {
      [ThReadAlongHighlightKeys.utteranceStyle]: false as const,
      [ThReadAlongHighlightKeys.wordStyle]: { type: DecorationStyleType.Highlight }
    },
    [ThReadAlongHighlightPresetKeys.mask]: {
      [ThReadAlongHighlightKeys.utteranceStyle]: { type: DecorationStyleType.Mask },
      [ThReadAlongHighlightKeys.wordStyle]: { type: DecorationStyleType.Highlight }
    }
  }
};

export const defaultReadAlongProsodyMain = [
  ThReadAlongProsodyKeys.prosodyPresets
];

export const defaultReadAlongProsodySubpanel = [
  ThReadAlongProsodyKeys.prosodyPresets,
  ThReadAlongProsodyKeys.rate,
  ThReadAlongProsodyKeys.pauseDuration,
  ThReadAlongProsodyKeys.autoPause
];

export const defaultReadAlongProsodyPresets = {
  order: [
    ThReadAlongProsodyPresetKeys.default,
    ThReadAlongProsodyPresetKeys.slow,
    ThReadAlongProsodyPresetKeys.fast,
    ThReadAlongProsodyPresetKeys.relaxed,
    ThReadAlongProsodyPresetKeys.custom
  ],
  keys: {
    [ThReadAlongProsodyPresetKeys.slow]: {
      [ThReadAlongProsodyKeys.rate]: 0.85,
      [ThReadAlongProsodyKeys.pauseDuration]: 500
    },
    [ThReadAlongProsodyPresetKeys.fast]: {
      [ThReadAlongProsodyKeys.rate]: 1.25,
      [ThReadAlongProsodyKeys.pauseDuration]: 150
    },
    // Pauses after each page outside fixed layout
    [ThReadAlongProsodyPresetKeys.relaxed]: {
      [ThReadAlongProsodyKeys.autoPause]: ReadAloudAutoPause.spread
    }
  }
};

export const defaultReadAlongPreferences = {
  generateFromMarkup: false,
  readFromPointer: true,
  detachable: true,
  actions: {
    miniPlayer: {
      displayOrder: [
        ThReadAlongActionKeys.settings
      ],
      collapse: true
    },
    expanded: {
      displayOrder: [
        ThReadAlongActionKeys.volume,
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
      ThReadAlongKeys.voiceGroup,
      ThReadAlongKeys.highlightGroup,
      ThReadAlongKeys.prosodyGroup,
      ThReadAlongKeys.verbosity,
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
    voice: {
      header: ThSheetHeaderVariant.previous,
      main: defaultReadAlongVoiceMain,
      subPanel: defaultReadAlongVoiceSubpanel
    },
    highlight: {
      header: ThSheetHeaderVariant.previous,
      main: defaultReadAlongHighlightMain,
      subPanel: defaultReadAlongHighlightSubpanel,
      presets: defaultReadAlongHighlightPresets
    },
    prosody: {
      header: ThSheetHeaderVariant.previous,
      main: defaultReadAlongProsodyMain,
      subPanel: defaultReadAlongProsodySubpanel,
      presets: defaultReadAlongProsodyPresets
    }
  }
};
