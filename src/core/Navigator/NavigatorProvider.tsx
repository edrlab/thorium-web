import { createContext } from "react";
import { useEpubNavigator } from "../Hooks/Epub/useEpubNavigator";
import { useWebPubNavigator } from "../Hooks/WebPub/useWebPubNavigator";
import { useAudioNavigator } from "../Hooks/Audio/useAudioNavigator";
import { useReadAloudNavigator } from "../Hooks/ReadAloud/useReadAloudNavigator";

type VisualNavigator = ReturnType<typeof useEpubNavigator> | ReturnType<typeof useWebPubNavigator>;
type MediaNavigator = ReturnType<typeof useAudioNavigator>;
type ReadAloudNavigator = ReturnType<typeof useReadAloudNavigator>;

interface NavigatorContextValue {
  media?: MediaNavigator;
  visual?: VisualNavigator;
  readAloud?: ReadAloudNavigator;
}

export const NavigatorContext = createContext<NavigatorContextValue | null>(null);

export const NavigatorProvider = ({ 
  mediaNavigator, 
  visualNavigator, 
  readAloudNavigator, 
  children 
}: { 
  mediaNavigator?: MediaNavigator;
  visualNavigator?: VisualNavigator;
  readAloudNavigator?: ReadAloudNavigator;
  children: React.ReactNode 
}) => {
  return (
    <NavigatorContext.Provider value={{ media: mediaNavigator, visual: visualNavigator, readAloud: readAloudNavigator }}>
      { children }
    </NavigatorContext.Provider>
  );
};