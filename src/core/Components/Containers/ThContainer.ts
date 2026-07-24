"use client";

import React from "react";

import { ThContainerHeaderProps } from "./ThContainerHeader";
import { ThContainerBodyProps } from "./ThContainerBody";
import { SheetRef } from "react-modal-sheet";

import { UseFirstFocusableProps } from "./hooks/useFirstFocusable";

export enum ThContainerHeaderVariant {
  close = "close",
  docker = "docker",
  previous = "previous"
}

export interface ThContainerProps {
  id?: string;
  ref?: React.RefObject<HTMLDivElement | SheetRef | null>;
  focusOptions?: UseFirstFocusableProps;
  children: [React.ReactElement<ThContainerHeaderProps>, React.ReactElement<ThContainerBodyProps>];
}