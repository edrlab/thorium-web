import { KeyboardEvent, RefObject, useCallback, useRef } from "react";

import { SheetRef } from "react-modal-sheet";

export interface UseBottomSheetSnapProps {
  sheetRef: RefObject<SheetRef | null>;
  snapArray: number[];
  onSnap?: (index: number) => void;
  /**
   * Called when moving down from the lowest snap point. Without it, the sheet stays at that point.
   */
  onClosePress?: () => void;
}

export const useBottomSheetSnap = ({
  sheetRef,
  snapArray,
  onSnap,
  onClosePress
}: UseBottomSheetSnapProps) => {
  const snapIdx = useRef<number | null>(null);

  const onSnapCallback = useCallback((index: number) => {
    snapIdx.current = index;
    onSnap?.(index);
  }, [onSnap]);

  const onDragPressCallback = useCallback(() => {
    if (snapIdx.current !== null) {
      // In [0, min, peek, max] order, cycle to next index but skip index 0
      const nextIdx = snapIdx.current === snapArray.length - 1 ? 1 : snapIdx.current + 1;
      sheetRef.current?.snapTo(nextIdx);
    }
  }, [sheetRef, snapArray]);

  const onDragKeyCallback = useCallback((e: KeyboardEvent) => {
    if (snapIdx.current !== null) {
      switch(e.code) {
        case "PageUp":
          if (snapIdx.current === snapArray.length - 1) return;
          sheetRef.current?.snapTo(snapArray.length - 1);
          break;
        case "ArrowUp":
          if (snapIdx.current === snapArray.length - 1) return;
          sheetRef.current?.snapTo(snapIdx.current + 1);
          break;
        case "PageDown":
          if (onClosePress) {
            onClosePress();
            break;
          }
          if (snapIdx.current === 1) return;
          sheetRef.current?.snapTo(1);
          break;
        case "ArrowDown":
          if (snapIdx.current === 1) {
            onClosePress?.();
            break;
          }
          sheetRef.current?.snapTo(snapIdx.current - 1)
          break;
        default:
          break;
      }
    }
  }, [sheetRef, snapArray, onClosePress]);

  return {
    onSnapCallback,
    onDragPressCallback,
    onDragKeyCallback
  };
};
