import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThActionsTokens, ThAudioActionsTokens, ThDockingTypes, ThSheetHeaderVariant, ThSheetTypes, TEXT_INPUT_SELECTORS } from "./actions";
import { ThSettingsTimerPref, ThSettingsTimerVariant } from "./audio";
import { ThBreakpoints } from "./ui";
import { ThThemeKeys } from "./theme";
import { ThSettingsRangePrefRequired, ThSettingsRangeVariant, ThSettingsRangePlaceholder } from "./settings";
import { CSSColor } from "./CSSValues";

import { BuiltinDecorationStyle, DecorationStyleType, ReadAloudAutoPause } from "@readium/navigator";

export enum ThReadAlongActionKeys {
  volume = "readAlong.volume",
  rate = "readAlong.rate",
  sleepTimer = "readAlong.sleepTimer",
  settings = "readAlong.settings"
}

export enum ThReadAlongKeys {
  voice = "voice",
  additionalVoices = "additionalVoices",
  rate = "rate",
  pitch = "pitch",
  volume = "volume",
  pauseDuration = "pauseDuration",
  autoPause = "autoPause",
  segmentation = "segmentation",
  verbosity = "verbosity",
  language = "language",
  languageOverride = "languageOverride",
  format = "format",
  notes = "notes",
  pageBreaks = "pageBreaks",
  keepCentered = "keepCentered",
  utteranceStyle = "utteranceStyle",
  wordStyle = "wordStyle",
  sleepTimer = "sleepTimer",
  highlightGroup = "highlightGroup",
  highlightPresets = "highlightPresets",
  prosodyGroup = "prosodyGroup",
  prosodyPresets = "prosodyPresets",
  voiceGroup = "voiceGroup",
  verbosityGroup = "verbosityGroup"
}

export enum ThReadAlongHighlightKeys {
  highlightPresets = "highlightPresets",
  keepCentered = "keepCentered",
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

export enum ThReadAlongHighlightThemeKeys {
  default = "default"
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
  additionalVoices = "additionalVoices",
  volume = "volume",
  pitch = "pitch",
  language = "language",
  languageOverride = "languageOverride"
}

export enum ThReadAlongVerbosityKeys {
  verbosity = "verbosity",
  notes = "notes",
  pageBreaks = "pageBreaks"
}

export enum ThReadAlongSettingsContainerKeys {
  initial = "initial",
  highlight = "highlight",
  prosody = "prosody",
  voice = "voice",
  verbosity = "verbosity"
}

export enum ThMiniPlayerTypes {
  withMetadata = "withMetadata",
  controlsOnly = "controlsOnly"
}

export interface ThReadAlongActionTokens extends ThActionsTokens {
  miniPlayer: {
    defaultType: ThMiniPlayerTypes;
    breakpoints: BreakpointsMap<ThMiniPlayerTypes>;
  };
}

// Only which styles apply: their colors come from the reading theme
// Contrast enforcement is always disabled when the style is resolved against the reading theme
export type ThReadAlongHighlightStyle = Omit<BuiltinDecorationStyle, "enforceContrast">;

// The word is drawn on top, so its colors depend on the kind of utterance style under it
export interface ThReadAlongHighlightWordColors {
  onPage: CSSColor;
  onFill: CSSColor;
  onLine: CSSColor;
  onText: CSSColor;
}

// Highlights are fills, underlines and outlines lines, text colors text
export interface ThReadAlongHighlightColors {
  utterance: {
    fill: CSSColor;
    line: CSSColor;
    text: CSSColor;
    mask: CSSColor;
  };
  word: {
    fill: ThReadAlongHighlightWordColors;
    line: ThReadAlongHighlightWordColors;
    text: ThReadAlongHighlightWordColors;
  };
}

export const defaultReadAlongAction: ThReadAlongActionTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: {
    label: "R",
    keyCombos: [{ keyCode: 82, shift: true, alt: true, suppressOnInteractiveElement: TEXT_INPUT_SELECTORS }]
  },
  miniPlayer: {
    defaultType: ThMiniPlayerTypes.withMetadata,
    breakpoints: {
      [ThBreakpoints.compact]: ThMiniPlayerTypes.controlsOnly
    }
  },
  sheet: {
    defaultSheet: ThSheetTypes.dockedEnd,
    fallbackSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  snapped: {
    maxHeight: "full-height"
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
  variant: ThSettingsRangeVariant.slider,
  range: [0.5, 4],
  step: 0.05,
  placeholder: ThSettingsRangePlaceholder.range
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

export const defaultReadAlongSleepTimer: ThSettingsTimerPref = {
  variant: ThSettingsTimerVariant.durationField,
  maxHours: 23
};

export const defaultReadAlongVoiceMain = [
  ThReadAlongVoiceKeys.voice
];

export const defaultReadAlongVoiceSubpanel = [
  ThReadAlongVoiceKeys.languageOverride,
  ThReadAlongVoiceKeys.voice,
  ThReadAlongVoiceKeys.additionalVoices,
  ThReadAlongVoiceKeys.volume,
  ThReadAlongVoiceKeys.pitch,
  ThReadAlongVoiceKeys.language
];

export const defaultReadAlongVerbosityMain = [
  ThReadAlongVerbosityKeys.verbosity
];

export const defaultReadAlongVerbositySubpanel = [
  ThReadAlongVerbosityKeys.verbosity,
  ThReadAlongVerbosityKeys.notes,
  ThReadAlongVerbosityKeys.pageBreaks
];

export const defaultReadAlongHighlightMain = [
  ThReadAlongHighlightKeys.highlightPresets
];

export const defaultReadAlongHighlightSubpanel = [
  ThReadAlongHighlightKeys.highlightPresets,
  ThReadAlongHighlightKeys.utteranceStyle,
  ThReadAlongHighlightKeys.wordStyle,
  ThReadAlongHighlightKeys.keepCentered
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

const defaultReadAlongHighlightTheme: Record<ThThemeKeys, ThReadAlongHighlightColors> = {
  [ThThemeKeys.light]: {
    utterance: { fill: "#fff0a0", line: "#b38f59", text: "#0b5fd6", mask: "#ffffff99" },
    word: {
      fill: { onPage: "#ffb300", onFill: "#ffb300", onLine: "#ffb300", onText: "#ffb300" },
      line: { onPage: "#9c6d28", onFill: "#9c6d28", onLine: "#d35400", onText: "#9c6d28" },
      text: { onPage: "#d4005c", onFill: "#d4005c", onLine: "#d4005c", onText: "#d4005c" }
    }
  },
  [ThThemeKeys.dark]: {
    utterance: { fill: "#4d3b00", line: "#a07a00", text: "#5fb0ff", mask: "#00000099" },
    word: {
      fill: { onPage: "#ffb300", onFill: "#ffb300", onLine: "#ffb300", onText: "#ffb300" },
      line: { onPage: "#ffb300", onFill: "#ffb300", onLine: "#ff6a3d", onText: "#ffb300" },
      text: { onPage: "#ff5c9a", onFill: "#ff5c9a", onLine: "#ff5c9a", onText: "#ff5c9a" }
    }
  },
  [ThThemeKeys.paper]: {
    utterance: { fill: "#ffeb8f", line: "#b4853f", text: "#0a56c2", mask: "#faf4e899" },
    word: {
      fill: { onPage: "#ffad00", onFill: "#ffad00", onLine: "#ffad00", onText: "#ffad00" },
      line: { onPage: "#9e630a", onFill: "#9e630a", onLine: "#c44d00", onText: "#9e630a" },
      text: { onPage: "#c40055", onFill: "#c40055", onLine: "#c40055", onText: "#c40055" }
    }
  },
  [ThThemeKeys.sepia]: {
    utterance: { fill: "#ffe680", line: "#9e783e", text: "#0045a8", mask: "#e9ddc899" },
    word: {
      fill: { onPage: "#ffa500", onFill: "#ffa500", onLine: "#ffa500", onText: "#ffa500" },
      line: { onPage: "#875813", onFill: "#875813", onLine: "#b34700", onText: "#875813" },
      text: { onPage: "#a8004a", onFill: "#a8004a", onLine: "#a8004a", onText: "#a8004a" }
    }
  },
  [ThThemeKeys.contrast1]: {
    utterance: { fill: "#ffff00", line: "#ffff00", text: "#00c8ff", mask: "#00000099" },
    word: {
      fill: { onPage: "#00c8ff", onFill: "#00c8ff", onLine: "#00c8ff", onText: "#00c8ff" },
      line: { onPage: "#00c8ff", onFill: "#0000ff", onLine: "#00c8ff", onText: "#ffffff" },
      text: { onPage: "#ffffff", onFill: "#0000ff", onLine: "#ffffff", onText: "#ffffff" }
    }
  },
  [ThThemeKeys.contrast2]: {
    utterance: { fill: "#ffffff", line: "#ffffff", text: "#ffd400", mask: "#18184299" },
    word: {
      fill: { onPage: "#ffa000", onFill: "#ffa000", onLine: "#ffa000", onText: "#ffa000" },
      line: { onPage: "#ffa000", onFill: "#d40000", onLine: "#ffa000", onText: "#ffa000" },
      text: { onPage: "#7fe0ff", onFill: "#d40000", onLine: "#7fe0ff", onText: "#7fe0ff" }
    }
  },
  [ThThemeKeys.contrast3]: {
    utterance: { fill: "#000000", line: "#000000", text: "#c4007a", mask: "#c5e7cd99" },
    word: {
      fill: { onPage: "#2f5bff", onFill: "#ffff00", onLine: "#2f5bff", onText: "#2f5bff" },
      line: { onPage: "#0030ff", onFill: "#ffff00", onLine: "#0030ff", onText: "#0030ff" },
      text: { onPage: "#0030ff", onFill: "#ffff00", onLine: "#0030ff", onText: "#0030ff" }
    }
  }
};

export const defaultReadAlongHighlightThemes = {
  default: ThReadAlongHighlightThemeKeys.default,
  keys: {
    [ThReadAlongHighlightThemeKeys.default]: defaultReadAlongHighlightTheme
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
      [ThReadAlongProsodyKeys.rate]: 0.75,
      [ThReadAlongProsodyKeys.pauseDuration]: 800
    },
    [ThReadAlongProsodyPresetKeys.fast]: {
      [ThReadAlongProsodyKeys.rate]: 1.15,
      [ThReadAlongProsodyKeys.pauseDuration]: 300
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
  startInViewport: true,
  keepAwake: true,
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
      ThReadAlongKeys.prosodyGroup,
      ThReadAlongKeys.highlightGroup,
      ThReadAlongKeys.verbosityGroup
    ],
    keys: {
      [ThReadAlongKeys.rate]: defaultReadAlongRate,
      [ThReadAlongKeys.pitch]: defaultReadAlongPitch,
      [ThReadAlongKeys.volume]: defaultReadAlongVolume,
      [ThReadAlongKeys.pauseDuration]: defaultReadAlongPauseDuration,
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
      presets: defaultReadAlongHighlightPresets,
      themes: defaultReadAlongHighlightThemes
    },
    prosody: {
      header: ThSheetHeaderVariant.previous,
      main: defaultReadAlongProsodyMain,
      subPanel: defaultReadAlongProsodySubpanel,
      presets: defaultReadAlongProsodyPresets
    },
    verbosity: {
      header: ThSheetHeaderVariant.previous,
      main: defaultReadAlongVerbosityMain,
      subPanel: defaultReadAlongVerbositySubpanel
    }
  }
};
