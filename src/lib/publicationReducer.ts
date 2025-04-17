import { IPublicationState } from "@/models/state/publicationState";
import { createSlice } from "@reduxjs/toolkit";

const initialState: IPublicationState = {
  runningHead: undefined,
  isFXL: false,
  isRTL: false,
  progression: {},
  positionsList: [],
  atPublicationStart: false,
  atPublicationEnd: false,
  tocTree: undefined, 
  tocEntry: undefined
}

export const publicationSlice = createSlice({
  name: "publication",
  initialState,
  reducers: {
    setRunningHead: (state, action) => {
      state.runningHead = action.payload
    },
    setFXL: (state, action) => {
      state.isFXL = action.payload
    },
    setRTL: (state, action) => {
      state.isRTL = action.payload
    },
    setProgression: (state, action) => {
      state.progression = {...state.progression, ...action.payload }
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
    setTocTree: (state, action) => {
      state.tocTree = action.payload;
    },
    setTocEntry: (state, action) => {
      state.tocEntry = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const { 
  setRunningHead,
  setFXL,
  setRTL,
  setProgression,
  setPositionsList, 
  setPublicationStart,
  setPublicationEnd,
  setTocTree, 
  setTocEntry
} = publicationSlice.actions;

export default publicationSlice.reducer;