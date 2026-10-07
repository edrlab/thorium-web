import { I18nValue, ThDocumentTitleFormat } from "@/preferences/models";
import { Progress } from "@/core/Hooks/usePublicationProgress";

export const resolveDocumentTitle = (
  format: I18nValue<ThDocumentTitleFormat> | undefined,
  progress: Progress | undefined,
  t: (key: string) => string
): string | undefined => {
  if (!format) return undefined;

  if (typeof format === "object" && "key" in format) {
    const translatedTitle = t(format.key);
    return translatedTitle !== format.key
      ? translatedTitle
      : format.fallback;
  }

  switch (format) {
    case ThDocumentTitleFormat.title:
      return progress?.title;
    case ThDocumentTitleFormat.chapter:
      return progress?.progression?.currentChapter;
    case ThDocumentTitleFormat.titleAndChapter:
      if (progress?.title && progress?.progression?.currentChapter) {
        return `${ progress.title } – ${ progress.progression.currentChapter }`;
      }
      return undefined;
    case ThDocumentTitleFormat.none:
      return undefined;
    default:
      return format;
  }
};
