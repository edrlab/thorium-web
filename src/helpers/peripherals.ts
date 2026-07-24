export const NavPeripheralType = {
  progressForward:  "th_nav_progress_forward",
  progressBackward: "th_nav_progress_backward",
  moveRight:        "th_nav_move_right",
  moveLeft:         "th_nav_move_left",
  moveUp:           "th_nav_move_up",
  moveDown:         "th_nav_move_down",
  moveHome:         "th_nav_move_home",
  moveEnd:          "th_nav_move_end",
  zoomIn:           "th_nav_zoom_in",
  zoomOut:          "th_nav_zoom_out",
} as const;

// Ctrl/Cmd + = or Numpad+, covering Blink (187) and Gecko (61) key codes
export const ZOOM_IN_KEY_COMBOS = [
  { keyCode: 187, ctrl: true  },
  { keyCode: 61,  ctrl: true  },
  { keyCode: 107, ctrl: true  },
  { keyCode: 187, meta: true  },
  { keyCode: 61,  meta: true  },
  { keyCode: 107, meta: true  },
] as const;

// Ctrl/Cmd + - or Numpad-, covering Blink (189) and Gecko (173) key codes
export const ZOOM_OUT_KEY_COMBOS = [
  { keyCode: 189, ctrl: true  },
  { keyCode: 173, ctrl: true  },
  { keyCode: 109, ctrl: true  },
  { keyCode: 189, meta: true  },
  { keyCode: 173, meta: true  },
  { keyCode: 109, meta: true  },
] as const;

export const ACTION_PERIPHERAL_PREFIX = "th_action_" as const;

export const toActionPeripheralType = (key: string) => `${ ACTION_PERIPHERAL_PREFIX }${ key }`;

export const fromActionPeripheralType = (type: string): string | null =>
  type.startsWith(ACTION_PERIPHERAL_PREFIX) ? type.slice(ACTION_PERIPHERAL_PREFIX.length) : null;

export const DOCKING_PERIPHERAL_PREFIX = "th_docking_" as const;

export const toDockingPeripheralType = (key: string) => `${ DOCKING_PERIPHERAL_PREFIX }${ key }`;

export const fromDockingPeripheralType = (type: string): string | null =>
  type.startsWith(DOCKING_PERIPHERAL_PREFIX) ? type.slice(DOCKING_PERIPHERAL_PREFIX.length) : null;
