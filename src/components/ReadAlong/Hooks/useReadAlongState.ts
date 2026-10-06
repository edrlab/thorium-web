"use client";

import { useCallback } from "react";

import { ThActionsKeys } from "@/preferences/models";

import { useAppDispatch, useAppSelector, useAppStore } from "@/lib/hooks";
import { setActionOpen } from "@/lib/actionsReducer";
import { setReadAlongActive, setReadAlongLayout } from "@/lib/readAlongPlayerReducer";

export const useReadAlongState = () => {
  const profile = useAppSelector(state => state.reader.profile);
  const isActive = useAppSelector(state => state.readAlongPlayer.isActive);
  const isExpanded = useAppSelector(state => profile ? !!state.actions.keys[profile][ThActionsKeys.readAlong]?.isOpen : false);
  const store = useAppStore();
  const dispatch = useAppDispatch();

  const setExpanded = useCallback((value: boolean) => {
    if (profile) {
      dispatch(setActionOpen({ key: ThActionsKeys.readAlong, isOpen: value, profile }));
    }
  }, [dispatch, profile]);

  // Reads the store when called so that it stays stable for unmount cleanups
  const setActive = useCallback((value: boolean) => {
    const state = store.getState();
    if (value) {
      dispatch(setReadAlongActive(true));
      if (state.readAlongPlayer.layout === "expanded") setExpanded(true);
    } else {
      const wasExpanded = profile ? !!state.actions.keys[profile][ThActionsKeys.readAlong]?.isOpen : false;
      dispatch(setReadAlongLayout(wasExpanded ? "expanded" : "mini"));
      setExpanded(false);
      dispatch(setReadAlongActive(false));
    }
  }, [store, dispatch, setExpanded, profile]);

  return {
    isActive,
    isExpanded,
    setActive,
    setExpanded
  };
};
