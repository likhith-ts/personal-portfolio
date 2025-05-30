"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import classNames from "classnames";
import styles from "./InfiniteScroller.module.scss";

interface ScrollerProps {
  children?: React.ReactNode;
  direction?: "row" | "column";
  className?: string;
  style?: React.CSSProperties;
  onItemClick?: (index: number) => void;
  autoScroll?: boolean;
  scrollSpeed?: number;
  pauseOnHover?: boolean;
  gap?: string;
}

const InfiniteScroller: React.FC<ScrollerProps> = ({
  children,
  direction = "row",
  className,
  style,
  onItemClick,
  autoScroll = true,
  scrollSpeed = 20000,
  pauseOnHover = true,
  gap,
  ...rest
}) => {
  const [isPaused, setIsPaused] = useState(!autoScroll);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dynamicDuration, setDynamicDuration] = useState(scrollSpeed);
  const manualScrollTimeout = useRef<NodeJS.Timeout>();
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isTouchDevice = useRef(false);

  // Check if content needs scrolling
  const checkScrollNeeded = useCallback(() => {
    if (contentRef.current) {
      const wrapper = contentRef.current;
      const content = wrapper.firstElementChild as HTMLElement;
      const container = wrapper.parentElement as HTMLElement;
      
      if (!content || !container) return true;

      const contentSize = direction === 'row' ? content.scrollWidth : content.scrollHeight;
      const containerSize = direction === 'row' ? container.clientWidth : container.clientHeight;
      
      return contentSize > containerSize;
    }
    return true;
  }, [direction]);

  // Update scroll needed state
  useEffect(() => {
    const updateScrollState = () => {
      const needsScrolling = checkScrollNeeded();
      setNeedsScroll(needsScrolling);
      setIsPaused(!autoScroll || !needsScrolling);
    };

    updateScrollState();

    // Add resize observer to check when content size changes
    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
      resizeObserver.observe(contentRef.current.parentElement as HTMLElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [autoScroll, checkScrollNeeded, children]);

  const handleManualScrollEnd = useCallback(() => {
    if (manualScrollTimeout.current) {
      clearTimeout(manualScrollTimeout.current);
    }
    manualScrollTimeout.current = setTimeout(() => {
      setIsManualScrolling(false);
      if (autoScroll && !isPaused) {
        // Reset scroll position smoothly
        if (contentRef.current) {
          const wrapper = contentRef.current;
          wrapper.style.transition = 'transform 0.5s ease';
          wrapper.style.transform = '';
          setTimeout(() => {
            wrapper.style.transition = '';
          }, 500);
        }
      }
    }, 150);
  }, [autoScroll, isPaused]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isTouchDevice.current = true;
    setIsManualScrolling(true);
    setIsPaused(true);
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    lastPosRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isManualScrolling || !contentRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastPosRef.current.x;
    const deltaY = touch.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: touch.clientX, y: touch.clientY };

    const wrapper = contentRef.current;
    const currentTransform = new DOMMatrix(getComputedStyle(wrapper).transform);
    const newX = currentTransform.e + (direction === 'row' ? deltaX : 0);
    const newY = currentTransform.f + (direction === 'column' ? deltaY : 0);
    
    wrapper.style.transform = `translate(${newX}px, ${newY}px)`;
    
    // Prevent default to stop page scrolling while swiping
    e.preventDefault();
  }, [isManualScrolling, direction]);

  const handleTouchEnd = useCallback(() => {
    setIsManualScrolling(false);
    if (autoScroll) {
      setIsPaused(false);
    }
    handleManualScrollEnd();
  }, [autoScroll, handleManualScrollEnd]);

  // Mouse event handlers - only active if not touch device
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isTouchDevice.current) return;
    setIsManualScrolling(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isTouchDevice.current || !isManualScrolling || !contentRef.current) return;

    const deltaX = e.clientX - lastPosRef.current.x;
    const deltaY = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };

    const wrapper = contentRef.current;
    const currentTransform = new DOMMatrix(getComputedStyle(wrapper).transform);
    const newX = currentTransform.e + (direction === 'row' ? deltaX : 0);
    const newY = currentTransform.f + (direction === 'column' ? deltaY : 0);
    
    wrapper.style.transform = `translate(${newX}px, ${newY}px)`;
  }, [isManualScrolling, direction]);

  // Reset touch device flag on mouse movement
  const handleMouseOver = useCallback(() => {
    isTouchDevice.current = false;
  }, []);

  // Clone children with key and click handler
  const duplicateContent = React.useMemo(() => {
    return React.Children.map(children, (child, index) => (
      <div 
        key={`item-${index}`} 
        className={styles.item}
        onClick={() => onItemClick?.(index)}
        role={onItemClick ? "button" : undefined}
        tabIndex={onItemClick ? 0 : undefined}
        style={{ gap }}
      >
        {child}
      </div>
    ));
  }, [children, onItemClick, gap]);

  // Calculate scroll duration based on content size
  useEffect(() => {
    if (contentRef.current && needsScroll) {
      const wrapper = contentRef.current;
      const content = wrapper.firstElementChild as HTMLElement;
      if (!content) return;

      const size = direction === 'row' 
        ? content.scrollWidth 
        : content.scrollHeight;

      const pixelsPerSecond = 50;
      const baseDuration = (size / pixelsPerSecond) * 1000;
      
      const calculatedDuration = Math.max(baseDuration, scrollSpeed);
      setDynamicDuration(calculatedDuration);
    }
  }, [children, direction, scrollSpeed, needsScroll]);

  function handleMouseUp(event: React.MouseEvent<HTMLDivElement>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div 
      className={classNames(
        styles.container, 
        styles[direction],
        { 
          [styles.manualScrolling]: isManualScrolling,
          [styles.noScroll]: !needsScroll
        },
        className
      )}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOver={handleMouseOver}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        ...style,
        height: direction === 'column' ? '100%' : 'auto',
        '--scroll-duration': `${dynamicDuration}ms`,
        cursor: needsScroll ? (isManualScrolling ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none' // Prevent browser touch handling
      } as React.CSSProperties}
      {...rest}
    >
      <div 
        className={classNames(styles.contentWrapper, {
          [styles.paused]: isPaused || !autoScroll || isManualScrolling || !needsScroll
        })}
        ref={contentRef}
      >
        <div className={styles.content}>
          {duplicateContent}
        </div>
        {needsScroll && (
          <>
            <div className={styles.content}>
              {duplicateContent}
            </div>
            <div className={styles.content}>
              {duplicateContent}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InfiniteScroller;
