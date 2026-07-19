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
  zoomReset:        "th_nav_zoom_reset",
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

// Ctrl/Cmd + 0 or Numpad0
export const ZOOM_RESET_KEY_COMBOS = [
  { keyCode: 48, ctrl: true  },
  { keyCode: 96, ctrl: true  },
  { keyCode: 48, meta: true  },
  { keyCode: 96, meta: true  },
] as const;

// Gecko reports different keyCodes for =/+/- (61, 171, 173) than Blink.
// These MUST stay Gecko-gated: in Blink, 173 is the AudioVolumeMute media
// key and 171 can be a media/launcher key, so registering them bare would
// hijack hardware keys on Chrome-family browsers.
const isGecko = typeof navigator !== "undefined" && navigator.userAgent.includes("Gecko/");

// Bare +/=/Numpad+ for image-based publications (divina), xbreader-style
export const IMAGE_ZOOM_IN_KEY_COMBOS: { keyCode: number; shift?: boolean }[] = [
  { keyCode: 187              },
  { keyCode: 187, shift: true },
  { keyCode: 107              },
  ...(isGecko ? [
    { keyCode: 61               },
    { keyCode: 61,  shift: true },
    // Dedicated + key on e.g. German/Nordic layouts
    { keyCode: 171              },
    { keyCode: 171, shift: true },
  ] : []),
];

// Bare -/Numpad- for image-based publications (divina), xbreader-style
export const IMAGE_ZOOM_OUT_KEY_COMBOS: { keyCode: number }[] = [
  { keyCode: 189 },
  { keyCode: 109 },
  ...(isGecko ? [{ keyCode: 173 }] : []),
];

// Bare 0/Numpad0 for image-based publications (divina), xbreader-style
export const IMAGE_ZOOM_RESET_KEY_COMBOS = [
  { keyCode: 48 },
  { keyCode: 96 },
] as const;

export const ACTION_PERIPHERAL_PREFIX = "th_action_" as const;

export const toActionPeripheralType = (key: string) => `${ ACTION_PERIPHERAL_PREFIX }${ key }`;

export const fromActionPeripheralType = (type: string): string | null =>
  type.startsWith(ACTION_PERIPHERAL_PREFIX) ? type.slice(ACTION_PERIPHERAL_PREFIX.length) : null;

export const DOCKING_PERIPHERAL_PREFIX = "th_docking_" as const;

export const toDockingPeripheralType = (key: string) => `${ DOCKING_PERIPHERAL_PREFIX }${ key }`;

export const fromDockingPeripheralType = (type: string): string | null =>
  type.startsWith(DOCKING_PERIPHERAL_PREFIX) ? type.slice(DOCKING_PERIPHERAL_PREFIX.length) : null;
