"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { SpacingToken } from "@/once-ui/types";
import { Flex } from "@/once-ui/components";

interface BackdropSafeRevealFxProps extends React.ComponentProps<typeof Flex> {
    children: React.ReactNode;
    speed?: "slow" | "medium" | "fast";
    delay?: number;
    revealedByDefault?: boolean;
    translateY?: number | SpacingToken;
    trigger?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

const BackdropSafeRevealFx = forwardRef<HTMLDivElement, BackdropSafeRevealFxProps>(
    (
        {
            children,
            speed = "medium",
            delay = 0,
            revealedByDefault = false,
            translateY,
            trigger,
            style,
            className,
            ...rest
        },
        ref,
    ) => {
        const [isRevealed, setIsRevealed] = useState(revealedByDefault);

        useEffect(() => {
            const timer = setTimeout(() => {
                setIsRevealed(true);
            }, delay * 1000);

            return () => clearTimeout(timer);
        }, [delay]);

        useEffect(() => {
            if (trigger !== undefined) {
                setIsRevealed(trigger);
            }
        }, [trigger]);

        const getSpeedDuration = () => {
            switch (speed) {
                case "fast":
                    return "1s";
                case "medium":
                    return "2s";
                case "slow":
                    return "3s";
                default:
                    return "2s";
            }
        };

        const getTranslateYValue = () => {
            if (typeof translateY === "number") {
                return `${translateY}rem`;
            } else if (typeof translateY === "string") {
                return `var(--static-space-${translateY})`;
            }
            return "1rem"; // default fallback
        };

        const translateValue = getTranslateYValue();

        // Use only transform and opacity - no filter or mask properties that interfere with backdrop-filter
        const revealStyle: React.CSSProperties = {
            transitionDuration: getSpeedDuration(),
            transitionProperty: "transform, opacity",
            transitionTimingFunction: "ease-out",
            transform: isRevealed ? "translateY(0)" : `translateY(${translateValue})`,
            opacity: isRevealed ? 1 : 0,
            ...style,
        };

        return (
            <Flex
                fillWidth
                horizontal="center"
                ref={ref}
                style={revealStyle}
                className={className}
                {...rest}
            >
                {children}
            </Flex>
        );
    },
);

BackdropSafeRevealFx.displayName = "BackdropSafeRevealFx";
export { BackdropSafeRevealFx };
