import { ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThActionsTokens, ThAudioActionsTokens, ThDockingTypes, ThSheetTypes, TEXT_INPUT_SELECTORS } from "./actions";
import { ThSettingsTimerPref, ThSettingsTimerVariant } from "./audio";
import { ThBreakpoints } from "./ui";
import { ThSettingsRangePrefRequired, ThSettingsRangeVariant, ThSettingsRangePlaceholder } from "./settings";

export enum ThReadAlongActionKeys {
  volume = "readAlong.volume",
  rate = "readAlong.rate",
  toc = "readAlong.toc",
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
  sleepTimer = "sleepTimer"
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
    fallbackSheet: ThSheetTypes.modal,
    breakpoints: {}
  },
  docked: {
    dockable: ThDockingTypes.end,
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

export const defaultReadAlongTocAction: ThAudioActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null,
  sheet: {
    defaultSheet: ThSheetTypes.modal,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.fullscreen,
      [ThBreakpoints.medium]: ThSheetTypes.fullscreen
    }
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

export const defaultReadAlongSettingsAction: ThAudioActionsTokens = {
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
    peekHeight: 50,
    minHeight: 30,
    maxHeight: 100
  },
  docked: { dockable: ThDockingTypes.none }
};

export const defaultReadAlongRate: ThSettingsRangePrefRequired = {
  variant: ThSettingsRangeVariant.sliderWithPresets,
  range: [0.5, 3],
  step: 0.1,
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
  presets: [15, 30, 45, 60, 90, "endOfFragment", "endOfResource"]
};

export const defaultReadAlongPreferences = {
  actions: {
    displayOrder: [
      ThReadAlongActionKeys.volume,
      ThReadAlongActionKeys.rate,
      ThReadAlongActionKeys.toc,
      ThReadAlongActionKeys.sleepTimer,
      ThReadAlongActionKeys.settings
    ],
    keys: {
      [ThReadAlongActionKeys.volume]: defaultReadAlongVolumeAction,
      [ThReadAlongActionKeys.rate]: defaultReadAlongRateAction,
      [ThReadAlongActionKeys.toc]: defaultReadAlongTocAction,
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
      ThReadAlongKeys.utteranceStyle,
      ThReadAlongKeys.wordStyle,
      ThReadAlongKeys.segmentation,
      ThReadAlongKeys.autoPause,
      ThReadAlongKeys.pauseDuration,
      ThReadAlongKeys.verbosity,
      ThReadAlongKeys.language,
      ThReadAlongKeys.inlineContextualization,
      ThReadAlongKeys.format
    ],
    keys: {
      [ThReadAlongKeys.rate]: defaultReadAlongRate,
      [ThReadAlongKeys.pitch]: defaultReadAlongPitch,
      [ThReadAlongKeys.volume]: defaultReadAlongVolume,
      [ThReadAlongKeys.pauseDuration]: defaultReadAlongPauseDuration,
      [ThReadAlongKeys.utteranceStyle]: defaultReadAlongUtteranceStyle,
      [ThReadAlongKeys.wordStyle]: defaultReadAlongWordStyle,
      [ThReadAlongKeys.sleepTimer]: defaultReadAlongSleepTimer
    }
  }
};
