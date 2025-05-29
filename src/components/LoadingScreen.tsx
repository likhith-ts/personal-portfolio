'use client';

import { useEffect, useState } from 'react';
import { Flex, Text } from "@/once-ui/components";
import { createPortal } from 'react-dom';
import { person, style } from '@/app/resources';
import styles from './LoadingScreen.module.css';
import { usePathname } from 'next/navigation';

export function LoadingScreen() {
  let pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  // const [isVisible, setIsVisible] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Check if this is initial load or reload
    const lastLoadTime = sessionStorage.getItem('lastLoadTime');
    const currentTime = Date.now();
    if (!lastLoadTime) {
      // First time visit in this session
      setIsInitialLoad(true);
      sessionStorage.setItem('lastLoadTime', currentTime.toString());
    } else {
      // Page reload or subsequent visit
      setIsInitialLoad(false);
    }

    setMounted(true);
    document.body.style.overflow = 'hidden';
    
    if(pathname === '/' && isInitialLoad) {
        document.body.style.overflow = 'hidden';
        const hasVisited = localStorage.getItem('hasVisitedBefore');
        if (!hasVisited) {
        // Show the loading screen only if the user has not visited before and is on the home page
        localStorage.setItem('hasVisitedBefore', 'true');
        const timer = setTimeout(() => {
            // setIsVisible(false);
            document.body.style.overflow = 'auto';
        }, 2500);
        return () => {
            clearTimeout(timer);
            document.body.style.overflow = 'auto';
        };
        } 
    }
    else{
      // setIsVisible(false);
      document.body.style.overflow = 'auto';
    }
  }, [pathname, isInitialLoad]);

  console.log('LoadingScreen mounted:', mounted, 'pathname:', pathname, 'isInitialLoad:', isInitialLoad);
  console.log('OP:', !mounted || !isInitialLoad || pathname !== '/');

  // If the loading screen is not visible, return null(emptly jsx <></>) to avoid rendering
  if ( !mounted || !isInitialLoad || pathname !== '/' ) return <></>;

    // Ensure the portal is rendered only on the client side with html and body elements
  return createPortal(
    <Flex
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
        animation: 'fadeOut 0.5s ease-in-out forwards',
        animationDelay: '1s'
      }}
    >
    <Flex direction="column" gap="m" horizontal="center">        <Text variant='display-strong-m' as="div" className={styles.welcomeText}>
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
          from { opacity: 1; }
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </Flex>,
    document.body
  );
}