'use client';

import { useEffect, useState } from 'react';
import { Flex, Text } from "@/once-ui/components";
import { createPortal } from 'react-dom';
import { person, style } from '@/app/resources';
import styles from './WelcomeScreen.module.css';
import { useRenderControl } from './RenderController';

export function WelcomeLoadingScreen() {
  const { shouldShowWelcome, setWelcomeComplete } = useRenderControl();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []); useEffect(() => {
    if (!shouldShowWelcome || typeof window === 'undefined') return;

    console.log('WelcomeScreen: Starting animation');

    // Prevent body scroll when welcome screen is showing
    document.body.style.overflow = 'hidden';

    // Mark as visited
    localStorage.setItem('hasVisitedBefore', 'true');

    // Start fade out animation after 2 seconds
    const fadeTimer = setTimeout(() => {
      console.log('WelcomeScreen: Starting fade out');
      setIsAnimating(false);
    }, 2000);

    // Complete the welcome screen after fade animation
    const completeTimer = setTimeout(() => {
      console.log('WelcomeScreen: Animation complete');
      document.body.style.overflow = 'auto';
      setWelcomeComplete(true);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
      document.body.style.overflow = 'auto';
    };
  }, [shouldShowWelcome, setWelcomeComplete]);

  // Client-side only logging
  useEffect(() => {
    console.log('WelcomeScreen render:', {
      mounted,
      shouldShowWelcome,
      isAnimating,
      hasVisited: localStorage.getItem('hasVisitedBefore'),
      lastLoadTime: sessionStorage.getItem('lastLoadTime')
    });
  }, [mounted, shouldShowWelcome, isAnimating]);

  // Don't render if not mounted or shouldn't show welcome
  if (!mounted || !shouldShowWelcome) return null;

  // Ensure the portal is rendered only on the client side with html and body elements
  return createPortal(<Flex
    position="fixed"
    top="0"
    left="0"
    right="0"
    bottom="0"
    zIndex={10}
    background="page"
    horizontal="center"
    vertical="center"
    style={{
      animation: isAnimating ? 'none' : 'fadeOut 0.5s ease-in-out forwards',
      opacity: isAnimating ? 1 : 0,
      visibility: isAnimating ? 'visible' : 'hidden',
      transition: isAnimating ? 'none' : 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out',
      zIndex: 1000
    }}
  >
    <Flex direction="column" gap="m" horizontal="center">
      <Text variant='display-strong-m' as="div" className={styles.welcomeText}>
        <Text as="span" className={styles.welcomePart}>Welcome to</Text>
        <Text
          as="span"
          className={styles.welcomePart}
          style={{
            background: `linear-gradient(90deg, ${style.brand}, ${style.accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          {person.firstName}'s
        </Text>
        <Text as="span" className={styles.welcomePart}>portfolio</Text>
        <Text as="span" style={{ display: 'inline-flex', alignItems: 'center', height: '1em' }}>
          <span className={styles.dots}></span>
        </Text>
      </Text>
    </Flex>
    <style jsx global>{`
        @keyframes fadeOut {
          from { opacity: 1; visibility: visible; }
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
  </Flex>,
    document.body
  );
}