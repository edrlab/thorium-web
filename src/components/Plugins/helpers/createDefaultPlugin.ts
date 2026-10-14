import { ThPlugin } from "../PluginRegistry";
import { ThActionsKeys, ThReadAlongActionKeys, ThReadAlongKeys, ThSettingsKeys } from "@/preferences/models";

import { StatefulFullscreenTrigger } from "../../Actions/Fullscreen/StatefulFullscreenTrigger";
import { StatefulJumpToPositionTrigger } from "../../Actions/JumpToPosition/StatefulJumpToPositionTrigger";
import { StatefulJumpToPositionContainer } from "../../Actions/JumpToPosition/StatefulJumpToPositionContainer";
import { StatefulSettingsTrigger } from "../../Actions/Settings/StatefulSettingsTrigger";
import { StatefulVisualSettingsContainer } from "../../Actions/Settings/StatefulVisualSettingsContainer";
import { StatefulTocTrigger } from "../../Actions/Toc/StatefulTocTrigger";
import { StatefulTocContainer } from "../../Actions/Toc/StatefulTocContainer";
import { StatefulReadAlongTrigger } from "../../ReadAlong/StatefulReadAlongTrigger";
import { StatefulReadAlongContainer } from "../../ReadAlong/StatefulReadAlongContainer";
import { StatefulReadAlongVolumeTrigger } from "../../ReadAlong/actions/Volume/StatefulReadAlongVolumeTrigger";
import { StatefulReadAlongVolumeContainer } from "../../ReadAlong/actions/Volume/StatefulReadAlongVolumeContainer";
import { StatefulReadAlongRateTrigger } from "../../ReadAlong/actions/Rate/StatefulReadAlongRateTrigger";
import { StatefulReadAlongRateContainer } from "../../ReadAlong/actions/Rate/StatefulReadAlongRateContainer";
import { StatefulReadAlongSleepTimerTrigger } from "../../ReadAlong/actions/SleepTimer/StatefulReadAlongSleepTimerTrigger";
import { StatefulReadAlongSleepTimerContainer } from "../../ReadAlong/actions/SleepTimer/StatefulReadAlongSleepTimerContainer";
import { StatefulReadAlongSettingsTrigger } from "../../ReadAlong/actions/Settings/StatefulReadAlongSettingsTrigger";
import { StatefulReadAlongSettingsContainer } from "../../ReadAlong/actions/Settings/StatefulReadAlongSettingsContainer";

import { StatefulColumns } from "../../Epub/Settings/StatefulColumns";
import { StatefulDivinaQuality } from "../../Divina/Settings/StatefulDivinaQuality";
import { StatefulDivinaSpreads } from "../../Divina/Settings/StatefulDivinaSpreads";
import { StatefulDivinaStripWidth } from "../../Divina/Settings/StatefulDivinaStripWidth";
import { StatefulFontFamily } from "../../Settings/Text/StatefulFontFamily";
import { UnstableStatefulFontWeight } from "../../Settings/Text/StatefulFontWeight";
import { StatefulHyphens } from "../../Settings/Text/StatefulHyphens";
import { StatefulLayout } from "../../Settings/StatefulLayout";
import { StatefulLetterSpacing } from "../../Settings/Spacing/StatefulLetterSpacing";
import { StatefulLineHeight } from "../../Settings/Spacing/StatefulLineHeight";
import { StatefulParagraphIndent } from "../../Settings/Spacing/StatefulParagraphIndent";
import { StatefulParagraphSpacing } from "../../Settings/Spacing/StatefulParagraphSpacing";
import { StatefulPublisherStyles } from "../../Settings/StatefulPublisherStyles";
import { StatefulSpacingGroup } from "../../Settings/Spacing/StatefulSpacingGroup";
import { StatefulSpacingPresets } from "../../Settings/Spacing/StatefulSpacingPresets";
import { StatefulTextAlign } from "../../Settings/Text/StatefulTextAlign";
import { StatefulTextGroup } from "../../Settings/Text/StatefulTextGroup";
import { StatefulTextNormalize } from "../../Settings/Text/StatefulTextNormalize";
import { StatefulLigatures } from "../../Settings/Text/StatefulLigatures";
import { StatefulNoRuby } from "../../Settings/Text/StatefulNoRuby";
import { StatefulTheme } from "../../Settings/StatefulTheme";
import { StatefulWordSpacing } from "../../Settings/Spacing/StatefulWordSpacing";
import { StatefulZoom } from "../../Settings/StatefulZoom";
import { StatefulReadAlongVoice } from "../../ReadAlong/Settings/Voice/StatefulReadAlongVoice";
import { StatefulReadAlongVoiceGroup } from "../../ReadAlong/Settings/Voice/StatefulReadAlongVoiceGroup";
import { StatefulReadAlongRate } from "../../ReadAlong/Settings/Prosody/StatefulReadAlongRate";
import { StatefulReadAlongPitch } from "../../ReadAlong/Settings/Voice/StatefulReadAlongPitch";
import { StatefulReadAlongVolume } from "../../ReadAlong/Settings/Voice/StatefulReadAlongVolume";
import { StatefulReadAlongPauseDuration } from "../../ReadAlong/Settings/Prosody/StatefulReadAlongPauseDuration";
import { StatefulReadAlongUtteranceStyle } from "../../ReadAlong/Settings/Highlight/StatefulReadAlongUtteranceStyle";
import { StatefulReadAlongWordStyle } from "../../ReadAlong/Settings/Highlight/StatefulReadAlongWordStyle";
import { StatefulReadAlongKeepCentered } from "../../ReadAlong/Settings/Highlight/StatefulReadAlongKeepCentered";
import { StatefulReadAlongHighlightGroup } from "../../ReadAlong/Settings/Highlight/StatefulReadAlongHighlightGroup";
import { StatefulReadAlongHighlightPresets } from "../../ReadAlong/Settings/Highlight/StatefulReadAlongHighlightPresets";
import { StatefulReadAlongAutoPause } from "../../ReadAlong/Settings/Prosody/StatefulReadAlongAutoPause";
import { StatefulReadAlongProsodyGroup } from "../../ReadAlong/Settings/Prosody/StatefulReadAlongProsodyGroup";
import { StatefulReadAlongProsodyPresets } from "../../ReadAlong/Settings/Prosody/StatefulReadAlongProsodyPresets";
import { StatefulReadAlongVerbosity } from "../../ReadAlong/Settings/Verbosity/StatefulReadAlongVerbosity";
import { StatefulReadAlongVerbosityGroup } from "../../ReadAlong/Settings/Verbosity/StatefulReadAlongVerbosityGroup";
import { StatefulReadAlongLanguage } from "../../ReadAlong/Settings/Voice/StatefulReadAlongLanguage";
import { StatefulReadAlongInlineContextualization } from "../../ReadAlong/Settings/Verbosity/StatefulReadAlongInlineContextualization";

export const createDefaultPlugin = (): ThPlugin => {
  return {
    id: "core",
    name: "Core Components",
    description: "Default components for Thorium Web Epub StatefulReader",
    version: "1.7.0",
    components: {
      actions: {
        [ThActionsKeys.fullscreen]: {
          Trigger: StatefulFullscreenTrigger
        },
        [ThActionsKeys.jumpToPosition]: {
          Trigger: StatefulJumpToPositionTrigger,
          Target: StatefulJumpToPositionContainer
        },
        [ThActionsKeys.settings]: {
          Trigger: StatefulSettingsTrigger,
          Target: StatefulVisualSettingsContainer
        },
        [ThActionsKeys.toc]: {
          Trigger: StatefulTocTrigger,
          Target: StatefulTocContainer
        },
        [ThActionsKeys.readAlong]: {
          Trigger: StatefulReadAlongTrigger,
          Target: StatefulReadAlongContainer
        }
      },
      readAlongActions: {
        [ThReadAlongActionKeys.volume]: {
          Trigger: StatefulReadAlongVolumeTrigger,
          Target: StatefulReadAlongVolumeContainer
        },
        [ThReadAlongActionKeys.rate]: {
          Trigger: StatefulReadAlongRateTrigger,
          Target: StatefulReadAlongRateContainer
        },
        [ThReadAlongActionKeys.sleepTimer]: {
          Trigger: StatefulReadAlongSleepTimerTrigger,
          Target: StatefulReadAlongSleepTimerContainer
        },
        [ThReadAlongActionKeys.settings]: {
          Trigger: StatefulReadAlongSettingsTrigger,
          Target: StatefulReadAlongSettingsContainer
        }
      },
      settings: {
        [ThSettingsKeys.columns]: {
          Comp: StatefulColumns
        },
        [ThSettingsKeys.divinaQuality]: {
          Comp: StatefulDivinaQuality
        },
        [ThSettingsKeys.divinaSpreads]: {
          Comp: StatefulDivinaSpreads
        },
        [ThSettingsKeys.divinaStripWidth]: {
          Comp: StatefulDivinaStripWidth
        },
        [ThSettingsKeys.fontFamily]: {
          Comp: StatefulFontFamily,
          type: "text"
        },
        [ThSettingsKeys.fontWeight]: {
          Comp: UnstableStatefulFontWeight,
          type: "text"
        },
        [ThSettingsKeys.hyphens]: {
          Comp: StatefulHyphens,
          type: "text"
        },
        [ThSettingsKeys.layout]: {
          Comp: StatefulLayout
        },
        [ThSettingsKeys.letterSpacing]: {
          Comp: StatefulLetterSpacing,
          type: "spacing"
        },
        [ThSettingsKeys.lineHeight]: {
          Comp: StatefulLineHeight,
          type: "spacing"
        },
        [ThSettingsKeys.paragraphIndent]: {
          Comp: StatefulParagraphIndent,
          type: "spacing"
        },
        [ThSettingsKeys.paragraphSpacing]: {
          Comp: StatefulParagraphSpacing,
          type: "spacing"
        },
        [ThSettingsKeys.publisherStyles]: {
          Comp: StatefulPublisherStyles,
          type: "spacing"
        },
        [ThSettingsKeys.spacingGroup]: {
          Comp: StatefulSpacingGroup,
        },
        [ThSettingsKeys.spacingPresets]: {
          Comp: StatefulSpacingPresets,
          type: "spacing"
        },
        [ThSettingsKeys.textAlign]: {
          Comp: StatefulTextAlign,
          type: "text"
        },
        [ThSettingsKeys.textGroup]: {
          Comp: StatefulTextGroup
        },
        [ThSettingsKeys.textNormalize]: {
          Comp: StatefulTextNormalize,
          type: "text"
        },
        [ThSettingsKeys.ligatures]: {
          Comp: StatefulLigatures,
          type: "text"
        },
        [ThSettingsKeys.noRuby]: {
          Comp: StatefulNoRuby,
          type: "text"
        },
        [ThSettingsKeys.theme]: {
          Comp: StatefulTheme
        },
        [ThSettingsKeys.wordSpacing]: {
          Comp: StatefulWordSpacing,
          type: "spacing"
        },
        [ThSettingsKeys.zoom]: {
          Comp: StatefulZoom
        },
        [ThReadAlongKeys.voiceGroup]: {
          Comp: StatefulReadAlongVoiceGroup
        },
        [ThReadAlongKeys.voice]: {
          Comp: StatefulReadAlongVoice,
          type: "readAlongVoice"
        },
        [ThReadAlongKeys.rate]: {
          Comp: StatefulReadAlongRate,
          type: "readAlongProsody"
        },
        [ThReadAlongKeys.pitch]: {
          Comp: StatefulReadAlongPitch,
          type: "readAlongVoice"
        },
        [ThReadAlongKeys.volume]: {
          Comp: StatefulReadAlongVolume,
          type: "readAlongVoice"
        },
        [ThReadAlongKeys.pauseDuration]: {
          Comp: StatefulReadAlongPauseDuration,
          type: "readAlongProsody"
        },
        [ThReadAlongKeys.highlightGroup]: {
          Comp: StatefulReadAlongHighlightGroup
        },
        [ThReadAlongKeys.highlightPresets]: {
          Comp: StatefulReadAlongHighlightPresets,
          type: "readAlongHighlight"
        },
        [ThReadAlongKeys.utteranceStyle]: {
          Comp: StatefulReadAlongUtteranceStyle,
          type: "readAlongHighlight"
        },
        [ThReadAlongKeys.wordStyle]: {
          Comp: StatefulReadAlongWordStyle,
          type: "readAlongHighlight"
        },
        [ThReadAlongKeys.keepCentered]: {
          Comp: StatefulReadAlongKeepCentered,
          type: "readAlongHighlight"
        },
        [ThReadAlongKeys.autoPause]: {
          Comp: StatefulReadAlongAutoPause,
          type: "readAlongProsody"
        },
        [ThReadAlongKeys.prosodyGroup]: {
          Comp: StatefulReadAlongProsodyGroup
        },
        [ThReadAlongKeys.prosodyPresets]: {
          Comp: StatefulReadAlongProsodyPresets,
          type: "readAlongProsody"
        },
        [ThReadAlongKeys.verbosityGroup]: {
          Comp: StatefulReadAlongVerbosityGroup
        },
        [ThReadAlongKeys.verbosity]: {
          Comp: StatefulReadAlongVerbosity,
          type: "readAlongVerbosity"
        },
        [ThReadAlongKeys.language]: {
          Comp: StatefulReadAlongLanguage,
          type: "readAlongVoice"
        },
        [ThReadAlongKeys.inlineContextualization]: {
          Comp: StatefulReadAlongInlineContextualization,
          type: "readAlongVerbosity"
        }
      }
    }
  };
};