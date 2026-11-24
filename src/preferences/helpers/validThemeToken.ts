const CSS_WIDE_KEYWORDS = new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);

// Theme tokens are declared as custom properties on :root, where a CSS-wide keyword is invalid
export const validThemeToken = (value: unknown): string | null => {
  if (value == null) return null;
  const token = String(value);
  return CSS_WIDE_KEYWORDS.has(token.trim().toLowerCase()) ? null : token;
};
