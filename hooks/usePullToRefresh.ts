"use client";

import { useState, useRef, useCallback } from "react";

interface UsePullToRefreshReturn {
  pullDistance: number;
  pullState: "idle" | "pulling" | "refreshing";
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

export function usePullToRefresh(onRefresh: () => void): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const [pullState, setPullState] = useState<"idle" | "pulling" | "refreshing">("idle");
  const pullDistanceRef = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY <= 0) touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartY.current || pullState !== "idle") return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && window.scrollY <= 0) {
      const d = Math.min(diff * 0.35, 100);
      pullDistanceRef.current = d;
      setPullState("pulling");
      setPullDistance(d);
    }
  }, [pullState]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistanceRef.current >= 55) {
      setPullState("refreshing");
      setPullDistance(128);
      onRefresh();
    } else {
      setPullState("idle");
      setPullDistance(0);
    }
    pullDistanceRef.current = 0;
    touchStartY.current = 0;
  }, [onRefresh]);

  return {
    pullDistance,
    pullState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
