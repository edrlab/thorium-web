"use client";

import { useMemo } from "react";

import progressionStyles from "./assets/styles/thorium-web.reader.progression.module.css";

import { ThProgressionFormat } from "@/preferences/models";
import { ThFormatPref } from "@/preferences";

import { ThProgression } from "@/core/Components/Reader/ThProgression";

import { useI18n } from "@/i18n/useI18n";
import { useProgressionFormat } from "./hooks/useProgressionFormat";
import { useProgressionText } from "./hooks/useProgressionText";

import classNames from "classnames";

export const StatefulReaderProgression = ({
  className,
  formatPref,
  fallbackVariant
}: {
  className?: string,
  formatPref?: ThFormatPref<ThProgressionFormat | ThProgressionFormat[]>,
  fallbackVariant: ThProgressionFormat | Array<ThProgressionFormat>
}) => {
  const { t } = useI18n();
  const displayFormat = useProgressionFormat(formatPref, fallbackVariant);
  const getProgressionText = useProgressionText();

  const displayText = useMemo(() => getProgressionText(displayFormat), [getProgressionText, displayFormat]);

  if (!displayText || displayFormat === ThProgressionFormat.none) {
    return null;
  }

  return (
    <ThProgression
      id="current-progression"
      className={ classNames(progressionStyles.wrapper, className) }
      aria-label={ t("reader.app.progression.wrapper") }
    >
      { displayText }
    </ThProgression>
  );
};
