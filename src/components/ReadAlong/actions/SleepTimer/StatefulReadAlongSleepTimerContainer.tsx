"use client";

import timerStyles from "./assets/styles/thorium-web.readAlongSleepTimer.module.css";

import { StatefulActionContainerProps } from "../../../Actions/models/actions";
import { StatefulSleepTimerContainer } from "../../../Playback/actions/SleepTimer/StatefulSleepTimerContainer";

export const StatefulReadAlongSleepTimerContainer = (props: StatefulActionContainerProps) => {
  return (
    <StatefulSleepTimerContainer
      { ...props }
      className={ timerStyles.wrapper }
      compounds={ {
        listbox: { className: timerStyles.listbox },
        listboxItem: { className: timerStyles.listboxItem },
        durationField: { className: timerStyles.durationField },
        instruction: { className: timerStyles.instruction },
        inputs: { className: timerStyles.inputs },
        fieldGroup: { className: timerStyles.fieldGroup },
        fieldInput: { className: timerStyles.fieldInput },
        unitLabel: { className: timerStyles.unitLabel },
        remaining: { className: timerStyles.remaining },
        startButton: { className: timerStyles.startButton },
        cancelButton: { className: timerStyles.cancelButton }
      } }
    />
  );
};
