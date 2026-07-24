import { ThProgressionFormat } from "@/preferences/models";
import { ProgressionDetails } from "@/core/Hooks/usePublicationProgress";

export const getSupportedProgressionFormats = (timeline?: ProgressionDetails): ThProgressionFormat[] => {
  if (!timeline) {
    return [ThProgressionFormat.none];
  }

  const {
    currentPositions = [],
    totalPositions,
    relativeProgression,
    totalProgression,
    currentIndex,
    totalItems,
    positionsLeft
  } = timeline;

  const supported: ThProgressionFormat[] = [ThProgressionFormat.none];

  if (currentPositions.length > 0) {
    supported.push(ThProgressionFormat.positions);
  }
  
  if (currentPositions.length > 0 && totalPositions) {
    supported.push(
      ThProgressionFormat.positionsOfTotal,
      ThProgressionFormat.positionsPercentOfTotal
    );
  }
  
  if (positionsLeft !== undefined) {
    supported.push(ThProgressionFormat.positionsLeft);
  }
  
  if (relativeProgression !== undefined) {
    supported.push(
      ThProgressionFormat.resourceProgression,
      ThProgressionFormat.progressionOfResource
    );
  }
  
  if (totalProgression !== undefined) {
    supported.push(ThProgressionFormat.overallProgression);
  }
  
  if (currentIndex !== undefined && totalItems !== undefined) {
    supported.push(ThProgressionFormat.readingOrderIndex);
  }

  return supported;
};

export const canRenderProgressionFormat = (
  format: ThProgressionFormat,
  supportedFormats: ThProgressionFormat[]
): boolean => {
  return supportedFormats.includes(format);
};

export const getBestMatchingProgressionFormat = (
  preferredFormats: ThProgressionFormat[],
  timeline?: ProgressionDetails
): ThProgressionFormat | null => {
  if (!timeline) {
    return null;
  }

  const supportedFormats = getSupportedProgressionFormats(timeline);
  
  // Find the first preferred format that's supported
  const firstSupported = preferredFormats.find(format => 
    canRenderProgressionFormat(format, supportedFormats)
  );
  
  return firstSupported || null;
};
