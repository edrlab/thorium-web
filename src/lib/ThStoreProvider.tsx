"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { ThSettingsStorageStrategies } from "./settingsStorageStrategies";

export const ThStoreProvider = ({
  storageKey,
  settingsStorageStrategies,
  store,
  children
}: {
  storageKey?: string,
  settingsStorageStrategies?: ThSettingsStorageStrategies,
  store?: AppStore,
  children: React.ReactNode
}) => {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = store || makeStore(storageKey, {}, settingsStorageStrategies);
  }

  return <Provider store={ storeRef.current }>{ children }</Provider>
}

export default ThStoreProvider;