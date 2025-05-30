"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import classNames from "classnames";
import { Flex, IconButton } from ".";
import styles from "./ScrollerAuto.module.scss";
import { Fade } from "./Fade";

interface ScrollerProps extends React.ComponentProps<typeof Flex> {
  children?: React.ReactNode;
  direction?: "row" | "column";
  onItemClick?: (index: number) => void;
  autoScroll?: boolean;
  scrollSpeed?: number; // Time in milliseconds for one complete scroll
  pauseOnHover?: boolean;
}

interface ScrollableChildProps {
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const ScrollerAuto: React.FC<ScrollerProps> = ({
  children,
  direction = "row",
  className,
  style,
  onItemClick,
  autoScroll = true,
  scrollSpeed = 20000,
  pauseOnHover = true,
  ...rest
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showPrevButton, setShowPrevButton] = useState<boolean>(false);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const handleScroll = () => {
      if (scroller) {
        const scrollPosition = direction === "row" ? scroller.scrollLeft : scroller.scrollTop;
        const maxScrollPosition =
          direction === "row"
            ? scroller.scrollWidth - scroller.clientWidth
            : scroller.scrollHeight - scroller.clientHeight;
        setShowPrevButton(scrollPosition > 0);
        setShowNextButton(scrollPosition < maxScrollPosition - 1);
      }
    };

    if (
      scroller &&
      (direction === "row"
        ? scroller.scrollWidth > scroller.clientWidth
        : scroller.scrollHeight > scroller.clientHeight)
    ) {
      handleScroll();
      scroller.addEventListener("scroll", handleScroll);
      return () => scroller.removeEventListener("scroll", handleScroll);
    }
  }, [direction]);

  const handleScrollNext = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      const scrollAmount =
        direction === "row" ? scroller.clientWidth / 2 : scroller.clientHeight / 2;
      scroller.scrollBy({
        [direction === "row" ? "left" : "top"]: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScrollPrev = () => {
    const scroller = scrollerRef.current;
    if (scroller) {
      const scrollAmount =
        direction === "row" ? scroller.clientWidth / 2 : scroller.clientHeight / 2;
      scroller.scrollBy({
        [direction === "row" ? "left" : "top"]: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const wrappedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement<ScrollableChildProps>(child)) {
      const { onClick: childOnClick, onKeyDown: childOnKeyDown, ...otherProps } = child.props;

      return React.cloneElement(child, {
        ...otherProps,
        onClick: (e: React.MouseEvent) => {
          childOnClick?.(e);
          onItemClick?.(index);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          childOnKeyDown?.(e);
          if (e.key === "Enter" || e.key === " ") {
            childOnClick?.(e as any);
            onItemClick?.(index);
          }
        },
      });
    }
    return child;
  });
  const startAutoScroll = useCallback(() => {
    if (!autoScroll || isPaused) return;

    const frameRate = 60; // 60fps for smooth animation
    const interval = 1000 / frameRate; // Calculate interval based on frame rate
    const totalFrames = scrollSpeed / interval; // Total frames for complete scroll
    
    scrollIntervalRef.current = setInterval(() => {
      const scroller = scrollerRef.current;
      if (scroller) {
        const isRow = direction === "row";
        const currentScroll = isRow ? scroller.scrollLeft : scroller.scrollTop;
        const scrollSize = isRow ? scroller.scrollWidth : scroller.scrollHeight;
        const clientSize = isRow ? scroller.clientWidth : scroller.clientHeight;
        const stepSize = Math.max(1, Math.floor((scrollSize - clientSize) / totalFrames));

        // If we're near the end, jump back to start
        if (currentScroll >= scrollSize - clientSize - stepSize) {
          scroller.scrollTo({
            [isRow ? "left" : "top"]: 0,
            behavior: "auto",
          });
        } else {
          // Smooth scroll to next position with calculated step size
          scroller.scrollBy({
            [isRow ? "left" : "top"]: stepSize,
            behavior: "auto",
          });
        }
      }
    }, interval);
  }, [autoScroll, direction, isPaused]);

  const stopAutoScroll = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
      stopAutoScroll();
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
      startAutoScroll();
    }
  };

  // Start auto-scrolling on mount
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  // Restart auto-scroll when direction changes
  useEffect(() => {
    stopAutoScroll();
    startAutoScroll();
  }, [direction, startAutoScroll, stopAutoScroll]);

  return (
    <Flex
      fillWidth
      className={classNames(styles.container, className)}
      style={style}
      {...rest}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showPrevButton && (
        <Fade to="right" width={4} fillHeight position="absolute" left="0" zIndex={1}>
          <IconButton
            icon={direction === "row" ? "chevronLeft" : "chevronUp"}
            onClick={handleScrollPrev}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleScrollPrev();
              }
            }}
            size="s"
            variant="secondary"
            className={classNames(styles.scrollButton, styles.scrollButtonPrev)}
            aria-label="Scroll Previous"
          />
        </Fade>
      )}      <Flex
        fillWidth
        zIndex={0}
        radius="m"
        direction={direction}
        className={classNames(styles.scroller, styles[direction])}
        ref={scrollerRef}
        style={{
          ...style,
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 'inherit'
        }}
      >
        {wrappedChildren}
        {wrappedChildren}
      </Flex>
      {showNextButton && (
        <Fade to="left" width={4} fillHeight position="absolute" right="0" zIndex={1}>
          <IconButton
            icon={direction === "row" ? "chevronRight" : "chevronDown"}
            onClick={handleScrollNext}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleScrollNext();
              }
            }}
            size="s"
            variant="secondary"
            className={classNames(styles.scrollButton, styles.scrollButtonNext)}
            aria-label="Scroll Next"
          />
        </Fade>
      )}
    </Flex>
  );
};

ScrollerAuto.displayName = "ScrollerAuto";

export { ScrollerAuto };
export type { ScrollerProps };
