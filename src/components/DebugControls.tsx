'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/once-ui/components';

export function DebugControls() {
    const [showFPS, setShowFPS] = useState(false);
    const [fps, setFps] = useState(0);
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const animationFrameRef = useRef<number>();

    // FPS calculation logic
    useEffect(() => {
        if (!showFPS) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            return;
        }

        const calculateFPS = () => {
            const now = performance.now();
            frameCountRef.current++;

            // Calculate FPS every second
            if (now - lastTimeRef.current >= 1000) {
                const currentFPS = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
                setFps(currentFPS);
                frameCountRef.current = 0;
                lastTimeRef.current = now;
            }

            animationFrameRef.current = requestAnimationFrame(calculateFPS);
        };

        animationFrameRef.current = requestAnimationFrame(calculateFPS);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [showFPS]);

    const toggleFPS = () => {
        setShowFPS(prev => !prev);
        if (showFPS) {
            setFps(0);
        }
    };
    const clearStorage = () => {
        console.log('=== CLEARING STORAGE ===');
        console.log('Before clear:', {
            localStorage_keys: Object.keys(localStorage),
            sessionStorage_keys: Object.keys(sessionStorage),
            hasVisitedBefore: localStorage.getItem('hasVisitedBefore')
        });

        localStorage.clear();
        sessionStorage.clear();

        console.log('After clear:', {
            localStorage_keys: Object.keys(localStorage),
            sessionStorage_keys: Object.keys(sessionStorage),
            hasVisitedBefore: localStorage.getItem('hasVisitedBefore')
        });

        console.log('=== RELOADING PAGE ===');
        window.location.reload();
    };
    const testWelcomeLogic = () => {
        console.log('=== TESTING WELCOME LOGIC ===');
        const pathname = window.location.pathname;
        const isHomePage = pathname === '/';
        const hasVisited = localStorage.getItem('hasVisitedBefore');
        const shouldShow = isHomePage && !hasVisited;

        console.log('Manual Test:', {
            pathname,
            isHomePage,
            hasVisited: !!hasVisited,
            hasVisitedValue: hasVisited,
            shouldShow,
            localStorage_all: Object.keys(localStorage).reduce((acc, key) => {
                acc[key] = localStorage.getItem(key);
                return acc;
            }, {} as Record<string, string | null>),
            sessionStorage_all: Object.keys(sessionStorage).reduce((acc, key) => {
                acc[key] = sessionStorage.getItem(key);
                return acc;
            }, {} as Record<string, string | null>)
        });
    };

    const forceWelcomeShow = () => {
        console.log('=== FORCING WELCOME SCREEN ===');
        localStorage.removeItem('hasVisitedBefore');
        sessionStorage.clear();
        console.log('Storage cleared, reloading...');
        window.location.reload();
    };
    return (
        <>
            {/* FPS Display */}
            {showFPS && (
                <div style={{
                    position: 'fixed',
                    top: 10,
                    left: 10,
                    zIndex: 9999,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: `2px solid ${fps < 30 ? '#ff4444' : fps < 60 ? '#ffaa00' : '#44ff44'}`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                    FPS: {fps}
                </div>
            )}

            {/* Debug Controls Panel */}
            <div style={{
                position: 'absolute',
                top: 50,
                right: 10,
                zIndex: 2,
                background: 'rgba(255, 255, 255, 0)',
                padding: '10px',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
            }}>
                <Button onClick={toggleFPS} size="s">
                    {showFPS ? 'Hide FPS' : 'Show FPS'}
                </Button>
                <Button onClick={clearStorage} size="s">
                    Clear Storage & Reload
                </Button>
                <Button onClick={testWelcomeLogic} size="s">
                    Test Welcome Logic
                </Button>
                <Button onClick={forceWelcomeShow} size="s">
                    Force Welcome
                </Button>
            </div>
        </>
    );
}
