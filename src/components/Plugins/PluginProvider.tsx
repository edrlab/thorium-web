"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThPluginRegistry, ActionComponent, SettingComponent } from "./PluginRegistry";

interface ThPluginContextType {
  actionsComponentsMap: Record<string, ActionComponent>;
  settingsComponentsMap: Record<string, SettingComponent>;
  textSettingsComponentsMap: Record<string, SettingComponent>;
  spacingSettingsComponentsMap: Record<string, SettingComponent>;
  readAlongHighlightSettingsComponentsMap: Record<string, SettingComponent>;
  primaryAudioActionsMap: Record<string, ActionComponent>;
  readAlongActionsMap: Record<string, ActionComponent>;
  registerPlugin: typeof ThPluginRegistry.register;
  unregisterPlugin: typeof ThPluginRegistry.unregister;
}

const ThPluginContext = createContext<ThPluginContextType>({
  actionsComponentsMap: {} as Record<string, ActionComponent>,
  settingsComponentsMap: {} as Record<string, SettingComponent>,
  textSettingsComponentsMap: {} as Record<string, SettingComponent>,
  spacingSettingsComponentsMap: {} as Record<string, SettingComponent>,
  readAlongHighlightSettingsComponentsMap: {} as Record<string, SettingComponent>,
  primaryAudioActionsMap: {} as Record<string, ActionComponent>,
  readAlongActionsMap: {} as Record<string, ActionComponent>,
  registerPlugin: ThPluginRegistry.register.bind(ThPluginRegistry),
  unregisterPlugin: ThPluginRegistry.unregister.bind(ThPluginRegistry)
});

export const usePlugins = () => useContext(ThPluginContext);

export const ThPluginProvider = ({ children }: { children: React.ReactNode }) => {
  const [componentMaps, setComponentMaps] = useState<{
    actionsComponentsMap: Record<string, ActionComponent>;
    settingsComponentsMap: Record<string, SettingComponent>;
    textSettingsComponentsMap: Record<string, SettingComponent>;
    spacingSettingsComponentsMap: Record<string, SettingComponent>;
    readAlongHighlightSettingsComponentsMap: Record<string, SettingComponent>;
    primaryAudioActionsMap: Record<string, ActionComponent>;
    readAlongActionsMap: Record<string, ActionComponent>;
  }>(() => {
    // Force a fresh retrieval of component maps
    const maps = ThPluginRegistry.getComponentMaps();
    return {
      ...maps,
      textSettingsComponentsMap: getTypedSettingsComponents(maps.settingsComponentsMap, "text"),
      spacingSettingsComponentsMap: getTypedSettingsComponents(maps.settingsComponentsMap, "spacing"),
      readAlongHighlightSettingsComponentsMap: getTypedSettingsComponents(maps.settingsComponentsMap, "readAlongHighlight")
    };
  });

  // Helper function to filter settings components by type
  function getTypedSettingsComponents(
    componentsMap: Record<string, SettingComponent>,
    type: NonNullable<SettingComponent["type"]>
  ): Record<string, SettingComponent> {
    return Object.entries(componentsMap)
      .filter(([_, component]) => component.type === type)
      .reduce((acc, [key, component]) => {
        acc[key] = component;
        return acc;
      }, {} as Record<string, SettingComponent>);
  }
  
  // Update component maps when plugins change
  useEffect(() => {
    const updateComponentMaps = () => {
      const maps = ThPluginRegistry.getComponentMaps();
      setComponentMaps({
        ...maps,
        textSettingsComponentsMap: getTypedSettingsComponents(maps.settingsComponentsMap, "text"),
        spacingSettingsComponentsMap: getTypedSettingsComponents(maps.settingsComponentsMap, "spacing"),
        readAlongHighlightSettingsComponentsMap: getTypedSettingsComponents(maps.settingsComponentsMap, "readAlongHighlight"),
      });
    };
        
    // Initial update to ensure we have the latest maps
    updateComponentMaps();
  }, []);
  
  // Wrapper for register that triggers an update
  const registerPlugin = (plugin: Parameters<typeof ThPluginRegistry.register>[0]) => {
    ThPluginRegistry.register(plugin);
  };
  
  // Wrapper for unregister that triggers an update
  const unregisterPlugin = (pluginId: string) => {
    ThPluginRegistry.unregister(pluginId);
  };
  
  // Provide the component maps and plugin management functions
  const value = {
    ...componentMaps,
    registerPlugin,
    unregisterPlugin
  };
  
  return (
    <ThPluginContext.Provider value={ value }>
      { children }
    </ThPluginContext.Provider>
  );
};