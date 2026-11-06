"use client";

import { ThReadAlongKeys } from "@/preferences";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulReadAlongInterruption } from "./StatefulReadAlongInterruption";

export const StatefulReadAlongNotes = ({ standalone = true }: StatefulSettingsItemProps) => {
  return <StatefulReadAlongInterruption standalone={ standalone } settingKey={ ThReadAlongKeys.notes } role="noteref" />;
}
