'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface RenderContextType {
    isWelcomeComplete: boolean;
    setWelcomeComplete: (complete: boolean) => void;
    shouldShowWelcome: boolean;
}

const RenderContext = createContext<RenderContextType | undefined>(undefined);

export function useRenderControl() {
    const context = useContext(RenderContext);
    if (!context) {
        throw new Error('useRenderControl must be used within RenderController');
    }
    return context;
}

interface RenderControllerProps {
    children: ReactNode;
}

export function RenderController({ children }: RenderControllerProps) {
    const pathname = usePathname();
    const [isWelcomeComplete, setWelcomeComplete] = useState(false);
    const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
    const [mounted, setMounted] = useState(false);
    // Mount detection
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Check if we should show the welcome screen
        if (!mounted || typeof window === 'undefined') {
            return;
        }

        const isHomePage = pathname === '/';
        const hasVisited = localStorage.getItem('hasVisitedBefore');

        // Simplified logic: show welcome if on home page and hasn't visited before
        const shouldShow = isHomePage && !hasVisited;

        setShouldShowWelcome(shouldShow);

        // If we shouldn't show welcome, mark it as complete immediately
        if (!shouldShow) {
            setWelcomeComplete(true);
        } else {
            // Don't mark as complete initially if we should show welcome
            setWelcomeComplete(false);
        }
    }, [pathname, mounted]);

    return (
        <RenderContext.Provider value={{
            isWelcomeComplete,
            setWelcomeComplete,
            shouldShowWelcome
        }}>
            {children}
        </RenderContext.Provider>
    );
}
