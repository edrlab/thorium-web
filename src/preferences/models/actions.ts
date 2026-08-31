import { ThCollapsibility, ThCollapsibilityVisibility } from "@/core/Components/Actions/hooks/useCollapsibility";
import { BreakpointsMap } from "@/core/Hooks/useBreakpoints";
import { ThBreakpoints } from "./ui";
import { CSSValueUnitless, CSSValueWithUnit } from "./CSSValues";
import type { KeyCombo } from "@readium/navigator-html-injectables";
import type { I18nValue } from "./i18n";

export interface ThShortcutConfig {
  keyCombos: KeyCombo[];
  label?: I18nValue<string>;
}

export const TEXT_INPUT_SELECTORS: string[] = [
  "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='file']):not([type='checkbox']):not([type='radio'])",
  "textarea",
  "[contenteditable]"
];

export type ThBottomSheetDetent = "content-height" | "full-height";

export interface ThActionsTokens {
  visibility: ThCollapsibilityVisibility;
  shortcut: ThShortcutConfig | null;
  sheet?: {
    defaultSheet: Exclude<ThSheetTypes, ThSheetTypes.compactPopover>;
    fallbackSheet?: Exclude<ThSheetTypes, ThSheetTypes.dockedStart | ThSheetTypes.dockedEnd | ThSheetTypes.compactPopover>;
    breakpoints: BreakpointsMap<Exclude<ThSheetTypes, ThSheetTypes.compactPopover>>;
  };
  docked?: ThActionsDockedPref;
  snapped?: ThActionsSnappedPref;
}

export interface ThAudioActionsTokens {
  visibility: ThCollapsibilityVisibility;
  shortcut: ThShortcutConfig | null;
  sheet?: {
    defaultSheet: Exclude<ThSheetTypes, ThSheetTypes.popover>;
    fallbackSheet?: Exclude<ThSheetTypes, ThSheetTypes.dockedStart | ThSheetTypes.dockedEnd | ThSheetTypes.popover>;
    breakpoints: BreakpointsMap<Exclude<ThSheetTypes, ThSheetTypes.popover>>;
  };
  docked?: ThActionsDockedPref;
  snapped?: ThActionsSnappedPref;
}

// Numbers are pixels; unitless strings are percentages; explicit-unit
// strings ("50%", "20rem", "40vw", ...) follow that unit's meaning.
export type ThDockingSizeValue =
  number
  | CSSValueUnitless
  | CSSValueWithUnit<"px" | "%" | "em" | "rem" | "vh" | "vw">;

export interface ThActionsDockedPref {
  dockable: ThDockingTypes,
  // When true, the action can't be undocked by the user (no transient/undock
  // control) and can't be evicted from its slot by other, non-reserved actions.
  reserved?: boolean,
  // Default open/closed state the first time this action is docked with no
  // remembered choice yet (never docked before, or a stale transient). Once
  // the user opens or closes it themselves, that choice is what persists
  // across reload/profile switches — this only fills the initial gap.
  reopenOnLoad?: boolean,
  dragIndicator?: boolean,
  width?: ThDockingSizeValue,
  minWidth?: ThDockingSizeValue,
  maxWidth?: ThDockingSizeValue
}

export interface ThActionsSnappedPref {
  scrim?: boolean | string;
  maxWidth?: number | null;
  maxHeight?: number | ThBottomSheetDetent;
  peekHeight?: number | ThBottomSheetDetent;
  minHeight?: number | ThBottomSheetDetent;
}

export interface ThDockingPref<T extends string> {
  displayOrder: T[];
  collapse: ThCollapsibility;
  dock: BreakpointsMap<ThDockingTypes> | boolean;
  keys: {
    [key in T]: Pick<ThActionsTokens, "visibility" | "shortcut">;
  }
};

export enum ThActionsKeys {
  fullscreen = "fullscreen",
  jumpToPosition = "jumpToPosition",
  settings = "settings",
  toc = "toc"
}

export enum ThDockingKeys {
  start = "dockingStart",
  end = "dockingEnd",
  transient = "dockingTransient"
}

export enum ThDockingTypes {
  none = "none",
  both = "both",
  start = "start",
  end = "end"
}

export enum ThSheetTypes {
  popover = "popover",
  compactPopover = "compactPopover",
  modal = "modal",
  fullscreen = "fullscreen",
  dockedStart = "docked start",
  dockedEnd = "docked end",
  bottomSheet = "bottomSheet"
}

export enum ThSheetHeaderVariant {
  close = "close",
  previous = "previous"
}

export const defaultActionKeysObject: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null
};

export const defaultSettingsAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: {
    label: "P",
    keyCombos: [{ keyCode: 80, shift: true, alt: true, suppressOnInteractiveElement: TEXT_INPUT_SELECTORS }]
  },
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  docked: {
    dockable: ThDockingTypes.none,
    width: 340
  },
  snapped: {
    scrim: true,
    peekHeight: 50,
    minHeight: 30,
    maxHeight: 100
  }
};

export const defaultFullscreenAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: null
}

export const defaultTocAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.partially,
  shortcut: {
    label: "T",
    keyCombos: [{ keyCode: 84, shift: true, alt: true, suppressOnInteractiveElement: TEXT_INPUT_SELECTORS }]
  },
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.fullscreen,
      [ThBreakpoints.medium]: ThSheetTypes.fullscreen
    }
  },
  docked: {
    dockable: ThDockingTypes.both,
    dragIndicator: false,
    width: 360,
    minWidth: 320,
    maxWidth: 450
  }
}

export const defaultJumpToPositionAction: ThActionsTokens = {
  visibility: ThCollapsibilityVisibility.overflow,
  shortcut: {
    label: "J",
    keyCombos: [{ keyCode: 74, shift: true, alt: true, suppressOnInteractiveElement: TEXT_INPUT_SELECTORS }]
  },
  sheet: {
    defaultSheet: ThSheetTypes.popover,
    breakpoints: {
      [ThBreakpoints.compact]: ThSheetTypes.bottomSheet
    }
  },
  docked: {
    dockable: ThDockingTypes.none
  },
  snapped: {
    scrim: true,
    minHeight: "content-height"
  }
}