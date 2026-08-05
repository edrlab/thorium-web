import { ThPlugin } from "../PluginRegistry";
import { ThActionsKeys, ThSettingsKeys } from "@/preferences/models";

import { StatefulFullscreenTrigger } from "../../Actions/Fullscreen/StatefulFullscreenTrigger";
import { StatefulJumpToPositionTrigger } from "../../Actions/JumpToPosition/StatefulJumpToPositionTrigger";
import { StatefulJumpToPositionContainer } from "../../Actions/JumpToPosition/StatefulJumpToPositionContainer";
import { StatefulSettingsTrigger } from "../../Actions/Settings/StatefulSettingsTrigger";
import { StatefulVisualSettingsContainer } from "../../Actions/Settings/StatefulVisualSettingsContainer";
import { StatefulTocTrigger } from "../../Actions/Toc/StatefulTocTrigger";
import { StatefulTocContainer } from "../../Actions/Toc/StatefulTocContainer";

import { StatefulColumns } from "../../Epub/Settings/StatefulColumns";
import { StatefulFontFamily } from "../../Settings/Text/StatefulFontFamily";
import { UnstableStatefulFontWeight } from "../../Settings/Text/StatefulFontWeight";
import { StatefulHyphens } from "../../Settings/Text/StatefulHyphens";
import { StatefulLayout } from "../../Epub/Settings/StatefulLayout";
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

export const createDefaultPlugin = (): ThPlugin => {
  return {
    id: "core",
    name: "Core Components",
    description: "Default components for Thorium Web Epub StatefulReader",
    version: "1.5.7",
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
        }
      },
      settings: {
        [ThSettingsKeys.columns]: {
          Comp: StatefulColumns
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
        }
      }
    }
  };
};