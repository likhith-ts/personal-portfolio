'use client';

import { useEffect, useState } from 'react';
import { Flex, Text } from "@/once-ui/components";
import { createPortal } from 'react-dom';
import { person, style } from '@/app/resources';
import styles from './WelcomeScreen.module.css';
import { useRenderControl } from './RenderController';
import { Terminal, TypingAnimation, AnimatedSpan } from './magicui/terminal';

// Animation phases
type AnimationPhase =
    | 'blackscreen'
    | 'glitch-in'
    | 'terminal'
    | 'glitch-out'
    | 'portfolio-app';

interface TerminalLine {
    text: string;
    type: 'command' | 'output';
    color: string;
    isComplete: boolean;
}

export function WelcomeLoadingScreen() {
    const { shouldShowWelcome, setWelcomeComplete } = useRenderControl();
    const [mounted, setMounted] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('blackscreen');
    const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
    const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
    const [isPortfolioAnimating, setIsPortfolioAnimating] = useState(true);
    const [isTypingCommand, setIsTypingCommand] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Terminal commands sequence with proper timing
    const commands = [
        {
            command: "cd ~/portfolio-workspace",
            output: "",
            color: "text-blue-400",
            commandDelay: 1000,
            outputDelay: 300
        },
        {
            command: "ls -la",
            output: `total 8
drwxr-xr-x  3 ${person.firstName.toLowerCase()} staff   96 Jun  8 16:45 .
drwxr-xr-x  5 ${person.firstName.toLowerCase()} staff  160 Jun  8 16:44 ..
-rw-r--r--  1 ${person.firstName.toLowerCase()} staff 1024 Jun  8 16:45 portfolio.js
-rw-r--r--  1 ${person.firstName.toLowerCase()} staff  512 Jun  8 16:45 package.json`,
            color: "text-green-400",
            commandDelay: 600,
            outputDelay: 800
        },
        {
            command: "cat package.json | grep -E '(name|version)'",
            output: `  "name": "${person.firstName.toLowerCase()}-portfolio",
  "version": "2.0.0",`,
            color: "text-yellow-400",
            commandDelay: 800,
            outputDelay: 600
        },
        {
            command: "sudo npm run initialize-portfolio",
            output: `[sudo] password for ${person.firstName.toLowerCase()}: ••••••••••
✓ Loading environment variables...
✓ Initializing React components...
✓ Setting up animations...
✓ Configuring theme system...`,
            color: "text-red-400",
            commandDelay: 1200,
            outputDelay: 1000
        },
        {
            command: "python3 -c \"import portfolio; portfolio.start()\"",
            output: `Success! Portfolio initialization completed.
The script is loading...`,
            color: "text-purple-400",
            commandDelay: 1000,
            outputDelay: 800
        }
    ];  // Main animation timeline
    useEffect(() => {
        if (!shouldShowWelcome || typeof window === 'undefined') return;

        document.body.style.overflow = 'hidden';

        const timeline = [
            // Phase 1: Black screen (0.5s)
            { phase: 'blackscreen', duration: 500 },
            // Phase 2: Glitch in effect (0.3s)
            { phase: 'glitch-in', duration: 300 },
            // Phase 3: Terminal commands (8s total)
            { phase: 'terminal', duration: 8000 },
            // Phase 4: Glitch out effect (0.3s)
            { phase: 'glitch-out', duration: 300 },
            // Phase 5: Portfolio animation (2.5s)
            { phase: 'portfolio-app', duration: 2500 }
        ];

        let currentTime = 0;

        timeline.forEach((step, index) => {
            setTimeout(() => {
                setCurrentPhase(step.phase as AnimationPhase);

                if (step.phase === 'portfolio-app') {
                    // Start portfolio fade out after 2s
                    setTimeout(() => {
                        setIsPortfolioAnimating(false);
                    }, 2000);

                    // Complete everything after 2.5s
                    setTimeout(() => {
                        document.body.style.overflow = 'auto';
                        localStorage.setItem('hasVisitedBefore', 'true');
                        setWelcomeComplete(true);
                    }, 2500);
                }
            }, currentTime);

            currentTime += step.duration;
        });

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [shouldShowWelcome, setWelcomeComplete]);

    // Terminal command execution logic
    useEffect(() => {
        if (currentPhase !== 'terminal') return;

        // Reset terminal state when entering terminal phase
        setTerminalLines([]);
        setCurrentCommandIndex(0);
        setIsTypingCommand(false);

        // Execute commands sequentially
        const executeNextCommand = (index: number) => {
            if (index >= commands.length) return;

            const cmd = commands[index];

            // Add command line
            setTimeout(() => {
                setIsTypingCommand(true);
                setTerminalLines(prev => [...prev, {
                    text: `$ ${cmd.command}`,
                    type: 'command',
                    color: cmd.color,
                    isComplete: false
                }]);

                // Mark command as complete after typing
                setTimeout(() => {
                    setTerminalLines(prev => prev.map((line, i) =>
                        i === prev.length - 1 ? { ...line, isComplete: true } : line
                    ));
                    setIsTypingCommand(false);

                    // Add output if exists
                    if (cmd.output) {
                        setTimeout(() => {
                            setTerminalLines(prev => [...prev, {
                                text: cmd.output,
                                type: 'output',
                                color: 'text-gray-300',
                                isComplete: true
                            }]);

                            // Move to next command
                            setTimeout(() => {
                                executeNextCommand(index + 1);
                            }, 500);

                        }, cmd.outputDelay);
                    } else {
                        // Move to next command immediately if no output
                        setTimeout(() => {
                            executeNextCommand(index + 1);
                        }, 500);
                    }

                }, cmd.commandDelay);
            }, index === 0 ? 500 : 0); // First command has initial delay
        };

        executeNextCommand(0);
    }, [currentPhase, commands]);

    if (!mounted || !shouldShowWelcome) return null;

    const renderPhase = () => {
        switch (currentPhase) {
            case 'blackscreen':
                return (
                    <div className="w-full h-full bg-black" />
                );

            case 'glitch-in':
                return (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        <div className="glitch-container">
                            <style jsx>{`
                .glitch-container {
                  position: relative;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 24px;
                  animation: glitch 0.3s infinite;
                }
                
                @keyframes glitch {
                  0% { transform: translate(0); }
                  20% { transform: translate(-2px, 2px); }
                  40% { transform: translate(-2px, -2px); }
                  60% { transform: translate(2px, 2px); }
                  80% { transform: translate(2px, -2px); }
                  100% { transform: translate(0); }
                }
              `}</style>
                            <div>INITIALIZING TERMINAL...</div>
                        </div>
                    </div>
                ); case 'terminal':
                return (
                    <div className="w-full h-full bg-black flex items-center justify-center p-8">
                        <Terminal className="w-full max-w-4xl">
                            <div className="space-y-1">
                                <div className="text-green-400 mb-4">
                                    Welcome to {person.firstName}'s Portfolio Terminal v2.0.0
                                </div>
                                {terminalLines.map((line, index) => (
                                    <div key={index} className={`${line.type === 'command'
                                            ? 'text-blue-400 font-bold'
                                            : line.text.includes('Success!')
                                                ? 'text-green-300 font-bold'
                                                : line.text.includes('✓')
                                                    ? 'text-green-300'
                                                    : line.text.includes('[sudo]')
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                        }`}>
                                        {line.isComplete ? (
                                            <span>{line.text}</span>
                                        ) : (
                                            <TypingAnimation duration={line.type === 'command' ? 50 : 30}>
                                                {line.text}
                                            </TypingAnimation>
                                        )}
                                    </div>
                                ))}
                                {isTypingCommand && (
                                    <div className="text-green-400 animate-pulse">|</div>
                                )}
                            </div>
                        </Terminal>
                    </div>
                );

            case 'glitch-out':
                return (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                        <div className="glitch-container-out">
                            <style jsx>{`
                .glitch-container-out {
                  position: relative;
                  color: #00ff00;
                  font-family: 'Courier New', monospace;
                  font-size: 24px;
                  animation: glitch-out 0.3s infinite;
                }
                
                @keyframes glitch-out {
                  0% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.3; transform: scale(1.1); }
                  100% { opacity: 0; transform: scale(0.9); }
                }
              `}</style>
                            <div>LAUNCHING PORTFOLIO...</div>
                        </div>
                    </div>
                );

            case 'portfolio-app':
                return (
                    <div className="portfolio-window">
                        <style jsx>{`
              .portfolio-window {
                position: relative;
                width: 90%;
                height: 90%;
                background: black;
                border: 2px solid #333;
                border-radius: 8px;
                animation: windowOpen 0.5s ease-out;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .portfolio-content {
                animation: ${isPortfolioAnimating ? 'none' : 'fadeOut 0.5s ease-in-out forwards'};
                opacity: ${isPortfolioAnimating ? 1 : 0};
                transition: opacity 0.5s ease-in-out;
              }
              
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
              
              @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
              }
            `}</style>

                        <div className="portfolio-content">
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
                backgroundColor: 'black'
            }}
        >
            {renderPhase()}
        </Flex>,
        document.body
    );
}
