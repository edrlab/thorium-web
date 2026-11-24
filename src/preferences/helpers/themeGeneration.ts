import { ThemeTokens } from "@/preferences/hooks/useTheming";
import { getDominantColor } from "@/preferences/helpers/getDominantColor";

const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
          : max === g ? ((b - r) / d + 2) / 6
                      : ((r - g) / d + 4) / 6;
  return [h, s, l];
};

const hslToHex = (h: number, s: number, l: number): string => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${ f(0) }${ f(8) }${ f(4) }`;
};

/** WCAG relative luminance of a hex color (0–1) */
const luminance = (hex: string): number => {
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const r = toLinear(parseInt(hex.slice(1, 3), 16) / 255);
  const g = toLinear(parseInt(hex.slice(3, 5), 16) / 255);
  const b = toLinear(parseInt(hex.slice(5, 7), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio between two hex colors */
const contrastRatio = (a: string, b: string): number => {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

/**
 * Determines if a hex color is light or dark based on luminance
 */
export const isLightColor = (hexColor: string): boolean => luminance(hexColor) > 0.179;

/**
 * Produces a muted shade of the dominant color suitable for use as a background.
 * Light variant: high lightness + low saturation (Spotify/Apple Music style).
 * Dark variant: low lightness + moderate saturation.
 */
const shadeColor = (hex: string, isLight: boolean): string => {
  const [h, s] = hexToHsl(hex);
  return isLight
    ? hslToHex(h, Math.min(s, 0.25), 0.93)
    : hslToHex(h, Math.min(s, 0.30), 0.13);
};

/**
 * Generates a complete ThemeTokens object from a dominant color.
 * Neutrals are derived from the background hue; accents use the dominant hue;
 * text is chosen by WCAG contrast ratio.
 */
export const generateThemeFromColor = (color: string): ThemeTokens => {
  const [h, s] = hexToHsl(color);
  const isLight = isLightColor(color);
  const background = shadeColor(color, isLight);

  // Text: pick black or white by whichever meets better WCAG contrast
  const text = contrastRatio(background, "#ffffff") >= contrastRatio(background, "#000000")
    ? "#ffffff"
    : "#000000";

  // Neutrals derived from the background hue
  const subdue  = isLight ? hslToHex(h, Math.min(s, 0.15), 0.55) : hslToHex(h, Math.min(s, 0.15), 0.55);
  const hover   = isLight ? hslToHex(h, Math.min(s, 0.20), 0.83) : hslToHex(h, Math.min(s, 0.20), 0.22);
  const elevate = `0px 0px 2px ${ isLight ? hslToHex(h, 0.10, 0.70) : hslToHex(h, 0.10, 0.08) }`;

  // Accents use the dominant hue
  const link    = isLight ? hslToHex(h, 0.70, 0.35) : hslToHex(h, 0.80, 0.72);
  const visited = isLight ? hslToHex(h, 0.50, 0.28) : hslToHex(h, 0.55, 0.60);
  const select  = hslToHex(h, 0.60, isLight ? 0.80 : 0.35);
  const focus   = hslToHex(h, 0.90, isLight ? 0.40 : 0.65);

  return {
    background,
    text,
    link,
    visited,
    subdue,
    disable:  subdue,
    hover,
    onHover:  text,
    select,
    onSelect: "currentColor",
    focus,
    elevate,
    immerse: isLight ? "0.6" : "0.4",
  };
};

/**
 * Extracts dominant color from an image URL and generates theme tokens
 */
export const extractThemeFromImage = async (imageUrl: string): Promise<ThemeTokens> => {
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      if (img.naturalWidth === 0) {
        reject(new Error("Image loaded but has no content (blocked or corrupt)"));
      } else {
        resolve();
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    img.src = imageUrl;
  });

  const dominantColor = await getDominantColor(img);
  return generateThemeFromColor(dominantColor);
};
