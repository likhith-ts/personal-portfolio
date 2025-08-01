"use client";

import { useState, useEffect } from 'react';
// import HeroNeuralNetwork from './NeuralNetworkHero';
import WireframeTerrainComponent from './wireframe-terrain';
import dynamic from 'next/dynamic';
const HeroNeuralNetwork = dynamic(() => import('@/components/NeuralNetworkHero'), {
  ssr: false
});

export const HeroBackground = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  // Don't render on mobile
  if (isMobile) {
    return (
      <div className="absolute inset-0 z-0"
        style={{
          position: "absolute",
          top: "-5%",
          left: 0,
          width: "100%",
          height: "30%",
          zIndex: -1,
          opacity: 0.5,
          // filter: "blur(2px)",
        }}>
         <WireframeTerrainComponent />
      </div>
    );
  }

  return (
    <div
      id="hero-background"
      className="hero-background"
      style={{
      position: "absolute",
      top: "-4.5%",
      left: "-3%",
      right: 0,
      width: "100%",
      height: "100%",
      zIndex: -20,
      opacity: 0.5,
      // filter: "blur(2px)",
      }}
    >
      <HeroNeuralNetwork
      glowIntensity={1}
      animationSpeed={1}
      networkLayers={[5, 10, 15, 10, 5]}
      initialWidth={typeof window !== 'undefined' ? window.innerWidth : 0}
      initialHeight={typeof window !== 'undefined' ? window.innerHeight : 0}
      />
    </div>
  );
};