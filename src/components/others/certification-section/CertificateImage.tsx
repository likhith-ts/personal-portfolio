"use client";

import React, { CSSProperties, useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactDOM from "react-dom";

import { Flex, Skeleton } from "../../../once-ui/components";

export interface SmartImageProps extends React.ComponentProps<typeof Flex> {
    aspectRatio?: string;
    height?: number;
    alt?: string;
    isLoading?: boolean;
    objectFit?: CSSProperties["objectFit"];
    enlarge?: boolean;
    src: string;
    unoptimized?: boolean;
    sizes?: string;
    priority?: boolean;
}

const CSmartImage: React.FC<SmartImageProps> = ({
    aspectRatio,
    height,
    alt = "",
    isLoading = false,
    objectFit = "cover",
    enlarge = false,
    src,
    unoptimized = false,
    priority,
    sizes = "100vw",
    ...rest
}) => {
    const [isEnlarged, setIsEnlarged] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showPortal, setShowPortal] = useState(false);
    const [originalRect, setOriginalRect] = useState<DOMRect | null>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    // Create portal container on mount
    useEffect(() => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        setPortalContainer(container);

        return () => {
            document.body.removeChild(container);
        };
    }, []);

    const handleClick = () => {
        if (enlarge && imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            setOriginalRect(rect);
            setIsAnimating(true);

            if (!isEnlarged) {
                // Enlarging: Show portal first, then animate
                setShowPortal(true);
                // Small delay to ensure portal renders before animation
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsEnlarged(true);
                    });
                });
            } else {
                // Delarge: Animate first, then hide portal
                setIsEnlarged(false);
            }
        }
    };

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isEnlarged) {
                handleClick();
            }
        };

        const handleWheel = (event: WheelEvent) => {
            if (isEnlarged) {
                handleClick();
            }
        };

        document.addEventListener("keydown", handleEscape);
        window.addEventListener("wheel", handleWheel, { passive: true });

        return () => {
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("wheel", handleWheel);
        };
    }, [isEnlarged]);

    // Handle animation completion
    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
                // If we're delarging, hide portal after animation completes
                if (!isEnlarged) {
                    setShowPortal(false);
                }
            }, 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isAnimating, isEnlarged]);

    useEffect(() => {
        if (isEnlarged) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isEnlarged]);

    const calculateTransform = () => {
        if (!originalRect) return {};

        if (!isEnlarged) {
            // Return to original position and size
            return {
                position: 'fixed' as CSSProperties['position'],
                top: originalRect.top,
                left: originalRect.left,
                width: originalRect.width,
                height: originalRect.height,
                transform: "translate(0, 0) scale(1)",
                transition: "all 0.3s ease-in-out",
                zIndex: 9999,
                transformOrigin: 'top left',
            };
        }

        // Calculate scale to fit viewport
        const scaleX = (window.innerWidth * 0.9) / originalRect.width;
        const scaleY = (window.innerHeight * 0.9) / originalRect.height;
        const scale = Math.min(scaleX, scaleY);

        // Calculate translation to center
        const scaledWidth = originalRect.width * scale;
        const scaledHeight = originalRect.height * scale;
        const translateX = (window.innerWidth - scaledWidth) / 2 - originalRect.left;
        const translateY = (window.innerHeight - scaledHeight) / 2 - originalRect.top;

        return {
            position: 'fixed' as CSSProperties['position'],
            top: originalRect.top,
            left: originalRect.left,
            width: originalRect.width,
            height: originalRect.height,
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            transition: "all 0.3s ease-in-out",
            zIndex: 9999,
            transformOrigin: 'top left',
        };
    };

    const renderImageContent = (isPortalVersion: boolean = false) => {
        const imageStyle = isPortalVersion ? { width: "100%", height: "100%", objectFit } : { objectFit };

        if (isLoading && !isPortalVersion) return <Skeleton shape="block" />;

        if (isVideo) {
            return (
                <video
                    src={src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={imageStyle}
                />
            );
        }

        if (isYouTube) {
            return (
                <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(src)}
                    title={alt || "YouTube video"}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={imageStyle}
                />
            );
        }

        return (
            <Image
                src={src}
                alt={alt}
                priority={priority}
                sizes={isPortalVersion ? "90vw" : sizes}
                unoptimized={unoptimized}
                fill
                style={imageStyle}
            />
        );
    };

    const isYouTubeVideo = (url: string) => {
        const youtubeRegex =
            /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        return youtubeRegex.test(url);
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        );
        return match
            ? `https://www.youtube.com/embed/${match[1]}?controls=0&rel=0&modestbranding=1`
            : "";
    };

    const isVideo = src?.endsWith(".mp4");
    const isYouTube = isYouTubeVideo(src);

    return (
        <>
            <Flex
                ref={imageRef}
                fillWidth
                overflow="hidden"
                cursor={enlarge ? "interactive" : ""}
                style={{
                    outline: "none",
                    isolation: "isolate",
                    height: aspectRatio ? "" : height ? `${height}rem` : "100%",
                    aspectRatio,
                    opacity: showPortal ? 0 : 1, // Hide when portal is showing
                }}
                onClick={handleClick}
                {...rest}
            >
                {renderImageContent()}
            </Flex>

            {/* Portal for enlarged image */}
            {portalContainer && showPortal && originalRect && ReactDOM.createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            zIndex: 9998,
                            backdropFilter: 'var(--backdrop-filter)',
                            cursor: 'pointer',
                            opacity: isEnlarged ? 1 : 0,
                            transition: "opacity 0.3s ease-in-out",
                        }}
                        onClick={handleClick}
                    />

                    {/* Enlarged image */}
                    <div
                        style={{
                            ...calculateTransform(),
                            borderRadius: isEnlarged ? 0 : undefined,
                            overflow: 'hidden',
                        }}
                        onClick={handleClick}
                    >
                        {renderImageContent(true)}
                    </div>
                </>,
                portalContainer
            )}
        </>
    );
};

CSmartImage.displayName = "SmartImage";

export { CSmartImage };
