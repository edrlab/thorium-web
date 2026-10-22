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
  settings = "readAlong.settings",
  reattach = "readAlong.reattach"
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
  autoPause = "autoPause",
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
    progression: boolean;
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
    },
    progression: true
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

export const defaultReadAlongReattachAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.always,
  shortcut: null
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

// GENERATED by `pnpm highlight-themes --write`, do not edit by hand: edit scripts/highlight-themes.mjs instead
// Rules in docs/customization/HighlightThemes.md
const defaultReadAlongHighlightTheme: Record<ThThemeKeys, ThReadAlongHighlightColors> = {
  [ThThemeKeys.light]: {
    utterance: { fill: "#fff44f", line: "#eb66a0", text: "#ba517f", mask: "#ffffff99" },
    word: {
      fill: { onPage: "#ff6fae", onFill: "#ff6fae", onLine: "#fff44f", onText: "#fff44f" },
      line: { onPage: "#389fc2", onFill: "#3493b4", onLine: "#389fc2", onText: "#389fc2" },
      text: { onPage: "#2d7f9c", onFill: "#29748e", onLine: "#2d7f9c", onText: "#2d7f9c" }
    }
  },
  [ThThemeKeys.dark]: {
    utterance: { fill: "#474416", line: "#ff4f5e", text: "#ffa040", mask: "#00000099" },
    word: {
      fill: { onPage: "#fff44f", onFill: "#fff44f", onLine: "#fff44f", onText: "#ff6fae" },
      line: { onPage: "#45c4f0", onFill: "#45c4f0", onLine: "#45c4f0", onText: "#45c4f0" },
      text: { onPage: "#45c4f0", onFill: "#45c4f0", onLine: "#45c4f0", onText: "#45c4f0" }
    }
  },
  [ThThemeKeys.paper]: {
    utterance: { fill: "#fff44f", line: "#3597b9", text: "#b04d78", mask: "#faf4e899" },
    word: {
      fill: { onPage: "#ff6fae", onFill: "#ff6fae", onLine: "#3fd97a", onText: "#3fd97a" },
      line: { onPage: "#e06299", onFill: "#db5f96", onLine: "#e06299", onText: "#3597b9" },
      text: { onPage: "#b04d78", onFill: "#ad4b76", onLine: "#b04d78", onText: "#2a7892" }
    }
  },
  [ThThemeKeys.sepia]: {
    utterance: { fill: "#ffef3a", line: "#3087a6", text: "#9c446a", mask: "#e9ddc899" },
    word: {
      fill: { onPage: "#ff4f5e", onFill: "#ff4f5e", onLine: "#3fd97a", onText: "#3fd97a" },
      line: { onPage: "#c75788", onFill: "#d65d92", onLine: "#c75788", onText: "#3087a6" },
      text: { onPage: "#9c446a", onFill: "#a84973", onLine: "#9c446a", onText: "#256a82" }
    }
  },
  [ThThemeKeys.contrast1]: {
    utterance: { fill: "#472d12", line: "#ff4f5e", text: "#ff6fae", mask: "#00000099" },
    word: {
      fill: { onPage: "#45c4f0", onFill: "#45c4f0", onLine: "#45c4f0", onText: "#45c4f0" },
      line: { onPage: "#45c4f0", onFill: "#45c4f0", onLine: "#45c4f0", onText: "#45c4f0" },
      text: { onPage: "#45c4f0", onFill: "#45c4f0", onLine: "#45c4f0", onText: "#45c4f0" }
    }
  },
  [ThThemeKeys.contrast2]: {
    utterance: { fill: "#474416", line: "#ffa040", text: "#ffa040", mask: "#18184299" },
    word: {
      fill: { onPage: "#fff44f", onFill: "#fff44f", onLine: "#fff44f", onText: "#ff6fae" },
      line: { onPage: "#3fd97a", onFill: "#3fd97a", onLine: "#3fd97a", onText: "#3fd97a" },
      text: { onPage: "#ffa040", onFill: "#ffa040", onLine: "#3fd97a", onText: "#3fd97a" }
    }
  },
  [ThThemeKeys.contrast3]: {
    utterance: { fill: "#000000", line: "#3087a6", text: "#9c446a", mask: "#c5e7cd99" },
    word: {
      fill: { onPage: "#ff4f5e", onFill: "#ff4f5e", onLine: "#45c4f0", onText: "#45c4f0" },
      line: { onPage: "#c75788", onFill: "#ff6fae", onLine: "#c75788", onText: "#3087a6" },
      text: { onPage: "#9c446a", onFill: "#ff6fae", onLine: "#9c446a", onText: "#256a82" }
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
    ThReadAlongProsodyPresetKeys.autoPause,
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
    // Pauses after each sentence outside fixed layout
    [ThReadAlongProsodyPresetKeys.autoPause]: {
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
        ThReadAlongActionKeys.reattach,
        ThReadAlongActionKeys.settings
      ],
      collapse: true
    },
    expanded: {
      displayOrder: [
        ThReadAlongActionKeys.reattach,
        ThReadAlongActionKeys.volume,
        ThReadAlongActionKeys.sleepTimer,
        ThReadAlongActionKeys.settings
      ]
    },
    keys: {
      [ThReadAlongActionKeys.volume]: defaultReadAlongVolumeAction,
      [ThReadAlongActionKeys.rate]: defaultReadAlongRateAction,
      [ThReadAlongActionKeys.sleepTimer]: defaultReadAlongSleepTimerAction,
      [ThReadAlongActionKeys.settings]: defaultReadAlongSettingsAction,
      [ThReadAlongActionKeys.reattach]: defaultReadAlongReattachAction
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
