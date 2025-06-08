'use client';

import { Button } from '@/once-ui/components';

export function DebugControls() {
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
    );
}
