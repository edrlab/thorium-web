"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ErrorDisplay } from "@/components/Misc";
import { usePublication } from "@/hooks/usePublication";
import { useAppSelector } from "@/lib/hooks";
import { verifyManifestUrl } from "@/app/api/verify-manifest/verifyDomain";
import { ErrorHandler, ProcessedError } from "@/helpers/errorHandler";

// Publication only exists client-side, so keep the reader out of the server bundle
const StatefulReaderWrapper = dynamic(
  () => import("@/components/Reader/StatefulReaderWrapper").then(mod => mod.StatefulReaderWrapper),
  { ssr: false }
);

type Params = { manifest: string };

type Props = {
  params: Promise<Params>;
};

export default function ManifestPage({ params }: Props) {
  const [domainError, setDomainError] = useState<ProcessedError | null>(null);
  const isLoading = useAppSelector(state => state.reader.isLoading);
  const manifestUrl = use(params).manifest;

  useEffect(() => {
    if (manifestUrl) {
      verifyManifestUrl(manifestUrl).then(allowed => {
        if (!allowed) {
          const processedDomainError = ErrorHandler.process(
            new Error("Domain not allowed"), 
            "Domain Validation"
          );
          setDomainError(processedDomainError);
        }
      });
    }
  }, [manifestUrl]);

  const { 
    isLoading: publicationLoading, 
    error, 
    publication, 
    profile,
    localDataKey
  } = usePublication({
    url: manifestUrl,
    onError: (error) => {
      console.error("Manifest loading error:", error);
    }
  });

  if (domainError) {
    return (
      <ErrorDisplay 
        error={ domainError }
      />
    );
  }

  return (
    <>
      { error ? (
        <ErrorDisplay error={ error } />
      ) : publication ? (
        <StatefulReaderWrapper
          profile={ profile }
          publication={ publication }
          localDataKey={ localDataKey }
          isLoading={ isLoading || publicationLoading }
        />
      ) : null }
    </>
  );
}
