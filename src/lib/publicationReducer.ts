import { createSlice } from "@reduxjs/toolkit";

import { SerializedLocator } from "@/helpers/serializePositions";
import { ThemeTokens } from "@/preferences/hooks/useTheming";
import { ScriptMode } from "@readium/navigator";
import { Progress } from "@/core/Hooks/usePublicationProgress";
import { TocItem, TocEntryRef, toEntryRef } from "@/helpers/buildTocTree";

export interface TimelineItemRef {
  title?: string;
  href: string;
}

export interface PublicationReducerState {
  fontLanguage: string;
  isFXL: boolean;
  isRTL: boolean;
  scriptMode: ScriptMode;
  hasDisplayTransformability: boolean;
  positionsList: SerializedLocator[],
  atPublicationStart: boolean;
  atPublicationEnd: boolean;
  progress?: Progress;
  toc: {
    tree?: TocItem[];
    currentEntry?: TocEntryRef | null;
  };
  adjacentTimelineItems: {
    previous: TimelineItemRef | null;
    next: TimelineItemRef | null;
  };
  coverTheme?: ThemeTokens;
}

const initialState: PublicationReducerState = {
  fontLanguage: "default",
  isFXL: false,
  isRTL: false,
  scriptMode: "ltr",
  hasDisplayTransformability: false,
  positionsList: [],
  atPublicationStart: false,
  atPublicationEnd: false,
  progress: undefined,
  toc: { tree: undefined, currentEntry: undefined },
  adjacentTimelineItems: { previous: null, next: null },
  coverTheme: undefined,
}

export const publicationSlice = createSlice({
  name: "publication",
  initialState,
  reducers: {
    setFontLanguage: (state, action) => {
      state.fontLanguage = action.payload
    },
    setFXL: (state, action) => {
      state.isFXL = action.payload
    },
    setRTL: (state, action) => {
      state.isRTL = action.payload
    },
    setScriptMode: (state, action) => {
      state.scriptMode = action.payload
    },
    setHasDisplayTransformability: (state, action) => {
      state.hasDisplayTransformability = action.payload
    },
    setPositionsList: (state, action) => {
      state.positionsList = action.payload
    },
    setPublicationStart: (state, action) => {
      state.atPublicationStart = action.payload
    },
    setPublicationEnd: (state, action) => {
      state.atPublicationEnd = action.payload
    },
    setProgress: (state, action: { payload: Progress }) => {
      state.progress = action.payload;
    },
    setTocTree: (state, action: { payload: TocItem[] | undefined }) => {
      state.toc.tree = action.payload;
    },
    setAdjacentTimelineItems: (state, action: { payload: { previous: TimelineItemRef | null; next: TimelineItemRef | null } }) => {
      state.adjacentTimelineItems = action.payload;
    },
    setCoverTheme: (state, action: { payload: ThemeTokens | undefined }) => {
      state.coverTheme = action.payload;
    },
    setTocEntry: (state, action: { payload: TocItem | null }) => {
      state.toc.currentEntry = action.payload ? toEntryRef(action.payload) : null;
    }
  }
});

// Action creators are generated for each case reducer function
export const {
  setFontLanguage,
  setFXL,
  setRTL,
  setScriptMode,
  setHasDisplayTransformability,
  setPositionsList,
  setPublicationStart,
  setPublicationEnd,
  setProgress,
  setTocTree,
  setTocEntry,
  setAdjacentTimelineItems,
  setCoverTheme,
} = publicationSlice.actions;

export default publicationSlice.reducer;
