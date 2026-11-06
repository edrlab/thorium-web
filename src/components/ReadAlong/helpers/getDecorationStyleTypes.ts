import { DecorationStyleType, supportsDecorationStyle } from "@readium/navigator";

const UNOFFERED_STYLE_TYPES: DecorationStyleType[] = [
  DecorationStyleType.Template,
  DecorationStyleType.Strikethrough,
  DecorationStyleType.HighlightUnderline
];

export const getDecorationStyleTypes = (exclude: DecorationStyleType[] = []): DecorationStyleType[] => {
  return Object.values(DecorationStyleType)
    .filter((type) => !UNOFFERED_STYLE_TYPES.includes(type) && !exclude.includes(type) && supportsDecorationStyle(type));
};
