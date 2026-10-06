import { BuiltinDecorationStyle, NamedDecorationStyle } from "@readium/navigator";

// Mirror @readium/navigator's read-aloud types (same names and shapes) until
// the installed navigator exports them; then replace with imports.

export type ReadAloudState = "playing" | "paused" | "idle" | "loading" | "ready";

export const ReadAloudAutoPause = {
  none: "none",
  utterance: "utterance",
  block: "block",
  page: "page",
  spread: "spread"
} as const;
export type ReadAloudAutoPause = typeof ReadAloudAutoPause[keyof typeof ReadAloudAutoPause];

export type ReadAloudDecorationStyle = BuiltinDecorationStyle | NamedDecorationStyle | false;

export interface ReadAloudSettings {
  format: "plain" | "ssml";
  inlineContextualization: boolean;
  verbosity: "none" | "few" | "some" | "most" | "custom";
  skip: string[];
  contextualize: string[];
  language: "none" | "block-level" | "always";
  segmentation: "structure" | "sentence";
  pauseDuration: number;
  autoPause: ReadAloudAutoPause;
  rate: number;
  pitch: number;
  volume: number;
  utteranceStyle: ReadAloudDecorationStyle;
  wordStyle: ReadAloudDecorationStyle;
}

export type IReadAloudPreferences = {
  [K in keyof ReadAloudSettings]?: ReadAloudSettings[K] | null;
};
