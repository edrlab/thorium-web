"use client";

import { useEffect, useState } from "react";
import { Link } from "@readium/shared";
import {   
  Manifest, 
  Publication, 
  Fetcher, 
  HttpFetcher, 
  Layout, 
  ReadingProgression,
  Feature,
  Profile
} from "@readium/shared";
import { useAppDispatch } from "@/lib/hooks";
import {
  setRTL,
  setFXL,
  setScriptMode,
  setPositionsList,
  setHasDisplayTransformability,
} from "@/lib/publicationReducer";
import { getScriptMode } from "@readium/navigator";
import { setReaderProfile, ReaderProfile } from "@/lib/readerReducer";
import { serializePositions } from "@/helpers/serializePositions";
import { ErrorHandler, ProcessedError } from "@/helpers/errorHandler";

export interface UsePublicationOptions {
  url: string;
  onError?: (error: ProcessedError) => void;
  fetcher?: Fetcher;
}

export interface UsePublicationReturn {
  // Loading states
  isLoading: boolean;
  error: ProcessedError | null;

  // Publication data
  publication: Publication | null;
  manifest: object | null;
  selfLink: string | null;
  localDataKey: string | null;

  // Profile detection
  profile: ReaderProfile | null;

  // Publication metadata
  isRTL: boolean;
  isFXL: boolean;
  hasDisplayTransformability: boolean;
}

const detectProfile = (manifest: Manifest): ReaderProfile => {
  // Check conformsTo in manifest metadata to determine profile
  const metadata = manifest.metadata;
  if (!metadata) return "webPub"; // Default to webPub when no metadata
  
  const conformsTo = metadata.conformsTo;
  if (!conformsTo) return "webPub"; // Default to webPub when no conformsTo
  
  // Handle both string and array formats
  const profiles = Array.isArray(conformsTo) ? conformsTo : [conformsTo];
  
  // Check for audiobook profile first
  if (profiles.some((profile: Profile) => 
    profile === Profile.AUDIOBOOK
  )) {
    return "audio";
  }
  
  // Check for epub profile
  if (profiles.some((profile: Profile) => 
    profile === Profile.EPUB
  )) {
    return "epub";
  }
  
  // Default to webPub for any other profile or no specific profile
  return "webPub";
};

export const usePublication = ({
  url,
  onError = () => {},
  fetcher: customFetcher
}: UsePublicationOptions): UsePublicationReturn => {
  const dispatch = useAppDispatch();

  // Basic states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ProcessedError | null>(null);
  const [manifest, setManifest] = useState<object | null>(null);
  const [selfLink, setSelfLink] = useState<string | null>(null);
  const [localDataKey, setLocalDataKey] = useState<string | null>(null);

  // Publication states
  const [publication, setPublication] = useState<Publication | null>(null);
  const [profile, setProfile] = useState<ReaderProfile | null>(null);

  // Metadata states
  const [isRTL, setIsRTL] = useState(false);
  const [isFXL, setIsFXL] = useState(false);
  const [hasDisplayTransformability, setHasDisplayTransformabilityState] = useState(false);

  const handleManifestError = (error: unknown, context: string) => {
    console.error(`${ context }:`, error);
    const processedError = ErrorHandler.process(error, context);
    setError(processedError);
    setIsLoading(false);
  };

  // Basic URL validation and loading
  useEffect(() => {
    if (!url) {
      const validationError = ErrorHandler.process(new Error('Manifest URL is required'), 'Validation');
      setError(validationError);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Decode URL if needed
    const decodedUrl = decodeURIComponent(url);
    
    const manifestLink = new Link({ href: decodedUrl });
    const fetcher = customFetcher || new HttpFetcher(undefined);

    try {
      const fetched = fetcher.get(manifestLink);
      
      // Get self-link first
      fetched.link().then(async (link) => {
        try {
          const selfHref = link.toURL(decodedUrl);
          setSelfLink(selfHref || null);
          if (selfHref) {
            setLocalDataKey(`${ selfHref }-current-location`);
            
            // Create fetcher with selfHref for proper URL resolution
            const manifestFetcher = customFetcher || new HttpFetcher(undefined, selfHref);
            
            // Fetch manifest with proper fetcher
            const manifestFetched = manifestFetcher.get(manifestLink);
            const manifestData = await manifestFetched.readAsJSON();
            
            setManifest(manifestData as object);
            
            // Create publication
            const manifestObj = Manifest.deserialize(manifestData)!;
            manifestObj.setSelfLink(selfHref);

            // Detect profile from parsed manifest
            const detectedProfile = detectProfile(manifestObj);
            setProfile(detectedProfile);
            dispatch(setReaderProfile(detectedProfile));

            const pub = new Publication({
              manifest: manifestObj,
              fetcher: manifestFetcher
            });
            
            // For EPUB, fetch positions before mounting reader
            if (detectedProfile === "epub") {
              try {
                const rawPositions = await pub.positionsFromManifest();
                const positionsList = serializePositions(rawPositions);
                dispatch(setPositionsList(positionsList ?? []));
              } catch (error) {
                console.error("Failed to fetch positions:", error);
                dispatch(setPositionsList([]));
              }
            }

            setPublication(pub);
            setIsLoading(false);
          }
        } catch (error: unknown) {
          handleManifestError(error, "Error loading manifest");
        }
      });
    } catch (error: unknown) {
      handleManifestError(error, "Error loading manifest");
    }
  }, [url, customFetcher, dispatch]);

  // Process publication metadata when publication is ready
  useEffect(() => {
    if (!publication) return;

    // Script mode and RTL detection
    const mode = getScriptMode(publication.metadata);
    dispatch(setScriptMode(mode));
    const rtl = publication.metadata.effectiveReadingProgression === ReadingProgression.rtl;
    setIsRTL(rtl);
    dispatch(setRTL(rtl));

    // FXL detection (only relevant for epub)
    if (profile === "epub") {
      const fxl = publication.metadata.effectiveLayout === Layout.fixed;
      setIsFXL(fxl);
      dispatch(setFXL(fxl));
    }

    // Display transformability
    const displayTransformability = publication.metadata.accessibility?.feature?.some(
      feature => feature && feature.value === Feature.DISPLAY_TRANSFORMABILITY.value
    ) || false;
    setHasDisplayTransformabilityState(displayTransformability);
    dispatch(setHasDisplayTransformability(displayTransformability));

    // Positions list (only for epub)
    if (profile === "epub" && publication) {
      const fetchPositions = async () => {
        try {
          const positionsList = await publication.positionsFromManifest();
          const deserializedPositionsList = serializePositions(positionsList);
          dispatch(setPositionsList(deserializedPositionsList ?? []));
        } catch (error) {
          console.error("Failed to fetch positions:", error);
          dispatch(setPositionsList([]));
        }
      };

      fetchPositions();
    }
  }, [publication, profile, dispatch]);

  // Call onError callback when error changes
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  return {
    isLoading,
    error,
    publication,
    manifest,
    selfLink,
    localDataKey,
    profile,
    isRTL,
    isFXL,
    hasDisplayTransformability
  };
};
