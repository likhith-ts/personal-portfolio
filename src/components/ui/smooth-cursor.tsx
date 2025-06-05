"use client";

import { motion, useSpring } from "framer-motion";
import { FC, JSX, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

export interface SmoothCursorProps {
  cursor?: JSX.Element;
  enabled?: boolean;
  disableOnTouch?: boolean;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
    restDelta: number;
  };
}

const DefaultCursorSVG: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={50}
      height={54}
      viewBox="0 0 50 54"
      fill="none"
      style={{ scale: 0.5 }}
    >
      <g filter="url(#filter0_d_91_7928)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill="black"
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke="white"
          strokeWidth={2.25825}
        />
      </g>
      <defs>
        <filter
          id="filter0_d_91_7928"
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_91_7928"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_7928"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

// Link cursor - pointer with click effect
const LinkCursorSVG: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="rgba(59, 130, 246, 0.1)"
        stroke="#3B82F6"
        strokeWidth="2"
      />
      <circle
        cx="16"
        cy="16"
        r="4"
        fill="#3B82F6"
      />
    </svg>
  );
};

// Button cursor - rounded square with hover effect
const ButtonCursorSVG: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
    >
      <rect
        x="6"
        y="6"
        width="20"
        height="20"
        rx="6"
        fill="rgba(16, 185, 129, 0.1)"
        stroke="#10B981"
        strokeWidth="2"
      />
      <rect
        x="11"
        y="11"
        width="10"
        height="10"
        rx="2"
        fill="#10B981"
      />
    </svg>
  );
};

// Input/Form cursor - I-beam style
const InputCursorSVG: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
    >
      <rect
        x="14"
        y="4"
        width="4"
        height="24"
        rx="2"
        fill="#8B5CF6"
      />
      <rect
        x="10"
        y="4"
        width="12"
        height="3"
        rx="1.5"
        fill="#8B5CF6"
      />
      <rect
        x="10"
        y="25"
        width="12"
        height="3"
        rx="1.5"
        fill="#8B5CF6"
      />
    </svg>
  );
};

// Generic interactive cursor for other elements
const InteractiveCursorSVG: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="rgba(0, 0, 0, 0.1)"
        stroke="black"
        strokeWidth="2"
      />
      <circle
        cx="16"
        cy="16"
        r="4"
        fill="black"
      />
    </svg>
  );
};

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  enabled = true,
  disableOnTouch = true,
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  },
}: SmoothCursorProps) {
  const [isMoving, setIsMoving] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'link' | 'button' | 'input' | 'interactive'>('default');
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [shouldShowCursor, setShouldShowCursor] = useState(false);
  const [isMouseInViewport, setIsMouseInViewport] = useState(true);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });
  const velocity = useRef<Position>({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  });
  const scale = useSpring(1, {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  });

  useEffect(() => {
    // Detect touch device
    const detectTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    const touchDevice = detectTouchDevice();
    setIsTouchDevice(touchDevice);

    // Determine if cursor should be shown
    const shouldShow = enabled && !(disableOnTouch && touchDevice);
    setShouldShowCursor(shouldShow);

    // Early return if cursor should not be shown
    if (!shouldShow) {
      return;
    }

    const updateVelocity = (currentPos: Position) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        };
      }

      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
    };

    // Function to determine cursor type based on element
    const getCursorType = (element: Element | null): 'default' | 'link' | 'button' | 'input' | 'interactive' => {
      if (!element) return 'default';
      
      // Check for links
      if (element.matches('a, [href]') || element.closest('a, [href]')) {
        return 'link';
      }
      
      // Check for buttons
      if (element.matches('button, [role="button"], .cursor-pointer') || 
          element.closest('button, [role="button"], .cursor-pointer')) {
        return 'button';
      }
      
      // Check for form inputs
      if (element.matches('input, textarea, select, [contenteditable="true"]') || 
          element.closest('input, textarea, select, [contenteditable="true"]')) {
        return 'input';
      }
      
      // Check for other interactive elements
      const interactiveSelectors = [
        '[role="link"]', '[role="menuitem"]', '[tabindex]', 
        '[onclick]', '[onmousedown]', '[onmouseup]'
      ];
      
      const isInteractive = interactiveSelectors.some(selector => {
        try {
          return element.matches(selector) || element.closest(selector);
        } catch {
          return false;
        }
      });
      
      return isInteractive ? 'interactive' : 'default';
    };

    const smoothMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY };
      updateVelocity(currentPos);

      // Check cursor type based on element under cursor
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      const newCursorType = getCursorType(elementUnderCursor);
      
      setCursorType(newCursorType);

      const speed = Math.sqrt(
        Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2),
      );

      cursorX.set(currentPos.x);
      cursorY.set(currentPos.y);

      if (speed > 0.1 && newCursorType === 'default') {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) +
          90;

        let angleDiff = currentAngle - previousAngle.current;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        accumulatedRotation.current += angleDiff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = currentAngle;

        scale.set(0.95);
        setIsMoving(true);

        const timeout = setTimeout(() => {
          scale.set(1);
          setIsMoving(false);
        }, 150);

        return () => clearTimeout(timeout);
      } else if (newCursorType !== 'default') {
        // Reset rotation for interactive elements
        rotation.set(0);
        
        // Set different scales based on cursor type
        switch (newCursorType) {
          case 'link':
            scale.set(1.1);
            break;
          case 'button':
            scale.set(1.2);
            break;
          case 'input':
            scale.set(1.0);
            break;
          default:
            scale.set(1.1);
        }
      } else {
        scale.set(1);
      }
    };

    let rafId: number;
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e);
        rafId = 0;
      });
    };

    // Set cursor to none globally and add CSS for interactive elements
    const style = document.createElement('style');
    style.textContent = `
      * {
        cursor: none !important;
      }
      a, button, input, textarea, select, [role="button"], [role="link"], 
      [tabindex], [onclick], .cursor-pointer, [href] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    // Click effect handlers
    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      scale.set(cursorType !== 'default' ? 0.8 : 0.7);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsClicking(false);
      // Reset scale based on cursor type
      switch (cursorType) {
        case 'link':
          scale.set(1.1);
          break;
        case 'button':
          scale.set(1.2);
          break;
        case 'input':
          scale.set(1.0);
          break;
        case 'interactive':
          scale.set(1.1);
          break;
        default:
          scale.set(1);
      }
    };

    // Touch event handlers to hide cursor on touch
    const handleTouchStart = () => {
      if (disableOnTouch) {
        setShouldShowCursor(false);
      }
    };

    // Handle mouse movement with viewport detection
    const handleMouseMove = (e: MouseEvent) => {
      if (enabled && !(disableOnTouch && isTouchDevice)) {
        // Always show cursor on mouse movement
        setIsMouseInViewport(true);
        if (!shouldShowCursor) {
          setShouldShowCursor(true);
        }
        throttledMouseMove(e);
      }
    };

    // The most reliable method: Use both mouseleave on html element and coordinate checking
    const handleDocumentMouseLeave = (e: MouseEvent) => {
      // Check if mouse is truly leaving the document
      const { clientX, clientY } = e;
      const isLeavingDocument = 
        clientX <= 0 || 
        clientX >= window.innerWidth || 
        clientY <= 0 || 
        clientY >= window.innerHeight ||
        !e.relatedTarget; // No related target means mouse left the document
      
      if (isLeavingDocument) {
        setIsMouseInViewport(false);
      }
    };

    // Handle mouse entering the document
    const handleDocumentMouseEnter = (e: MouseEvent) => {
      if (enabled && !(disableOnTouch && isTouchDevice)) {
        setIsMouseInViewport(true);
        setShouldShowCursor(true);
      }
    };

    // Handle when window loses focus
    const handleWindowBlur = () => {
      setIsMouseInViewport(false);
    };

    // Handle visibility change when tab becomes inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsMouseInViewport(false);
      }
    };

    // Ultimate fallback: Monitor if mouse is actually over the document
    const handleGlobalMouseOver = (e: MouseEvent) => {
      if (enabled && !(disableOnTouch && isTouchDevice)) {
        setIsMouseInViewport(true);
        if (!shouldShowCursor) {
          setShouldShowCursor(true);
        }
      }
    };

    const handleGlobalMouseOut = (e: MouseEvent) => {
      // Only hide if mouse is truly leaving the document
      if (!e.relatedTarget || e.relatedTarget === null) {
        setIsMouseInViewport(false);
      }
    };

    // Apply event listeners to document.documentElement (html tag) for better detection
    const htmlElement = document.documentElement;
    
    // Primary mouse movement detection
    document.addEventListener("mousemove", handleMouseMove);
    
    // Mouse leave/enter detection on html element
    htmlElement.addEventListener("mouseleave", handleDocumentMouseLeave);
    htmlElement.addEventListener("mouseenter", handleDocumentMouseEnter);
    
    // Global mouse over/out as fallback
    document.addEventListener("mouseover", handleGlobalMouseOver);
    document.addEventListener("mouseout", handleGlobalMouseOut);
    
    // Other event listeners
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      htmlElement.removeEventListener("mouseleave", handleDocumentMouseLeave);
      htmlElement.removeEventListener("mouseenter", handleDocumentMouseEnter);
      document.removeEventListener("mouseover", handleGlobalMouseOver);
      document.removeEventListener("mouseout", handleGlobalMouseOut);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [cursorX, cursorY, rotation, scale, enabled, disableOnTouch, shouldShowCursor, isTouchDevice, cursorType]);

  // Don't render cursor if disabled or on touch devices (when disableOnTouch is true)
  if (!shouldShowCursor) {
    return null;
  }

  // Get the appropriate cursor component
  const getCurrentCursor = () => {
    switch (cursorType) {
      case 'link':
        return <LinkCursorSVG />;
      case 'button':
        return <ButtonCursorSVG />;
      case 'input':
        return <InputCursorSVG />;
      case 'interactive':
        return <InteractiveCursorSVG />;
      default:
        return cursor;
    }
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: cursorType === 'default' ? rotation : 0,
        scale: scale,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
        opacity: isMouseInViewport ? 1 : 0,
        transition: "opacity 0.2s ease-out",
      }}
      initial={{ scale: 0 }}
      animate={{ 
        scale: 1,
        filter: isClicking ? "brightness(1.2)" : "brightness(1)"
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      {getCurrentCursor()}
    </motion.div>
  );
}
