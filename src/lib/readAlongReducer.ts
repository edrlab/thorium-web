import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ReadAloudState } from "@/core/Hooks/ReadAloud/models";

export interface ReadAlongSleepTimerState {
  remainingSeconds: number | null;
  onChapterEnd: boolean;
  onUtteranceEnd: boolean;
}

export interface ReadAlongMetadata {
  title: string;
  subtitle?: string;
  authors?: string[];
  coverUrl?: string;
}

export interface ReadAlongReducerState {
  metadata: ReadAlongMetadata | null;
  isActive: boolean;
  status: ReadAloudState;
  hasWordBoundaries: boolean;
  sleepTimer: ReadAlongSleepTimerState;
}

const initialState: ReadAlongReducerState = {
  metadata: null,
  isActive: false,
  status: "idle",
  hasWordBoundaries: true,
  sleepTimer: { remainingSeconds: null, onChapterEnd: false, onUtteranceEnd: false }
};

export const readAlongSlice = createSlice({
  name: "readAlong",
  initialState,
  reducers: {
    setReadAlongActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    setReadAlongStatus: (state, action: PayloadAction<ReadAloudState>) => {
      state.status = action.payload;
    },
    setReadAlongWordBoundaries: (state, action: PayloadAction<boolean>) => {
      state.hasWordBoundaries = action.payload;
    },
    setReadAlongSleepTimer: (state, action: PayloadAction<Partial<ReadAlongSleepTimerState>>) => {
      state.sleepTimer = { ...state.sleepTimer, ...action.payload };
    },
    setReadAlongMetadata: (state, action: PayloadAction<ReadAlongMetadata | null>) => {
      state.metadata = action.payload;
    },
    resetReadAlong: (state) => ({ ...initialState, metadata: state.metadata, isActive: state.isActive })
  }
});

export const {
  setReadAlongActive,
  setReadAlongStatus,
  setReadAlongWordBoundaries,
  setReadAlongSleepTimer,
  setReadAlongMetadata,
  resetReadAlong
} = readAlongSlice.actions;

export default readAlongSlice.reducer;
