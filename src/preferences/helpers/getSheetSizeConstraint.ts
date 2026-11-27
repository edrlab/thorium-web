import { ThSheetSizeConstraint } from "../preferences";

export const getSheetSizeConstraint = (
  constraint: ThSheetSizeConstraint | undefined,
  dimension: "width" | "height"
): number | undefined => {
  if (constraint == null) return undefined;
  if (typeof constraint === "number") return dimension === "width" ? constraint : undefined;
  return constraint[dimension] ?? undefined;
};
