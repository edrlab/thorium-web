"use client";

import { Fragment, useRef } from "react";

import { ThActionsTriggerVariant } from "@/core/Components/Actions/ThActionsBar";
import { ActionComponent } from "@/components/Plugins/PluginRegistry";

export const PlaybackActionPair = ({ action }: { action: ActionComponent }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { Trigger, Target } = action;
  return (
    <Fragment>
      <Trigger ref={ triggerRef } variant={ ThActionsTriggerVariant.button } />
      { Target && <Target triggerRef={ triggerRef } placement="top" /> }
    </Fragment>
  );
};
