import { createSlice } from "@reduxjs/toolkit";

import { ThDockingKeys } from "../preferences/models";

export type ActionsStateKeys = string;
export type OverflowStateKeys = string; 

export interface ActionStateObject {
  isOpen?: boolean | null;
  docking?: ThDockingKeys | null;
  dockedWidth?: number;
}

export interface OverflowStateObject {
  isOpen: boolean;
}

export interface DockStateObject {
  actionKey: ActionsStateKeys | null;
  active: boolean;
  collapsed: boolean;
  width?: number;
  reserved?: boolean;
}

export interface ActionStateDockPayload {
  type: string;
  payload: {
    key: ActionsStateKeys;
    dockingKey: ThDockingKeys;
    profile: string;
    reserved?: boolean;
  }
}

export interface ActionStateOpenPayload {
  type: string;
  payload: {
    key: ActionsStateKeys;
    isOpen: boolean;
    profile: string;
  }
}

export interface ActionStateTogglePayload {
  type: string;
  payload: {
    key: ActionsStateKeys;
    profile: string;
  }
}

export interface ActionOverflowOpenPayload {
  type: string;
  payload: {
    key: OverflowStateKeys;
    isOpen: boolean;
  }
}

export interface ActionStateDockedPayload {
  type: string;
  payload: { 
    slot: ThDockingKeys.start | ThDockingKeys.end;
    docked: DockStateObject;
  }
}

export interface ActionStateSlotPayload {
  type: string;
  payload: ThDockingKeys.start | ThDockingKeys.end;
}

export interface ActionStateSlotPayloadWithProfile {
  type: string;
  payload: {
    slot: ThDockingKeys.start | ThDockingKeys.end;
    profile: string;
  };
}

export interface ActionStateSlotWidthPayload {
  type: string;
  payload: { 
    key: ThDockingKeys.start | ThDockingKeys.end;
    width: number;
    profile: string;
  }
}

export interface DockState {
  [profile: string]: {
    [ThDockingKeys.start]: DockStateObject;
    [ThDockingKeys.end]: DockStateObject;
  }
}

export interface ActionKeysState {
  [profile: string]: {
    [key in ActionsStateKeys]?: ActionStateObject;
  };
}

export type ActionsReducerState = {
  keys: ActionKeysState;
  dock: DockState,
  overflow: {
    [key in OverflowStateKeys]?: OverflowStateObject;
  }
}

const initialState: ActionsReducerState = {
  dock: {
    epub: {
      [ThDockingKeys.start]: {
        actionKey: null,
        active: false,
        collapsed: false
      },
      [ThDockingKeys.end]: {
        actionKey: null,
        active: false,
        collapsed: false
      }
    },
    webPub: {
      [ThDockingKeys.start]: {
        actionKey: null,
        active: false,
        collapsed: false
      },
      [ThDockingKeys.end]: {
        actionKey: null,
        active: false,
        collapsed: false
      }
    },
    audio: {
      [ThDockingKeys.start]: {
        actionKey: null,
        active: false,
        collapsed: false
      },
      [ThDockingKeys.end]: {
        actionKey: null,
        active: false,
        collapsed: false
      }
    }
  },
  keys: {
    epub: {},
    webPub: {},
    audio: {}
  },
  overflow: {}
}

const initializeProfileDock = (state: ActionsReducerState, profile: string) => {
  if (!state.dock[profile]) {
    state.dock[profile] = {
      [ThDockingKeys.start]: {
        actionKey: null,
        active: false,
        collapsed: false
      },
      [ThDockingKeys.end]: {
        actionKey: null,
        active: false,
        collapsed: false
      }
    };
  }
};

const initializeProfileKeys = (state: ActionsReducerState, profile: string) => {
  if (!state.keys[profile]) {
    state.keys[profile] = {};
  }
};

export const actionsSlice = createSlice({
  name: "actions",
  initialState,
  reducers: {
    dockAction: (state, action: ActionStateDockPayload) => {
      const { key, dockingKey, profile, reserved } = action.payload;

      // Initialize dock and keys state for profile if they don't exist
      initializeProfileDock(state, profile);
      initializeProfileKeys(state, profile);

      const profileDock = state.dock[profile];
      const profileKeys = state.keys[profile];

      // The user should be able to override the dock slot
      // so we override the previous value, and sync
      // any other action with the same docking key
      switch(dockingKey) {
        case ThDockingKeys.start: {
          // A reserved occupant can't be evicted by a non-reserved action:
          // bail out entirely so the requester's own state stays untouched
          const occupant = profileDock[ThDockingKeys.start];
          if (occupant.actionKey && occupant.actionKey !== key && occupant.reserved && !reserved) {
            return;
          }

          // We need to find if any other action has the same docking key.
          // If it does, we also have to close it so that its transient sheet
          // doesn’t pop over on the screen when it’s replaced.
          // The requester is skipped: re-docking where it already is must not
          // close it as a side effect of evicting itself
          for (const k in profileKeys) {
            if (k !== key && profileKeys[k as ActionsStateKeys]?.docking === dockingKey) {
              profileKeys[k as ActionsStateKeys] = {
                ...profileKeys[k as ActionsStateKeys],
                docking: ThDockingKeys.transient,
                isOpen: false
              };
            }
          }

          // We need to populate the docking slot
          profileDock[ThDockingKeys.start] = {
            ...profileDock[ThDockingKeys.start],
            actionKey: key,
            reserved: !!reserved
          }
          // And remove it from the other one
          if (profileDock[ThDockingKeys.end].actionKey === key) {
            profileDock[ThDockingKeys.end] = {
              ...profileDock[ThDockingKeys.end],
              actionKey: null,
              reserved: false
            }
          }
          break;
        }

        case ThDockingKeys.end: {
          // A reserved occupant can't be evicted by a non-reserved action:
          // bail out entirely so the requester's own state stays untouched
          const occupant = profileDock[ThDockingKeys.end];
          if (occupant.actionKey && occupant.actionKey !== key && occupant.reserved && !reserved) {
            return;
          }

          // We need to find if any other action has the same docking key.
          // If it does, we also have to close it so that its transient sheet
          // doesn’t pop over on the screen when it’s replaced.
          // The requester is skipped: re-docking where it already is must not
          // close it as a side effect of evicting itself
          for (const k in profileKeys) {
            if (k !== key && profileKeys[k as ActionsStateKeys]?.docking === dockingKey) {
              profileKeys[k as ActionsStateKeys] = {
                ...profileKeys[k as ActionsStateKeys],
                docking: ThDockingKeys.transient,
                isOpen: false
              };
            }
          }

          // We need to populate the docking slot
          profileDock[ThDockingKeys.end] = {
            ...profileDock[ThDockingKeys.end],
            actionKey: key,
            reserved: !!reserved
          }
          // And remove it from the other one
          if (profileDock[ThDockingKeys.start].actionKey === key) {
            profileDock[ThDockingKeys.start] = {
              ...profileDock[ThDockingKeys.start],
              actionKey: null,
              reserved: false
            }
          }
          break;
        }

        // We don’t need to sync another action
        case ThDockingKeys.transient:
        default:
          // We need to empty the docking slot
          if (profileDock[ThDockingKeys.start].actionKey === key) {
            profileDock[ThDockingKeys.start] = {
              ...profileDock[ThDockingKeys.start],
              actionKey: null,
              reserved: false
            }
          }
          if (profileDock[ThDockingKeys.end].actionKey === key) {
            profileDock[ThDockingKeys.end] = {
              ...profileDock[ThDockingKeys.end],
              actionKey: null,
              reserved: false
            }
          }
          break;
      }

      profileKeys[key] = {
        ...profileKeys[key],
        docking: dockingKey
      };
    },
    setActionOpen: (state, action: ActionStateOpenPayload) => {      
      const { key, isOpen, profile } = action.payload;
      
      initializeProfileKeys(state, profile);

      if (state.keys[profile][key]?.isOpen === isOpen) return;

      state.keys[profile][key] = {
        ...state.keys[profile][key],
        isOpen
      };
    },
    toggleActionOpen: (state, action: ActionStateTogglePayload) => {
      const { key, profile } = action.payload;
      
      initializeProfileKeys(state, profile);
      
      const payload = {
        key,
        isOpen: state.keys[profile][key]?.isOpen ? !state.keys[profile][key]?.isOpen : true,
        profile
      };
      actionsSlice.caseReducers.setActionOpen(state, {
        type: "toggleActionOpen",
        payload: payload
      });
    },
    setOverflow: (state, action: ActionOverflowOpenPayload) => {
      state.overflow[action.payload.key] = {
        ...state.overflow[action.payload.key],
        isOpen: action.payload.isOpen 
      }
    },
    // Every dock slot mutation below replaces the slot object, which changes
    // the identity of `state.dock[profile]` and wakes every effect keyed on it.
    // Bail out when the value is already correct so a redundant dispatch stays
    // inert instead of feeding another render.
    activateDockPanel: (state, action: ActionStateSlotPayloadWithProfile) => {
      const { slot, profile } = action.payload;
      initializeProfileDock(state, profile);
      if (state.dock[profile][slot].active) return;
      state.dock[profile][slot] = {
        ...state.dock[profile][slot],
        active: true
      }
    },
    deactivateDockPanel: (state, action: ActionStateSlotPayloadWithProfile) => {
      const { slot, profile } = action.payload;
      initializeProfileDock(state, profile);
      if (!state.dock[profile][slot].active) return;
      state.dock[profile][slot] = {
        ...state.dock[profile][slot],
        active: false
      }
    },
    collapseDockPanel: (state, action: ActionStateSlotPayloadWithProfile) => {
      const { slot, profile } = action.payload;
      initializeProfileDock(state, profile);
      if (state.dock[profile][slot].collapsed) return;
      state.dock[profile][slot] = {
        ...state.dock[profile][slot],
        collapsed: true
      }
    },
    expandDockPanel: (state, action: ActionStateSlotPayloadWithProfile) => {
      const { slot, profile } = action.payload;
      initializeProfileDock(state, profile);
      if (!state.dock[profile][slot].collapsed) return;
      state.dock[profile][slot] = {
        ...state.dock[profile][slot],
        collapsed: false
      }
    },
    setDockPanelWidth: (state, action: ActionStateSlotWidthPayload) => {
      const { key, width, profile } = action.payload;
      
      initializeProfileDock(state, profile);
      initializeProfileKeys(state, profile);

      if (state.dock[profile][key].width === width) return;

      // Copy the value in the action state
      // in case we do something with it later.

      const dockKey: ActionsStateKeys | null = state.dock[profile][key].actionKey;
      if (dockKey) {
        state.keys[profile][dockKey] = {
          ...state.keys[profile][dockKey],
          dockedWidth: width
        }
      }

      // We only care if it's populated.
      state.dock[profile][key] = {
        ...state.dock[profile][key],
        width: width
      }
    }
  }
})

export const { 
  dockAction, 
  setActionOpen, 
  toggleActionOpen, 
  setOverflow, 
  activateDockPanel, 
  deactivateDockPanel, 
  collapseDockPanel,
  expandDockPanel, 
  setDockPanelWidth
} = actionsSlice.actions;

export default actionsSlice.reducer;