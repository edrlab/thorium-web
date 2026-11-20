import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";

let isPolyfilled = false;

// Chromium on Windows has no flag glyphs; each call would inject another @font-face
export const polyfillRegionFlags = () => {
  if (isPolyfilled) return;
  isPolyfilled = true;
  polyfillCountryFlagEmojis("Twemoji Country Flags", "/fonts/TwemojiCountryFlags/TwemojiCountryFlags.woff2");
};
