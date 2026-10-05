import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  ThLayoutUI,
  ThProgressionFormat,
  ThRunningHeadFormat,
  ThPreferences,
  CustomizableKeys,
  ThBreakpoints,
  ThPaginatedAffordancePrefValue
} from "@/preferences";

import { mapPreferencesToState } from "./helpers/mapPreferences";

export interface RenditionProperties<T extends string | Array<string>> {
  default?: T;
  breakpoints?: {
    [key in ThBreakpoints]?: T;
  };
}

export interface RenditionObject<T extends string | Array<string>> {
  reflow?: RenditionProperties<T>;
  fxl?: RenditionProperties<T>;
  webPub?: RenditionProperties<T>;
}

export interface RenditionChangePayload<T extends string | Array<string>> {
  type: string;
  payload: {
    key: "reflow" | "fxl" | "webPub";
    value?: T;
    breakpoint?: ThBreakpoints;
  }
}

export interface UIChangePayload {
  type: string;
  payload: {
    key: "reflow" | "fxl" | "webPub";
    value?: ThLayoutUI;
  }
}

export interface PaginatedAffordanceProperties {
  default?: ThPaginatedAffordancePrefValue;
  breakpoints?: {
    [key in ThBreakpoints]?: ThPaginatedAffordancePrefValue;
  };
}

export interface PaginatedAffordanceObject {
  reflow?: PaginatedAffordanceProperties;
  fxl?: PaginatedAffordanceProperties;
  divina?: PaginatedAffordanceProperties;
}

export interface PaginatedAffordancePayload {
  type: string;
  payload: {
    key: "reflow" | "fxl" | "divina";
    value: ThPaginatedAffordancePrefValue;
    breakpoint?: ThBreakpoints;
  };
}

export interface PreferencesReducerState {
  progressionFormat?: RenditionObject<ThProgressionFormat | Array<ThProgressionFormat>>;
  runningHeadFormat?: RenditionObject<ThRunningHeadFormat>;
  paginatedAffordances?: PaginatedAffordanceObject;
  ui?: {
    reflow?: ThLayoutUI;
    fxl?: ThLayoutUI;
    webPub?: ThLayoutUI;
  };
  scrollAffordances?: {
    hintInImmersive?: boolean;
    toggleOnMiddlePointer?: Array<"tap" | "click">;
    hideOnForwardScroll?: boolean;
    showOnBackwardScroll?: boolean;
  }
}

const initialState: PreferencesReducerState = {}

export const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setProgressionFormat: (state, action: RenditionChangePayload<ThProgressionFormat | Array<ThProgressionFormat>>) => {
      const { key, value, breakpoint } = action.payload;
      state.progressionFormat = {
        ...state.progressionFormat,
        [key]: {
          ...state.progressionFormat?.[key],
          ...(breakpoint ? {
            breakpoints: {
              ...state.progressionFormat?.[key]?.breakpoints,
              [breakpoint]: value
            }
          } : { default: value })
        }
      };
    },
    setRunningHeadFormat: (state, action: RenditionChangePayload<ThRunningHeadFormat>) => {
      const { key, value, breakpoint } = action.payload;
      state.runningHeadFormat = {
        ...state.runningHeadFormat,
        [key]: {
          ...state.runningHeadFormat?.[key],
          ...(breakpoint ? {
            breakpoints: {
              ...state.runningHeadFormat?.[key]?.breakpoints,
              [breakpoint]: value
            }
          } : { default: value })
        }
      };
    },
    setUI: (state, action: UIChangePayload) => {
      const { key, value } = action.payload;
      state.ui = {
        ...state.ui,
        [key]: value
      };
    },
    setScrollAffordances: (state, action) => {
      state.scrollAffordances = action.payload;
    },
    setPaginatedAffordance: (state, action: PaginatedAffordancePayload) => {
      const { key, value, breakpoint } = action.payload;
      state.paginatedAffordances = {
        ...state.paginatedAffordances,
        [key]: {
          ...state.paginatedAffordances?.[key],
          ...(breakpoint ? {
            breakpoints: {
              ...state.paginatedAffordances?.[key]?.breakpoints,
              [breakpoint]: value
            }
          } : { default: value })
        }
      };
    },
    updateFromPreferences(state, action: PayloadAction<ThPreferences<CustomizableKeys>>) {
      const prefs = action.payload;
      return mapPreferencesToState(prefs);
    }
  }
})

// Action creators are generated for each case reducer function
export const {
  setProgressionFormat,
  setRunningHeadFormat,
  setUI,
  setScrollAffordances,
  setPaginatedAffordance,
  updateFromPreferences
} = preferencesSlice.actions;

export default preferencesSlice.reducer;