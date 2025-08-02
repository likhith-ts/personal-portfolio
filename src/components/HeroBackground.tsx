"use client";

import { useState, useEffect, useRef } from 'react';
// import HeroNeuralNetwork from './NeuralNetworkHero';
import WireframeTerrainComponent from './wireframe-terrain';
import dynamic from 'next/dynamic';
const HeroNeuralNetwork = dynamic(() => import('@/components/NeuralNetworkHero'), {
  ssr: false
});

export const HeroBackground = () => {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // Initial check for mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Update container height based on parent element
  // This ensures the neural network fits well within the hero section
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const height = containerRef.current.parentElement.clientHeight;
        // console.log('📏 Updating container height:', height);
        setContainerHeight(height);
      }
    };

    // Initial update
    updateHeight();

    // Run again after a short delay to ensure layout is settled
    const initialTimeout = setTimeout(updateHeight, 100);

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    // Listen for window resize as well - parent might resize without triggering ResizeObserver
    window.addEventListener('resize', updateHeight);

    return () => {
      clearTimeout(initialTimeout);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  let networkLayers = [5, 10, 15, 10, 5];
  let top= '-4.5%';
  // Don't render on mobile
  if (isMobile) {
    networkLayers = [5, 10, 10, 10, 5];
    top = '-5%';
    // return (
    //   <div className="absolute inset-0 z-0"
    //     style={{
    //       position: "absolute",
    //       top: "-5%",
    //       left: 0,
    //       width: "inherit",
    //       height: "30%",
    //       zIndex: -1,
    //       opacity: 0.5,
    //       // filter: "blur(2px)",
    //     }}>
    //     <WireframeTerrainComponent />
    //   </div>
    // );
  }

  return (
    <div
      // ref={containerRef}
      id="hero-background"
      className="hero-background"
      style={{
        position: "absolute",
        top: top,
        right: 0,
        width: "100%",
        height: "35%",
        zIndex: -20,
        opacity: 0.5,
      }}
    >
      <div ref={containerRef} style={{ width: 'inherit', height: '100%' }}>
        <HeroNeuralNetwork
          glowIntensity={20}
          animationSpeed={2}
          networkLayers={networkLayers}
          initialWidth={typeof window !== 'undefined' ? window.outerWidth * 5 : 0}
          initialHeight={containerHeight}
        />
      </div>
    </div>
  );
};