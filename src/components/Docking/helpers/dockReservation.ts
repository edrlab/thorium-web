import { ThActionsTokens, ThAudioActionsTokens, ThSheetTypes } from "@/preferences/models";

// Reserving a slot only makes sense for an action that lives there by
// default: it is what "the user can't pop it out" is protecting. An action
// whose default sheet isn't dockedStart/dockedEnd is only ever docked by the
// user's own choice, so `docked.reserved` is inert on it — same as unset
export const isReservedByPref = (actionPref: ThActionsTokens | ThAudioActionsTokens | undefined): boolean => {
  const isDockedByDefault = actionPref?.sheet?.defaultSheet === ThSheetTypes.dockedStart
    || actionPref?.sheet?.defaultSheet === ThSheetTypes.dockedEnd;
  return !!actionPref?.docked?.reserved && isDockedByDefault;
};
