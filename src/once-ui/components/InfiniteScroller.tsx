"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import classNames from "classnames";
import styles from "./InfiniteScroller.module.scss";
import { Flex } from ".";
import { SpacingToken } from "../types";

type BaseProps = Omit<React.ComponentProps<typeof Flex>, 'gap' | 'direction'>;

interface InfiniteScrollerProps extends BaseProps {
  direction?: "row" | "column";
  onItemClick?: (index: number) => void;
  autoScroll?: boolean;
  scrollSpeed?: number;
  pauseOnHover?: boolean;
  gap?: SpacingToken | "-1";
  /**
   * Friction coefficient for momentum scrolling (0-1)
   * Lower values mean more friction/faster stop
   * @default 0.95
   */
  momentumFriction?: number;
  /**
   * Minimum velocity (px/ms) required to trigger momentum scrolling
   * @default 0.1
   */
  minMomentumVelocity?: number;
  /**
   * Time in ms before auto-scroll resumes after manual interaction
   * @default 5000
   */
  autoScrollResumeDelay?: number;
}

interface Point2D {
  x: number;
  y: number;
}

interface ScrollVelocity {
  x: number;
  y: number;
}

interface TouchState {
  x: number;
  y: number;
  timestamp: number;
}

interface ScrollRefs {
  contentRef: React.RefObject<HTMLDivElement>;
  manualScrollTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  lastPosRef: React.MutableRefObject<Point2D>;
  interactionTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  autoScrollResumeTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>;
  startPosRef: React.MutableRefObject<Point2D>;
  touchStartTimeRef: React.MutableRefObject<number>;
  isTouchDevice: React.MutableRefObject<boolean>;
  interactionIntent: React.MutableRefObject<'tap' | 'scroll' | null>;
  velocityRef: React.MutableRefObject<ScrollVelocity>;
  lastTimeRef: React.MutableRefObject<number>;
  momentumRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
}

interface ScrollState {
  isPaused: boolean;
  needsScroll: boolean;
  isManualScrolling: boolean;
  interactionMode: 'auto' | 'manual';
}

interface UseScrollState {
  state: ScrollState;
  setIsPaused: (paused: boolean) => void;
  setNeedsScroll: (needs: boolean) => void;
  setIsManualScrolling: (manual: boolean) => void;
  setInteractionMode: (mode: 'auto' | 'manual') => void;
}

function useScrollState(autoScroll: boolean): UseScrollState {
  const [state, setState] = useState<ScrollState>({
    isPaused: !autoScroll,
    needsScroll: true,
    isManualScrolling: false,
    interactionMode: 'auto'
  });

  const setIsPaused = useCallback((paused: boolean) => {
    setState(prev => ({ ...prev, isPaused: paused }));
  }, []);

  const setNeedsScroll = useCallback((needs: boolean) => {
    setState(prev => ({ ...prev, needsScroll: needs }));
  }, []);

  const setIsManualScrolling = useCallback((manual: boolean) => {
    setState(prev => ({ ...prev, isManualScrolling: manual }));
  }, []);

  const setInteractionMode = useCallback((mode: 'auto' | 'manual') => {
    setState(prev => ({ ...prev, interactionMode: mode }));
  }, []);

  return {
    state,
    setIsPaused,
    setNeedsScroll,
    setIsManualScrolling,
    setInteractionMode
  };
}

function useScrollRefs(): ScrollRefs {
  const contentRef = useRef<HTMLDivElement>(null);
  const manualScrollTimeout = useRef<NodeJS.Timeout>();
  const lastPosRef = useRef<Point2D>({ x: 0, y: 0 });
  const interactionTimeout = useRef<NodeJS.Timeout>();
  const autoScrollResumeTimeout = useRef<NodeJS.Timeout>();
  const startPosRef = useRef<Point2D>({ x: 0, y: 0 });
  const touchStartTimeRef = useRef<number>(0);
  const isTouchDevice = useRef(false);
  const interactionIntent = useRef<'tap' | 'scroll' | null>(null);
  const velocityRef = useRef<ScrollVelocity>({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const momentumRef = useRef<NodeJS.Timeout>();

  return {
    contentRef,
    manualScrollTimeout,
    lastPosRef,
    interactionTimeout,
    autoScrollResumeTimeout,
    startPosRef,
    touchStartTimeRef,
    isTouchDevice,
    interactionIntent,
    velocityRef,
    lastTimeRef,
    momentumRef
  };
}

const InfiniteScroller: React.FC<InfiniteScrollerProps> = ({
  children,
  direction = "row",
  className,
  style,
  onItemClick,
  autoScroll = true,
  scrollSpeed = 20000,
  pauseOnHover = true,
  gap,
  momentumFriction = 0.92,
  minMomentumVelocity = 0.05,
  autoScrollResumeDelay = 5000,
  ...rest
}) => {
  const { state, setIsPaused, setNeedsScroll, setIsManualScrolling, setInteractionMode } = useScrollState(autoScroll);
  const refs = useScrollRefs();
  const [dynamicDuration] = useState(scrollSpeed);

  // Function to temporarily enable manual interaction mode
  const enableManualMode = useCallback(() => {
    if (refs.autoScrollResumeTimeout.current) {
      clearTimeout(refs.autoScrollResumeTimeout.current);
    }
    setInteractionMode('manual');
    setIsPaused(true);
    setIsManualScrolling(true);
    
    if (autoScroll) {
      refs.autoScrollResumeTimeout.current = setTimeout(() => {
        setInteractionMode('auto');
        setIsPaused(false);
        setIsManualScrolling(false);
      }, autoScrollResumeDelay);
    }
  }, [autoScroll, autoScrollResumeDelay, setInteractionMode, setIsManualScrolling, setIsPaused]);

  // Check if content needs scrolling
  const checkScrollNeeded = useCallback(() => {
    if (refs.contentRef.current) {
      const wrapper = refs.contentRef.current;
      const content = wrapper.firstElementChild as HTMLElement;
      const container = wrapper.parentElement as HTMLElement;
      
      if (!content || !container) return true;

      const contentSize = direction === 'row' ? content.scrollWidth : content.scrollHeight;
      const containerSize = direction === 'row' ? container.clientWidth : container.clientHeight;
      
      return contentSize > containerSize;
    }
    return true;
  }, [direction, refs.contentRef]);
  // Memoized function to update scroll state
  const updateScrollState = useCallback(() => {
    if (!refs.contentRef.current) return;
    
    const needsScrolling = checkScrollNeeded();
    const shouldBePaused = !autoScroll || !needsScrolling;

    setNeedsScroll(needsScrolling);
    if (!state.isManualScrolling) {
      setIsPaused(shouldBePaused);
    }
  }, [autoScroll, checkScrollNeeded, setIsPaused, setNeedsScroll, state.isManualScrolling]);

  // Update scroll needed state
  useEffect(() => {
    // Memoize the update function to avoid recreating it on every render
    const handleResize = () => {
      updateScrollState();
    };

    // Add resize observer to check when content size changes
    const resizeObserver = new ResizeObserver(handleResize);
    const currentContent = refs.contentRef.current;
    const parentElement = currentContent?.parentElement;

    if (currentContent && parentElement) {
      resizeObserver.observe(currentContent);
      resizeObserver.observe(parentElement);
      // Initial check
      handleResize();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);
  const handleManualScrollEnd = useCallback(() => {
    if (refs.manualScrollTimeout.current) {
      clearTimeout(refs.manualScrollTimeout.current);
    }
    
    const resetScrollPosition = () => {
      if (!refs.contentRef.current) return;
      const wrapper = refs.contentRef.current;
      wrapper.style.transition = 'transform 0.5s ease';
      wrapper.style.transform = '';
      setTimeout(() => {
        wrapper.style.transition = '';
      }, 500);
    };

    refs.manualScrollTimeout.current = setTimeout(() => {
      setIsManualScrolling(false);
      if (autoScroll && !state.isPaused) {
        resetScrollPosition();
      }
    }, 150);
  }, [autoScroll, state.isPaused, refs.contentRef]);  // Track if the user is attempting to tap/click vs scroll
  const interactionIntent = useRef<'tap' | 'scroll' | null>(null);
  const interactionTimeout = useRef<NodeJS.Timeout>();
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const momentumRef = useRef<NodeJS.Timeout>();

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    const currentTime = Date.now();
    
    const touchState: TouchState = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: currentTime
    };

    refs.isTouchDevice.current = true;
    refs.startPosRef.current = { x: touchState.x, y: touchState.y };
    refs.lastPosRef.current = { x: touchState.x, y: touchState.y };
    refs.touchStartTimeRef.current = touchState.timestamp;
    lastTimeRef.current = touchState.timestamp;
    velocityRef.current = { x: 0, y: 0 };

    // Clear any ongoing momentum scrolling
    if (momentumRef.current) {
      clearTimeout(momentumRef.current);
    }

    // Reset interaction state
    interactionIntent.current = null;
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }
    
    // Quick tap detection (100ms is more responsive than 200ms)
    interactionTimeout.current = setTimeout(() => {
      if (!interactionIntent.current) {
        interactionIntent.current = 'tap';
        setIsPaused(true);
      }
    }, 100);
  }, [setIsPaused]);  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!refs.contentRef.current) return;
    
    const touch = e.touches[0];
    const currentTime = Date.now();
    const deltaTime = Math.max(currentTime - lastTimeRef.current, 1); // Prevent division by zero
    const deltaX = touch.clientX - refs.lastPosRef.current.x;
    const deltaY = touch.clientY - refs.lastPosRef.current.y;
    const totalDeltaX = touch.clientX - refs.startPosRef.current.x;
    const totalDeltaY = touch.clientY - refs.startPosRef.current.y;
    
    // Update velocity with easing for smoother transitions
    const velocityFactor = 0.8; // Smoothing factor
    const currentVelocity = {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime
    };
    velocityRef.current = {
      x: velocityRef.current.x * (1 - velocityFactor) + currentVelocity.x * velocityFactor,
      y: velocityRef.current.y * (1 - velocityFactor) + currentVelocity.y * velocityFactor
    };
      // If we haven't determined the interaction type yet
    if (!interactionIntent.current) {
      const movement = Math.abs(direction === 'row' ? totalDeltaX : totalDeltaY);
      const crossAxisMovement = Math.abs(direction === 'row' ? totalDeltaY : totalDeltaX);
      
      // Improved gesture detection with better threshold
      if ((movement > 8 && movement > crossAxisMovement * 1.2) || movement > 15) {      interactionIntent.current = 'scroll';
        enableManualMode();
        if (interactionTimeout.current) {
          clearTimeout(interactionTimeout.current);
        }
        if (refs.contentRef.current) {
          refs.contentRef.current.style.transition = 'none';
        }
      }
    }

    // Only handle scroll if we've determined this is a scroll interaction
    if (interactionIntent.current === 'scroll') {
      e.preventDefault(); // Prevent page scrolling
      refs.lastPosRef.current = { x: touch.clientX, y: touch.clientY };

      const wrapper = refs.contentRef.current;
      const currentTransform = new DOMMatrix(getComputedStyle(wrapper).transform);
      const newX = currentTransform.e + (direction === 'row' ? deltaX : 0);
      const newY = currentTransform.f + (direction === 'column' ? deltaY : 0);
      
      wrapper.style.transform = `translate(${newX}px, ${newY}px)`;
    }
  }, [direction, enableManualMode, refs.contentRef]);

  interface MomentumConfig {
    friction: number;
    minVelocity: number;
    velocityScale: number;
    frameTime: number;
    velocityFactor: number;
  }

  const defaultMomentumConfig: MomentumConfig = {
    friction: 0.92,
    minVelocity: 0.05,
    velocityScale: 60,
    frameTime: 16,
    velocityFactor: 0.8
  };

  const applyMomentum = useCallback((velocity: number, startPos: number) => {
    if (!refs.contentRef.current) return;

    const config = {
      ...defaultMomentumConfig,
      friction: momentumFriction,
      minVelocity: minMomentumVelocity,
      velocityScale: direction === 'row' ? 60 : 40,
    };

    let state = {
      velocity: velocity * config.velocityScale,
      position: startPos,
      timestamp: Date.now()
    };

    const animate = () => {
      if (!refs.contentRef.current) return;
      
      const now = Date.now();
      const deltaTime = now - state.timestamp;
      state.timestamp = now;
      
      // Apply friction with delta time normalization
      state.velocity *= Math.pow(config.friction, deltaTime / config.frameTime);
      state.position += state.velocity * deltaTime;
      
      // Apply transform with hardware acceleration
      const transform = direction === 'row'
        ? `translate3d(${state.position}px, 0, 0)`
        : `translate3d(0, ${state.position}px, 0)`;
      
      refs.contentRef.current.style.transform = transform;
      
      if (Math.abs(state.velocity) > config.minVelocity) {
        requestAnimationFrame(animate);
      } else {
        handleManualScrollEnd();
      }
    };
    
    requestAnimationFrame(animate);
  }, [direction, handleManualScrollEnd, momentumFriction, minMomentumVelocity, refs.contentRef]);  const handleTouchEnd = useCallback(() => {
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }

    const handleReset = () => {
      setIsPaused(false);
      setIsManualScrolling(false);
      interactionIntent.current = null;
      velocityRef.current = { x: 0, y: 0 };
      if (momentumRef.current) {
        clearTimeout(momentumRef.current);
      }
      if (refs.contentRef.current) {
        refs.contentRef.current.style.transition = '';
      }
    };

    // If this was a tap attempt or we never determined the intent
    if (!interactionIntent.current || interactionIntent.current === 'tap') {
      handleReset();
      return;
    }

    // Handle scroll end
    setIsManualScrolling(false);
    
    // Get final velocity and position
    const finalVelocity = direction === 'row' 
      ? velocityRef.current.x * 100 // Scale up for more noticeable momentum
      : velocityRef.current.y * 100;
      
    const currentTransform = refs.contentRef.current 
      ? new DOMMatrix(getComputedStyle(refs.contentRef.current).transform)
      : new DOMMatrix();
      
    const currentPos = direction === 'row' ? currentTransform.e : currentTransform.f;      // Enhanced momentum scrolling with better velocity thresholds
    const significantVelocity = 0.08; // Lower threshold for more responsive momentum
    if (Math.abs(finalVelocity) > significantVelocity) {
      applyMomentum(finalVelocity, currentPos);
      // Resume auto-scroll after momentum finishes with dynamic delay
      const momentumDuration = Math.min(2000, Math.abs(finalVelocity) * 3000);
      setTimeout(() => {
        if (autoScroll) {
          setIsPaused(false);
        }
      }, momentumDuration);
    } else {
      handleManualScrollEnd();
      // Quick resume for non-momentum stops
      setTimeout(() => {
        if (autoScroll) {
          setIsPaused(false);
        }
      }, 500);
    }

    // Reset state
    velocityRef.current = { x: 0, y: 0 };
    interactionIntent.current = null;

    handleManualScrollEnd();
  }, [direction, autoScroll, handleManualScrollEnd, refs.contentRef]);
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (refs.isTouchDevice.current) return;
    enableManualMode();
    refs.startPosRef.current = { x: e.clientX, y: e.clientY };
    refs.lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [enableManualMode, refs]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (refs.isTouchDevice.current || !state.isManualScrolling || !refs.contentRef.current) return;

    const deltaX = e.clientX - refs.lastPosRef.current.x;
    const deltaY = e.clientY - refs.lastPosRef.current.y;
    refs.lastPosRef.current = { x: e.clientX, y: e.clientY };

    const wrapper = refs.contentRef.current;
    const currentTransform = new DOMMatrix(getComputedStyle(wrapper).transform);
    const newX = currentTransform.e + (direction === 'row' ? deltaX : 0);
    const newY = currentTransform.f + (direction === 'column' ? deltaY : 0);
    
    wrapper.style.transform = `translate(${newX}px, ${newY}px)`;
  }, [state.isManualScrolling, direction, refs.contentRef]);

  const handleMouseUp = useCallback(() => {
    if (refs.isTouchDevice.current) return;
    setIsManualScrolling(false);
    handleManualScrollEnd();
  }, [handleManualScrollEnd]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover && autoScroll && !refs.isTouchDevice.current) {
      setIsPaused(true);
    }
  }, [pauseOnHover, autoScroll, refs.isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover && autoScroll && !state.isManualScrolling && !refs.isTouchDevice.current) {
      setIsPaused(false);
      handleManualScrollEnd();
    }
  }, [pauseOnHover, autoScroll, state.isManualScrolling, handleManualScrollEnd, refs.isTouchDevice]);

  // Clone children with key and click handler
  const duplicateContent = React.useMemo(() => {    return React.Children.map(children, (child, index) => (
      <div 
        key={`item-${index}`} 
        className={styles.item}
        onClick={() => onItemClick?.(index)}
        tabIndex={onItemClick ? 0 : undefined}
        style={{ gap }}
      >
        {child}
      </div>
    ));
  }, [children, onItemClick, gap]);
  return (
    <div
      className={classNames(
        styles.container, 
        styles[direction],
        { 
          [styles.manualScrolling]: state.isManualScrolling,
          [styles.noScroll]: !state.needsScroll
        },
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        ...style,
        height: direction === 'column' ? '100%' : 'auto',
        '--scroll-duration': `${dynamicDuration}ms`,
        cursor: state.needsScroll ? (state.isManualScrolling ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none' // Prevent browser touch handling
      } as React.CSSProperties}
      {...rest}
    >
      <div 
        className={classNames(styles.contentWrapper, {
          [styles.paused]: state.isPaused || !autoScroll || state.isManualScrolling || !state.needsScroll
        })}
        ref={refs.contentRef}
      >
        <div className={styles.content}>
          {duplicateContent}
        </div>
        {state.needsScroll && (
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
