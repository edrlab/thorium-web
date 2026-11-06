"use client";

import timerStyles from "./assets/styles/thorium-web.readAlongSleepTimer.module.css";

import { StatefulActionTriggerProps } from "../../../Actions/models/actions";
import { StatefulSleepTimerTrigger } from "../../../Playback/actions/SleepTimer/StatefulSleepTimerTrigger";

export const StatefulReadAlongSleepTimerTrigger = (props: StatefulActionTriggerProps) => {
  return (
    <StatefulSleepTimerTrigger
      { ...props }
      className={ timerStyles.button }
      compounds={ { label: { className: timerStyles.label } } }
    />
  );
};
