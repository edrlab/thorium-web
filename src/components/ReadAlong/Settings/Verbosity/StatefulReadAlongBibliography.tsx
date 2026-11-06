"use client";

import { ThReadAlongKeys } from "@/preferences";

import { StatefulSettingsItemProps } from "../../../Settings/models/settings";

import { StatefulReadAlongInterruption } from "./StatefulReadAlongInterruption";

export const StatefulReadAlongBibliography = ({ standalone = true }: StatefulSettingsItemProps) => {
  return <StatefulReadAlongInterruption standalone={ standalone } settingKey={ ThReadAlongKeys.bibliography } role="biblioref" />;
}
