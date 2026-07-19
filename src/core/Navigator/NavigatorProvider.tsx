import { createContext } from "react";
import { useEpubNavigator } from "../Hooks/Epub/useEpubNavigator";
import { useWebPubNavigator } from "../Hooks/WebPub/useWebPubNavigator";
import { useDivinaNavigator } from "../Hooks/Divina/useDivinaNavigator";
import { useAudioNavigator } from "../Hooks/Audio/useAudioNavigator";

type VisualNavigator = ReturnType<typeof useEpubNavigator> | ReturnType<typeof useWebPubNavigator> | ReturnType<typeof useDivinaNavigator>;
type MediaNavigator = ReturnType<typeof useAudioNavigator>;

interface NavigatorContextValue {
  media?: MediaNavigator;
  visual?: VisualNavigator;
}

export const NavigatorContext = createContext<NavigatorContextValue | null>(null);

export const NavigatorProvider = ({ 
  mediaNavigator, 
  visualNavigator, 
  children 
}: { 
  mediaNavigator?: MediaNavigator;
  visualNavigator?: VisualNavigator;
  children: React.ReactNode 
}) => {
  return (
    <NavigatorContext.Provider value={{ media: mediaNavigator, visual: visualNavigator }}>
      { children }
    </NavigatorContext.Provider>
  );
};