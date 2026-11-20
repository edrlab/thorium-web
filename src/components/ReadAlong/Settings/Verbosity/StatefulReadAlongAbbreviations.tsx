"use client";

import { ThReadAlongKeys } from "@/preferences";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulReadAlongInterruption } from "./StatefulReadAlongInterruption";

export const StatefulReadAlongAbbreviations = ({ standalone = true }: StatefulSettingsItemProps) => {
  return <StatefulReadAlongInterruption standalone={ standalone } settingKey={ ThReadAlongKeys.abbreviations } role="abbreviation" />;
}
