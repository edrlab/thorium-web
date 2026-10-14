export interface HydratePayload<T> {
  values: Partial<T>;
  // Local settings the publication has no value for
  reset: Array<keyof T>;
}

export const hydrateState = <T extends object>(state: T, initialState: T, { values, reset }: HydratePayload<T>): T => ({
  ...state,
  ...Object.fromEntries(reset.map((key) => [key, initialState[key]])),
  ...values
});
