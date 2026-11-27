"use client";

import { useState } from "react";

export const usePrevious = <T>(value: T): T | null => {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<T | null>(null);

  if (current !== value) {
    setCurrent(value);
    setPrevious(current);
  }

  return previous;
}
