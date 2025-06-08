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
    const [shouldShowWelcome, setShouldShowWelcome] = useState(false); useEffect(() => {
        // Check if we should show the welcome screen
        if (typeof window === 'undefined') return; // Skip on server

        const isHomePage = pathname === '/';
        const hasVisited = localStorage.getItem('hasVisitedBefore');
        const lastLoadTime = sessionStorage.getItem('lastLoadTime');
        const currentTime = Date.now();

        let isInitialLoad = true;
        if (lastLoadTime) {
            isInitialLoad = false;
        } else {
            sessionStorage.setItem('lastLoadTime', currentTime.toString());
        }

        const shouldShow = isHomePage && !hasVisited && isInitialLoad;

        console.log('RenderController Debug:', {
            isHomePage,
            hasVisited,
            isInitialLoad,
            shouldShow,
            pathname
        });

        setShouldShowWelcome(shouldShow);

        // If we shouldn't show welcome, mark it as complete immediately
        if (!shouldShow) {
            setWelcomeComplete(true);
        }
    }, [pathname]);

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
