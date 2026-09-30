import styles from "./assets/styles/thorium-web.audioMetadata.module.css";

import { Publication } from "@readium/shared";
import { ThPublicationMetadata } from "@/core/Components/Audio/ThPublicationMetadata";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";

interface StatefulAudioMetadataProps {
  publication: Publication;
}

export function StatefulAudioMetadata({ publication }: StatefulAudioMetadataProps) {
  const { preferences } = useAudioPreferences();
  const { metadata } = publication;

  return (
    <ThPublicationMetadata
      className={ styles.audioMetadata }
      title={ metadata.title.getTranslation("en") }
      subtitle={ metadata.subtitle?.getTranslation("en") }
      authors={ metadata.authors?.items.map(a => a.name.getTranslation("en")) }
      order={ preferences.theming.layout.publicationMetadata.order }
      compounds={ {
        title: { className: styles.audioMetadataTitle },
        subtitle: { className: styles.audioMetadataSubtitle },
        authors: { className: styles.audioMetadataAuthors }
      } }
    />
  );
}
