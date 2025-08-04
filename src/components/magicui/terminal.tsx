"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface TerminalProps {
    children: React.ReactNode;
    className?: string;
}

export function Terminal({ children, className }: TerminalProps) {
    return (
        <div
            className={cn(
                "w-full max-w-4xl mx-auto border-0 rounded-lg shadow-2xl font-mono text-sm",
                className
            )}
            style={{
                width: '90vw',
                maxWidth: '800px',
                height: '500px',
                position: 'relative',
                background: '#000000',
                border: '2px solid #333333',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: `
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    0 8px 32px rgba(0, 0, 0, 0.8),
                    0 0 0 1px rgba(0, 0, 0, 0.9) inset,
                    0 1px 0 rgba(255, 255, 255, 0.1) inset
                `
            }}
        >
            {/* Terminal header */}
            <div
                className="flex items-center px-4 py-3 border-b"
                style={{
                    background: 'linear-gradient(180deg, #2a2a2a 0%, #1e1e1e 100%)',
                    borderBottom: '1px solid #404040',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px'
                }}
            >
                <div className="flex space-x-2">
                    <div
                        className="w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:brightness-110"
                        style={{
                            background: 'linear-gradient(135deg, #ff5f57 0%, #ff3b30 100%)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                    ></div>
                    <div
                        className="w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:brightness-110"
                        style={{
                            background: 'linear-gradient(135deg, #ffbd2e 0%, #ffa500 100%)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                    ></div>
                    <div
                        className="w-3 h-3 rounded-full cursor-pointer transition-all duration-200 hover:brightness-110"
                        style={{
                            background: 'linear-gradient(135deg, #28ca42 0%, #00ff00 100%)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                    ></div>
                </div>
                <div className="flex-1 text-center text-xs font-medium" style={{ color: '#a0a0a0' }}>
                    <span style={{ color: '#00d4aa' }}>tech@likhithusurupati.dev</span>
                    <span style={{ color: '#666' }}>:</span>
                    <span style={{ color: '#5fb3d4' }}>~/portfolio</span>
                    <span style={{ color: '#666' }}> - Terminal</span>
                </div>
            </div>            {/* Terminal content */}
            <div
                className="p-4"
                style={{
                    height: 'calc(100% - 50px)',
                    overflow: 'hidden',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    position: 'relative',
                    background: '#000000',
                    fontFamily: '"Fira Code", "JetBrains Mono", "Menlo", "Monaco", "Consolas", monospace',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    color: '#e5e7eb'
                }}
            >
                <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
                <div style={{
                    maxHeight: '100%',
                    overflowY: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

interface TypingAnimationProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
}

export function TypingAnimation({
    children,
    delay = 0,
    duration = 100,
    className,
    as: Component = "span",
}: TypingAnimationProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const text = React.Children.toArray(children).join("");

    useEffect(() => {
        if (delay > 0 && !isStarted) {
            const startTimer = setTimeout(() => {
                setIsStarted(true);
            }, delay);
            return () => clearTimeout(startTimer);
        } else if (delay === 0) {
            setIsStarted(true);
        }
    }, [delay, isStarted]);

    useEffect(() => {
        if (!isStarted || currentIndex >= text.length) return;

        const timer = setTimeout(() => {
            setDisplayedText(text.slice(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentIndex, text, duration, isStarted]);

    return (
        <Component className={className}>
            {displayedText}
            {currentIndex < text.length && isStarted && (
                <span className="animate-pulse">|</span>
            )}
        </Component>
    );
}

interface AnimatedSpanProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export function AnimatedSpan({
    children,
    delay = 0,
    className,
}: AnimatedSpanProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <span
            className={cn(
                "transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0",
                className
            )}
        >
            {children}
        </span>
    );
}
