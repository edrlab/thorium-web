import { ReadiumSpeechVoice } from "@readium/navigator";

import { ReadAlongVoiceControls } from "@/lib/readAlongPlayerReducer";

// Voices that don't report a control support it
export const getVoiceControls = (voice: ReadiumSpeechVoice | null): ReadAlongVoiceControls => ({
  boundary: voice?.controls?.boundary !== false,
  speed: voice?.controls?.speed !== false
});
