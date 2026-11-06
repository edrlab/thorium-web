"use client";

import React from "react";

import { ThActionsBar, ThActionsBarProps } from "../Actions/ThActionsBar";

export interface ThPlaybackControlsProps extends Omit<ThActionsBarProps, "children"> {
  previous?: React.ReactNode;
  skipBackward?: React.ReactNode;
  playPause: React.ReactNode;
  skipForward?: React.ReactNode;
  next?: React.ReactNode;
}

// Media controls keep a left-to-right order regardless of the UI direction
export const ThPlaybackControls = ({
  previous,
  skipBackward,
  playPause,
  skipForward,
  next,
  ...props
}: ThPlaybackControlsProps) => {
  return (
    <ThActionsBar dir="ltr" { ...props }>
      { previous }
      { skipBackward }
      { playPause }
      { skipForward }
      { next }
    </ThActionsBar>
  );
};
