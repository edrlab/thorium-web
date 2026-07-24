import { ThPlugin } from "../PluginRegistry";
import { ThActionsKeys } from "@/preferences/models";
import { ThAudioKeys, ThAudioActionKeys } from "@/preferences/models/audio";

import { StatefulSettingsTrigger } from "../../Actions/Settings/StatefulSettingsTrigger";
import { StatefulAudioSettingsContainer } from "../../Actions/Settings/StatefulAudioSettingsContainer";
import { StatefulTocTrigger } from "../../Actions/Toc/StatefulTocTrigger";
import { StatefulTocContainer } from "../../Actions/Toc/StatefulTocContainer";
import { StatefulFullscreenTrigger } from "../../Actions/Fullscreen/StatefulFullscreenTrigger";

import { StatefulAudioSkipBackwardInterval } from "../../Audio/Settings/StatefulAudioSkipBackwardInterval";
import { StatefulAudioSkipForwardInterval } from "../../Audio/Settings/StatefulAudioSkipForwardInterval";
import { StatefulAudioSkipInterval } from "../../Audio/Settings/StatefulAudioSkipInterval";
import { StatefulAudioAutoPlay } from "../../Audio/Settings/StatefulAudioAutoPlay";
import { StatefulTheme } from "../../Settings/StatefulTheme";

import { StatefulAudioVolumeTrigger } from "../../Audio/actions/Volume/StatefulAudioVolumeTrigger";
import { StatefulAudioVolumeContainer } from "../../Audio/actions/Volume/StatefulAudioVolumeContainer";
import { StatefulAudioPlaybackRateTrigger } from "../../Audio/actions/PlaybackRate/StatefulAudioPlaybackRateTrigger";
import { StatefulAudioPlaybackRateContainer } from "../../Audio/actions/PlaybackRate/StatefulAudioPlaybackRateContainer";
import { StatefulAudioTocTrigger } from "../../Audio/actions/Toc/StatefulAudioTocTrigger";
import { StatefulAudioTocContainer } from "../../Audio/actions/Toc/StatefulAudioTocContainer";
import { StatefulAudioSleepTimerTrigger } from "../../Audio/actions/SleepTimer/StatefulAudioSleepTimerTrigger";
import { StatefulAudioSleepTimerContainer } from "../../Audio/actions/SleepTimer/StatefulAudioSleepTimerContainer";
import { StatefulAudioRemotePlaybackTrigger } from "../../Audio/actions/RemotePlayback/StatefulAudioRemotePlaybackTrigger";

export const createAudioDefaultPlugin = (): ThPlugin => {
  return {
    id: "audio-core",
    name: "Audio Core Components",
    description: "Default components for Thorium Web Audio StatefulReader",
    version: "1.5.6",
    components: {
      actions: {
        [ThActionsKeys.settings]: {
          Trigger: StatefulSettingsTrigger,
          Target: StatefulAudioSettingsContainer
        },
        [ThActionsKeys.toc]: {
          Trigger: StatefulTocTrigger,
          Target: StatefulTocContainer
        },
        [ThActionsKeys.fullscreen]: {
          Trigger: StatefulFullscreenTrigger
        },
        [ThAudioActionKeys.remotePlayback]: {
          Trigger: StatefulAudioRemotePlaybackTrigger
        }
      },
      primaryAudioActions: {
        [ThAudioActionKeys.volume]:       { Trigger: StatefulAudioVolumeTrigger,      Target: StatefulAudioVolumeContainer },
        [ThAudioActionKeys.playbackRate]: { Trigger: StatefulAudioPlaybackRateTrigger, Target: StatefulAudioPlaybackRateContainer },
        [ThAudioActionKeys.toc]:          { Trigger: StatefulAudioTocTrigger,          Target: StatefulAudioTocContainer },
        [ThAudioActionKeys.sleepTimer]:   { Trigger: StatefulAudioSleepTimerTrigger,   Target: StatefulAudioSleepTimerContainer },
      },
      settings: {
        [ThAudioKeys.theme]: {
          Comp: StatefulTheme
        },
        [ThAudioKeys.skipInterval]: {
          Comp: StatefulAudioSkipInterval
        },
        [ThAudioKeys.skipBackwardInterval]: {
          Comp: StatefulAudioSkipBackwardInterval
        },
        [ThAudioKeys.skipForwardInterval]: {
          Comp: StatefulAudioSkipForwardInterval
        },
        [ThAudioKeys.autoPlay]: {
          Comp: StatefulAudioAutoPlay
        }
      }
    }
  };
};
