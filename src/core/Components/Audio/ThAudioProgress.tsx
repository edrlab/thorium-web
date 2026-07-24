"use client";

import { useRef, useState, useEffect } from "react";

import {
  Slider,
  SliderProps,
  SliderThumb,
  SliderThumbProps,
  SliderTrack,
  SliderTrackProps
} from "react-aria-components";
import { useOverlayPosition, OverlayContainer, OverlayContainerProps, PositionProps, useObjectRef } from "react-aria";

import { WithRef } from "../customTypes";

export interface SeekableRange {
  start: number;
  end: number;
}

export interface TimelineSegment {
  title?: string;
  timestamp: number;
  percentage: number;
}

export interface ThAudioProgressProps {
  isDisabled?: boolean;
  currentTime: number;
  duration: number;
  playbackRate?: number;
  onSeek: (time: number) => void;
  currentChapter?: string;
  seekableRanges?: SeekableRange[];
  hoverLabel?: string;
  onHoverProgression?: (progression: number | null) => void;
  segments?: TimelineSegment[];
  compounds?: {
    wrapper?: React.HTMLAttributes<HTMLDivElement>;
    current?: React.HTMLAttributes<HTMLDivElement>;
    slider?: WithRef<SliderProps, HTMLDivElement>;
    track?: WithRef<SliderTrackProps, HTMLDivElement>;
    thumb?: WithRef<SliderThumbProps, HTMLDivElement>;
    elapsedTime?: React.HTMLAttributes<HTMLSpanElement>;
    remainingTime?: React.HTMLAttributes<HTMLSpanElement>;
    seekableRange?: React.HTMLAttributes<HTMLDivElement>;
    fragmentTick?: React.HTMLAttributes<HTMLDivElement>;
    tooltip?: WithRef<PositionProps & React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    overlayContainer?: OverlayContainerProps;
  };
}

export const ThAudioProgress = ({
  isDisabled,
  currentTime,
  duration,
  playbackRate = 1,
  onSeek,
  currentChapter,
  seekableRanges,
  hoverLabel,
  onHoverProgression,
  segments,
  compounds
}: ThAudioProgressProps) => {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useObjectRef(compounds?.tooltip?.ref);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const seekTargetRef = useRef<number | null>(null);

  // Clear drag state once the navigator's currentTime has caught up to the seek target
  useEffect(() => {
    if (seekTargetRef.current === null) return;
    if (Math.abs(currentTime - seekTargetRef.current) < 1) {
      seekTargetRef.current = null;
      setIsDragging(false);
    }
  }, [currentTime]);

  const overlayConfig = compounds?.tooltip || {};
  const placement = overlayConfig.placement || "top";
  const offset = overlayConfig.offset !== undefined ? overlayConfig.offset : 8;

  const { overlayProps, updatePosition } = useOverlayPosition({
    targetRef: anchorRef,
    overlayRef,
    placement,
    offset,
    isOpen
  });

  const displayTime = isDragging ? dragValue : currentTime;
  const defaultElapsedTime = formatTime(displayTime / playbackRate);
  const defaultRemainingTime = formatTime(Math.max(0, (duration - displayTime) / playbackRate));

  function formatTime(seconds: number) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0
      ? `${ hrs }:${ mins.toString().padStart(2, "0") }:${ secs.toString().padStart(2, "0") }`
      : `${ mins }:${ secs.toString().padStart(2, "0") }`;
  }

  const validSeekableRanges = duration > 0
    ? (seekableRanges ?? []).filter(r => r.end <= duration)
    : [];

  const handleTrackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const raw = (e.clientX - rect.left) / rect.width;
    const x = Math.max(0, Math.min(1, raw));
    if (anchorRef.current) {
      anchorRef.current.style.left = `${ x * 100 }%`;
      anchorRef.current.style.right = "";
      updatePosition();
    }
    if (!isOpen) setIsOpen(true);
    onHoverProgression?.(x);
  };

  const handleTrackMouseLeave = () => {
    setIsOpen(false);
    onHoverProgression?.(null);
  };

  const { onMouseMove, onMouseLeave, ...trackProps } = compounds?.track ?? {};

  return (
    <div { ...compounds?.wrapper }>
      { currentChapter && (
        <div { ...compounds?.current }>
          { currentChapter }
        </div>
      ) }
      <Slider
        value={ isDragging ? dragValue : currentTime }
        minValue={ 0 }
        maxValue={ duration || 0 }
        onChange={ (value) => {
          const v = Array.isArray(value) ? value[0] : value;
          setIsDragging(true);
          setDragValue(v);
        } }
        onChangeEnd={ (value) => {
          const v = Array.isArray(value) ? value[0] : value;
          seekTargetRef.current = v;
          onSeek(v);
        } }
        isDisabled={ !!isDisabled }
        { ...compounds?.slider }
      >
        <SliderTrack
          onMouseMove={ (e) => { handleTrackMouseMove(e); onMouseMove?.(e); } }
          onMouseLeave={ (e) => { handleTrackMouseLeave(); onMouseLeave?.(e); } }
          { ...trackProps }
        >
          { validSeekableRanges.map((range, i) => (
            <div
              key={ i }
              { ...compounds?.seekableRange }
              style={{
                left: `${ (range.start / duration) * 100 }%`,
                width: `${ ((range.end - range.start) / duration) * 100 }%`,
                ...compounds?.seekableRange?.style,
              }}
            />
          )) }
          { segments?.map((segment, i) => (
            <div
              key={ `segment-${ i }` }
              { ...compounds?.fragmentTick }
              style={{
                position: "absolute",
                left: `${ segment.percentage }%`,
                ...compounds?.fragmentTick?.style,
              }}
            />
          )) }
          <span
            ref={ anchorRef }
            style={{ position: "absolute", left: "0%", width: 0, height: "100%", top: 0 }}
            aria-hidden="true"
          />
          <SliderThumb { ...compounds?.thumb } />
        </SliderTrack>
      </Slider>
      { isOpen && hoverLabel && (
        <OverlayContainer { ...compounds?.overlayContainer }>
          <div
            ref={ overlayRef }
            { ...overlayConfig }
            style={{ ...overlayProps.style, ...overlayConfig.style }}
          >
            { hoverLabel }
          </div>
        </OverlayContainer>
      ) }
      <span { ...compounds?.elapsedTime } aria-hidden="true">{ defaultElapsedTime }</span>
      <span { ...compounds?.remainingTime } aria-hidden="true">{ defaultRemainingTime }</span>
    </div>
  );
};
