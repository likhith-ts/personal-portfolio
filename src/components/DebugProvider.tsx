"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface DebugContextType {
    debug: boolean;
    setDebug: (debug: boolean) => void;
}

const DebugContext = createContext<DebugContextType>({
    debug: false,
    setDebug: () => { }
});

export const useDebug = () => useContext(DebugContext);

export function DebugProvider({ children }: { children: React.ReactNode }) {
    const [debug, setDebug] = useState(false);

    useEffect(() => {
        // Check URL parameters
        const urlDebug = window.location.search.includes("debug=true");

        // Make debug accessible from browser console
        (window as any).toggleDebug = (value?: boolean) => {
            const newDebug = value !== undefined ? value : !debug;
            setDebug(newDebug);
            console.log("Debug mode:", newDebug);
        };

        setDebug(urlDebug);
        console.log("Debug mode:", urlDebug);

        // Cleanup
        return () => {
            delete (window as any).toggleDebug;
        };
    }, []);

    return (
        <DebugContext.Provider value={{ debug, setDebug }}>
            {children}
        </DebugContext.Provider>
    );
}
