"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SettingsStorage, StoredSettings } from "@/components/Reader/StatefulReaderWrapper";
import { ReaderProfile } from "@/lib/readerReducer";
import { defaultSettingsStorageStrategies, ThSettingsStorageStrategy } from "@/lib/settingsStorageStrategies";
import { getFieldStrategy, getPublicationFields, getThemeStrategy, SettingsScope, SettingsSlice, ThemeKey } from "@/lib/helpers/settingsStorage";
import { HydratePayload } from "@/lib/helpers/hydrateState";
import { getFromIndexedDB, setInIndexedDB } from "@/lib/helpers/indexedDB";

import { useReadAlongVerbosity } from "@/components/ReadAlong/Hooks/useReadAlongVerbosity";

import { useAppDispatch, useAppSelector, useAppStore } from "@/lib/hooks";
import { hydrateAudioSettings } from "@/lib/audioSettingsReducer";
import { hydrateDivinaSettings } from "@/lib/divinaSettingsReducer";
import { hydrateReadAlongPlayer } from "@/lib/readAlongPlayerReducer";
import { hydrateReadAlongSettings } from "@/lib/readAlongSettingsReducer";
import { hydrateSettings } from "@/lib/settingsReducer";
import { hydrateTheme } from "@/lib/themeReducer";
import { hydrateWebPubSettings } from "@/lib/webPubSettingsReducer";

import debounce from "debounce";

type ReaderProfileKey = Exclude<ReaderProfile, undefined>;

const PROFILE_SLICES: Record<ReaderProfileKey, SettingsSlice[]> = {
  epub: ["settings", "readAlongSettings"],
  webPub: ["webPubSettings", "readAlongSettings"],
  divina: ["divinaSettings"],
  audio: ["audioSettings"]
};

const HYDRATE_ACTIONS: Record<SettingsSlice, (payload: HydratePayload<any>) => { type: string; payload: HydratePayload<any> }> = {
  settings: hydrateSettings,
  webPubSettings: hydrateWebPubSettings,
  divinaSettings: hydrateDivinaSettings,
  audioSettings: hydrateAudioSettings,
  readAlongSettings: hydrateReadAlongSettings
};

const READ_ALONG_PROFILES: ReaderProfileKey[] = ["epub", "webPub"];

const SCOPE_THEMES: Record<SettingsScope, ThemeKey | null> = {
  reflow: "reflow",
  fxl: "fxl",
  webPub: null,
  divina: "fxl",
  audio: "audio",
  readAlong: null
};

const pick = (source: object | undefined, fields: string[]): Record<string, unknown> => {
  if (!source) return {};
  return Object.fromEntries(fields.filter((field) => field in source).map((field) => [field, (source as Record<string, unknown>)[field]]));
};

export const useSettingsStorage = (key: string | null, profile: ReaderProfileKey, customStorage?: SettingsStorage) => {
  const dispatch = useAppDispatch();
  // Stores not made with makeStore have no strategies of their own
  const strategies = useAppStore().settingsStorageStrategies ?? defaultSettingsStorageStrategies;
  const [isHydrated, setIsHydrated] = useState(false);

  const settings = useAppSelector(state => state.settings);
  const webPubSettings = useAppSelector(state => state.webPubSettings);
  const divinaSettings = useAppSelector(state => state.divinaSettings);
  const audioSettings = useAppSelector(state => state.audioSettings);
  const readAlongSettings = useAppSelector(state => state.readAlongSettings);
  const isReadAlongActive = useAppSelector(state => state.readAlongPlayer.isActive);
  const readAlongLayout = useAppSelector(state => state.readAlongPlayer.layout);
  const theme = useAppSelector(state => state.theming.theme);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const { verbosityKey } = useReadAlongVerbosity();

  // Like the settings orders, and the reader's own theme
  const scope: SettingsScope = profile === "epub" ? (isFXL ? "fxl" : "reflow") : profile;
  const themeKey = SCOPE_THEMES[scope];
  const themeStrategy = getThemeStrategy(strategies, scope);
  const sliceScope = useCallback((slice: SettingsSlice): SettingsScope => slice === "readAlongSettings" ? "readAlong" : scope, [scope]);

  const hasStorage = !!key || !!customStorage;

  // Seeded on first open, from the global settings
  const hasEntry = useRef(false);

  // Integrators may pass a new storage object on each render, only the first one is read
  const hydratedKey = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (hydratedKey.current === key) return;
    hydratedKey.current = key;

    let cancelled = false;
    let done = false;

    const hydrate = async () => {
      const stored: StoredSettings | undefined = customStorage
        ? await customStorage.get()
        : key ? await getFromIndexedDB<StoredSettings>("settings", key) : undefined;
      if (cancelled) return;

      PROFILE_SLICES[profile].forEach((slice) => {
        const fields = getPublicationFields(strategies, sliceScope(slice), slice);
        const values = pick(stored?.[slice], fields);
        const reset = fields.filter((field) => !(field in values) && getFieldStrategy(strategies, sliceScope(slice), slice, field) === ThSettingsStorageStrategy.local);
        if (Object.keys(values).length > 0 || reset.length > 0) dispatch(HYDRATE_ACTIONS[slice]({ values, reset }));
      });

      if (themeKey && themeStrategy !== ThSettingsStorageStrategy.global) {
        const value = stored?.theme?.[themeKey];
        if (value) dispatch(hydrateTheme({ values: { [themeKey]: value }, reset: [] }));
        else if (themeStrategy === ThSettingsStorageStrategy.local) dispatch(hydrateTheme({ values: {}, reset: [themeKey] }));
      }

      // Not a setting, but never stored globally, so a publication without its own starts with read along off
      if (READ_ALONG_PROFILES.includes(profile)) dispatch(hydrateReadAlongPlayer(stored?.readAlongPlayer ?? {}));

      hasEntry.current = !!stored;
      done = true;
      setIsHydrated(true);
    };

    hydrate().catch((error) => {
      console.warn("Settings storage:", error);
      done = true;
      if (!cancelled) setIsHydrated(true);
    });

    return () => {
      cancelled = true;
      // Interrupted before loading, so the next run loads again
      if (!done && hydratedKey.current === key) hydratedKey.current = undefined;
    };
  }, [key, profile, customStorage, strategies, sliceScope, themeKey, themeStrategy, dispatch]);

  const current = useMemo(() => {
    const slices: Record<SettingsSlice, object> = { settings, webPubSettings, divinaSettings, audioSettings, readAlongSettings };
    const stored: StoredSettings = {};

    PROFILE_SLICES[profile].forEach((slice) => {
      const values = pick(slices[slice], getPublicationFields(strategies, sliceScope(slice), slice));
      // Kept per format, only this publication's is stored
      if (slice === "readAlongSettings" && "verbosity" in values) {
        const verbosity = typeof readAlongSettings.verbosity === "object" ? readAlongSettings.verbosity?.[verbosityKey] : undefined;
        values.verbosity = verbosity ? { [verbosityKey]: verbosity } : {};
      }
      Object.assign(stored, { [slice]: values });
    });

    if (themeKey && themeStrategy !== ThSettingsStorageStrategy.global) stored.theme = { [themeKey]: theme[themeKey] };
    if (READ_ALONG_PROFILES.includes(profile)) stored.readAlongPlayer = { isActive: isReadAlongActive, layout: readAlongLayout };

    return stored;
  }, [profile, strategies, sliceScope, settings, webPubSettings, divinaSettings, audioSettings, readAlongSettings, verbosityKey, themeStrategy, themeKey, theme, isReadAlongActive, readAlongLayout]);

  const save = useMemo(() => debounce((value: StoredSettings) => {
    if (customStorage) void customStorage.set(value);
    else if (key) void setInIndexedDB("settings", key, value);
  }, 250), [customStorage, key]);

  // So that the last change isn't lost when the reader closes
  useEffect(() => {
    return () => save.flush();
  }, [save]);

  // Global changes then only affect new publications, as with Thorium Mobile
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!isHydrated || !hasStorage) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (hasEntry.current) return;
      save(current);
      save.flush();
      return;
    }
    save(current);
  }, [isHydrated, hasStorage, current, save]);

  return isHydrated;
};
