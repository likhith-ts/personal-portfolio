'use client';

import { useEffect, useState, useRef } from 'react';
import { Flex, Text } from "@/once-ui/components";
import { createPortal } from 'react-dom';
import { person, style } from '@/app/resources';
import styles from './WelcomeScreen.module.css';
import { useRenderControl } from './RenderController';
import { Terminal, TypingAnimation } from './magicui/terminal';

type AnimationPhase =
    | 'blackscreen'
    | 'glitch-in'
    | 'terminal'
    | 'glitch-out'
    | 'portfolio-app'
    | 'complete';

export function WelcomeLoadingScreen() {
    const { shouldShowWelcome, setWelcomeComplete } = useRenderControl();
    const [mounted, setMounted] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('blackscreen');
    const [terminalContent, setTerminalContent] = useState<string[]>([]);
    const [isPortfolioAnimating, setIsPortfolioAnimating] = useState(true);
    const animationStarted = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Single useEffect to handle the entire animation sequence
    useEffect(() => {
        if (!shouldShowWelcome || !mounted || animationStarted.current) return;

        animationStarted.current = true;
        document.body.style.overflow = 'hidden';

        const runAnimation = async () => {
            // Phase 1: Black screen (500ms)
            setCurrentPhase('blackscreen');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Phase 2: Glitch in (300ms)
            setCurrentPhase('glitch-in');
            await new Promise(resolve => setTimeout(resolve, 300));

            // Phase 3: Terminal (7000ms)
            setCurrentPhase('terminal');
            await runTerminalSequence();

            // Phase 4: Glitch out (1500ms)
            setCurrentPhase('glitch-out');
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Phase 5: Portfolio app (2500ms)
            setCurrentPhase('portfolio-app');
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsPortfolioAnimating(false);
            await new Promise(resolve => setTimeout(resolve, 500));

            // Complete
            setCurrentPhase('complete');
            document.body.style.overflow = 'auto';
            localStorage.setItem('hasVisitedBefore', 'true');
            setWelcomeComplete(true);
        };

        runAnimation();

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [shouldShowWelcome, mounted, setWelcomeComplete]); const runTerminalSequence = async () => {
        const commands = [
            {
                command: "cd ~/portfolio-workspace",
                output: "",
                delay: 800
            },
            {
                command: "ls -la",
                output: `total 8
drwxr-xr-x  3 ${person.firstName.toLowerCase()} staff   96 Jun  8 16:45 .
drwxr-xr-x  5 ${person.firstName.toLowerCase()} staff  160 Jun  8 16:44 ..
-rw-r--r--  1 ${person.firstName.toLowerCase()} staff 1024 Jun  8 16:45 portfolio.js
-rw-r--r--  1 ${person.firstName.toLowerCase()} staff  512 Jun  8 16:45 package.json`,
                delay: 1000
            },
            {
                command: "cat package.json | grep -E '(name|version)'",
                output: `  "name": "${person.firstName.toLowerCase()}-portfolio",
  "version": "0.1.0",`,
                delay: 800
            },
            {
                command: "sudo npx build initialize-portfolio",
                output: ` [sudo] password for ${person.firstName.toLowerCase()}: ••••••••••
✓ Loading environment variables...
✓ Initializing React components...
✓ Setting up animations...
✓ Configuring theme system...`,
                delay: 1200
            },
            {
                command: "npx next start",
                // command: "python3 -c \"import portfolio; portfolio.start()\"",
                output: `Success! Portfolio initialization completed.
The script is loading...`,
                delay: 1000
            }
        ];

        // Initialize terminal with welcome message
        setTerminalContent([`Welcome to ${person.firstName}'s Portfolio Terminal v2.0.0`]);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Execute commands sequentially
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];

            // Add command
            setTerminalContent(prev => [...prev, `$ ${cmd.command}`]);
            await new Promise(resolve => setTimeout(resolve, cmd.delay));

            // Add output if exists
            if (cmd.output) {
                setTerminalContent(prev => [...prev, cmd.output]);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Wait a bit before moving to next phase
        await new Promise(resolve => setTimeout(resolve, 1000));
    };    // Parrot OS terminal color scheme renderer
    const renderTerminalLine = (line: string) => {
        // Welcome message
        if (line.startsWith('Welcome to')) {
            return (
                <div style={{
                    color: '#22d3ee',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    textShadow: '0 0 5px #22d3ee, 0 0 10px #22d3ee'
                }}>
                    {line}
                </div>
            );
        }

        // Command lines (starting with $)
        if (line.startsWith('$ ')) {
            const commandPart = line.substring(2);
            return (
                <div style={{ display: 'flex' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>$</span>
                    <span style={{ color: '#ffffff', marginLeft: '4px' }}>{renderCommand(commandPart)}</span>
                </div>
            );
        }

        // Directory listing output
        if (line.match(/^[drwx-]{10}/)) {
            return <div style={{ color: '#93c5fd' }}>{renderDirectoryListing(line)}</div>;
        }

        // JSON output
        if (line.includes('"name"') || line.includes('"version"')) {
            return <div style={{ color: '#fde047' }}>{renderJsonLine(line)}</div>;
        }

        // Success messages
        if (line.includes('Success!')) {
            return <div style={{
                color: '#4ade80',
                fontWeight: 'bold',
                textShadow: '0 0 5px #4ade80, 0 0 10px #4ade80'
            }}>{line}</div>;
        }

        // Checkmarks and progress
        if (line.includes('✓')) {
            return <div style={{ color: '#86efac' }}>{renderProgressLine(line)}</div>;
        }

        // Sudo password prompt
        if (line.includes('[sudo] password')) {
            return <div style={{ color: '#facc15' }}>{line}</div>;
        }

        // Total line in ls output
        if (line.startsWith('total ')) {
            return <div style={{ color: '#9ca3af' }}>{line}</div>;
        }

        // Default text
        return <div style={{ color: '#d1d5db' }}>{line}</div>;
    }; const renderCommand = (command: string) => {
        // Split command into parts for syntax highlighting
        const parts = command.split(' ');
        return parts.map((part, index) => {
            // Command names
            if (index === 0) {
                if (['cd', 'ls', 'cat', 'sudo', 'python3'].includes(part)) {
                    return <span key={index} style={{ color: '#4ade80', fontWeight: 'bold' }}>{part}</span>;
                }
                return <span key={index} style={{ color: '#ffffff' }}>{part}</span>;
            }

            // Flags and options
            if (part.startsWith('-')) {
                return <span key={index} style={{ color: '#67e8f9' }}> {part}</span>;
            }

            // File paths and strings
            if (part.includes('/') || part.includes('.')) {
                return <span key={index} style={{ color: '#fde047' }}> {part}</span>;
            }

            // Quoted strings
            if (part.startsWith('"') && part.endsWith('"')) {
                return <span key={index} style={{ color: '#fdba74' }}> {part}</span>;
            }

            // Pipes and redirections
            if (part === '|' || part.includes('>')) {
                return <span key={index} style={{ color: '#c084fc' }}> {part}</span>;
            }

            // Default
            return <span key={index} style={{ color: '#ffffff' }}> {part}</span>;
        });
    }; const renderDirectoryListing = (line: string) => {
        const parts = line.split(/\s+/);
        return (
            <>
                <span style={{ color: '#60a5fa' }}>{parts[0]}</span>
                <span style={{ color: '#9ca3af' }}> {parts.slice(1, 3).join(' ')}</span>
                <span style={{ color: '#67e8f9' }}> {parts[3]}</span>
                <span style={{ color: '#9ca3af' }}> {parts.slice(4, 8).join(' ')}</span>
                <span style={{ color: '#ffffff' }}> {parts.slice(8).join(' ')}</span>
            </>
        );
    }; const renderJsonLine = (line: string) => {
        // Parse JSON-like lines for syntax highlighting
        const jsonRegex = /(\s*)"([^"]+)"(\s*):(\s*)"?([^",]+)"?,?/;
        const match = line.match(jsonRegex);

        if (match) {
            const [, leadingSpace, key, afterKey, afterColon, value] = match;
            const hasComma = line.endsWith(',');

            return (
                <span>
                    {leadingSpace}
                    <span style={{ color: '#22d3ee' }}>"{key}"</span>
                    {afterKey}
                    <span style={{ color: '#a855f7' }}>:</span>
                    {afterColon}
                    <span style={{ color: '#fbbf24' }}>"{value}"</span>
                    {hasComma && <span style={{ color: '#6b7280' }}>,</span>}
                </span>
            );
        }

        return <span style={{ color: '#fde047' }}>{line}</span>;
    };

    const renderProgressLine = (line: string) => {
        return (
            <>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                <span style={{ color: '#d1d5db' }}> {line.substring(2)}</span>
            </>
        );
    };

    if (!mounted || !shouldShowWelcome || currentPhase === 'complete') return null;

    const renderPhase = () => {
        switch (currentPhase) {
            case 'blackscreen':
                return <div className="w-full h-full bg-black" />;

            case 'glitch-in':
                return (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        <div style={{
                            color: '#00ff00',
                            fontFamily: 'Courier New, monospace',
                            fontSize: '24px',
                            animation: 'glitch 0.3s infinite'
                        }}>
                            INITIALIZING TERMINAL...
                        </div>
                        <style jsx>{`
              @keyframes glitch {
                0% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(-2px, -2px); }
                60% { transform: translate(2px, 2px); }
                80% { transform: translate(2px, -2px); }
                100% { transform: translate(0); }
              }
            `}</style>
                    </div>
                ); case 'terminal':
                return (
                    <div className="w-full h-full bg-black flex items-center justify-center p-8">
                        <Terminal className="w-full max-w-4xl h-96">
                            <div className="space-y-1 text-sm">
                                {terminalContent.map((line, index) => (
                                    <div key={index}>
                                        {renderTerminalLine(line)}
                                    </div>
                                ))}
                            </div>
                        </Terminal>
                    </div>
                );

            case 'glitch-out':
                return (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        <div style={{
                            color: '#00ff00',
                            fontFamily: 'Courier New, monospace',
                            fontSize: '24px',
                            animation: 'glitch-out 0.3s infinite'
                        }}>
                            LAUNCHING PORTFOLIO...
                        </div>
                        <style jsx>{`
              @keyframes glitch-out {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(1.1); }
                100% { opacity: 0; transform: scale(0.9); }
              }
            `}</style>
                    </div>
                );

            case 'portfolio-app':
                return (
                    <div style={{
                        position: 'relative',
                        width: '90%',
                        height: '90%',
                        background: 'black',
                        border: '2px solid #333',
                        borderRadius: '8px',
                        animation: 'windowOpen 0.5s ease-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            opacity: isPortfolioAnimating ? 1 : 0,
                            transition: 'opacity 0.5s ease-in-out'
                        }}>
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
                        </div>
                        <style jsx>{`
              @keyframes windowOpen {
                0% { 
                  width: 200px; 
                  height: 100px; 
                  opacity: 0.8; 
                }
                50% { 
                  width: 95%; 
                  height: 95%; 
                  opacity: 0.9; 
                }
                100% { 
                  width: 90%; 
                  height: 90%; 
                  opacity: 1; 
                }
              }
            `}</style>
                    </div>
                );

            default:
                return null;
        }
    };

    return createPortal(
        <Flex
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex={10}
            horizontal="center"
            vertical="center"
            style={{
                zIndex: 1000,
                backgroundColor: 'black',
                overflow: 'hidden'
            }}
        >
            {renderPhase()}
        </Flex>,
        document.body
    );
}
