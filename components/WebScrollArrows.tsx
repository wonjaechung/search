import React, { useRef, useEffect, useCallback } from "react";
import { View, ScrollView, Platform } from "react-native";

interface WebScrollArrowsProps {
  children: React.ReactNode;
  scrollAmount?: number;
  contentContainerStyle?: any;
  snapToInterval?: number;
  decelerationRate?: "fast" | "normal" | number;
  snapToAlignment?: "start" | "center" | "end";
}

export default function WebScrollArrows({
  children,
  contentContainerStyle,
  snapToInterval,
  decelerationRate,
  snapToAlignment,
}: WebScrollArrowsProps) {
  const containerRef = useRef<View>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasMoved = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const node = containerRef.current as any;
    if (!node) return;

    const el = node as unknown as HTMLElement;
    if (!el || !el.addEventListener) return;

    const scrollContainer = el.querySelector('[data-testid="web-drag-scroll"]') as HTMLElement;
    if (!scrollContainer) return;

    const innerScroll = scrollContainer.querySelector('[role="none"]') as HTMLElement
      || scrollContainer.firstElementChild as HTMLElement;

    const getScrollEl = (): HTMLElement | null => {
      let target: HTMLElement | null = scrollContainer;
      while (target) {
        if (target.scrollWidth > target.clientWidth) return target;
        target = target.firstElementChild as HTMLElement;
      }
      return scrollContainer;
    };

    const onMouseDown = (e: MouseEvent) => {
      const scrollEl = getScrollEl();
      if (!scrollEl) return;
      isDragging.current = true;
      hasMoved.current = false;
      startX.current = e.clientX;
      scrollStart.current = scrollEl.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const diff = e.clientX - startX.current;
      if (Math.abs(diff) > 3) hasMoved.current = true;
      const scrollEl = getScrollEl();
      if (scrollEl) {
        scrollEl.scrollLeft = scrollStart.current - diff;
      }
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      el.style.cursor = "grab";
      el.style.userSelect = "";

      if (hasMoved.current && snapToInterval) {
        const scrollEl = getScrollEl();
        if (scrollEl) {
          const snapped = Math.round(scrollEl.scrollLeft / snapToInterval) * snapToInterval;
          scrollEl.scrollTo({ left: snapped, behavior: "smooth" });
        }
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      if (hasMoved.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.style.cursor = "grab";

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, [snapToInterval]);

  if (Platform.OS !== "web") {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        snapToInterval={snapToInterval}
        decelerationRate={decelerationRate}
        snapToAlignment={snapToAlignment}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View ref={containerRef}>
      <ScrollView
        testID="web-drag-scroll"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        snapToInterval={snapToInterval}
        decelerationRate={decelerationRate}
        snapToAlignment={snapToAlignment}
      >
        {children}
      </ScrollView>
    </View>
  );
}
