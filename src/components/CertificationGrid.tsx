"use client";

import React from 'react';
import { Card, Column, Text, SmartImage, Grid } from '@/once-ui/components';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';
import styles from '../app/others/Others.module.scss';

interface CertificationItem {
    url?: string;
    name: string;
    issuer: string;
    image?: string;
}

interface CertificationGridProps {
    certifications: CertificationItem[];
    baseURL: string;
}

export const CertificationGrid: React.FC<CertificationGridProps> = ({
    certifications,
    baseURL
}) => {
    // Utility function to truncate text to a specific word count (same as ContributionCarousel)
    const truncateText = (text: string, maxWords: number): { truncated: string; isTruncated: boolean } => {
        const words = text.split(' ');
        if (words.length <= maxWords) {
            return { truncated: text, isTruncated: false };
        }
        return {
            truncated: words.slice(0, maxWords).join(' ') + '...',
            isTruncated: true
        };
    };

    // Constants for uniform text lengths
    const MAX_CERT_TITLE_WORDS = 8;
    const MAX_CERT_ISSUER_WORDS = 6;

    // Tooltip state management
    const [tooltipOpen, setTooltipOpen] = React.useState(false);
    const [tooltipContent, setTooltipContent] = React.useState<string | null>(null);
    const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const { refs, floatingStyles } = useFloating({
        open: tooltipOpen,
        onOpenChange: setTooltipOpen,
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    const showTooltip = React.useCallback((content: string, element: HTMLElement) => {
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }

        tooltipTimeoutRef.current = setTimeout(() => {
            setTooltipContent(content);
            refs.setReference(element);
            setTooltipOpen(true);
        }, 300);
    }, [refs]);

    const hideTooltip = React.useCallback(() => {
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
        }

        tooltipTimeoutRef.current = setTimeout(() => {
            setTooltipOpen(false);
            setTooltipContent(null);
        }, 100);
    }, []);

    return (
        <>
            <Grid
                columns={certifications.length === 1 ? 1 :
                    certifications.length === 2 ? 2 : 3}
                tabletColumns={certifications.length === 1 ? 1 : 2}
                mobileColumns={1}
                gap="24"
                fillWidth
                className={styles.certifications__grid}
            >
                {certifications.map((cert, index) => {
                    const titleData = truncateText(cert.name, MAX_CERT_TITLE_WORDS);
                    const issuerData = truncateText(cert.issuer, MAX_CERT_ISSUER_WORDS);

                    return (
                        <Card
                            key={`cert-${index}`}
                            href={cert.url || undefined}
                            direction="column"
                            fillWidth
                            padding="l"
                            gap="l"
                            radius="xl"
                            border="neutral-alpha-medium"
                            className={styles.certification__card}
                        >                            <div className={styles.certification__image_container}>
                                <div className={styles.certification__image}>                                    <SmartImage
                                    isLoading={cert.image ? false : true}
                                    src={cert.image || `${baseURL}/og?title=${encodeURIComponent(cert.name)}`}
                                    alt={cert.name}
                                    aspectRatio="4/3"
                                    radius="xl-8"
                                    objectFit="fill"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '24px',
                                        overflow: 'hidden'
                                    }}
                                />
                                </div>
                            </div>
                            <Column gap="s" fillWidth className={styles.certification__content}>
                                <div className={styles.certification__title_wrapper}>
                                    <Text
                                        variant="heading-strong-m"
                                        align="center"
                                        className={styles.certification__title}
                                        onMouseEnter={(e) => {
                                            if (titleData.isTruncated) {
                                                showTooltip(cert.name, e.currentTarget as HTMLElement);
                                            }
                                        }}
                                        onMouseLeave={hideTooltip}
                                    >
                                        🏆 {titleData.truncated}
                                    </Text>
                                </div>
                                <div className={styles.certification__issuer_wrapper}>
                                    <Text
                                        variant="body-default-m"
                                        onBackground="neutral-weak"
                                        align="center"
                                        className={styles.certification__issuer}
                                        onMouseEnter={(e) => {
                                            if (issuerData.isTruncated) {
                                                showTooltip(cert.issuer, e.currentTarget as HTMLElement);
                                            }
                                        }}
                                        onMouseLeave={hideTooltip}
                                    >
                                        {issuerData.truncated}
                                    </Text>
                                </div>
                            </Column>
                        </Card>
                    );
                })}
            </Grid>

            {/* Tooltip */}
            {tooltipOpen && tooltipContent && (
                <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    className={styles.tooltip}
                >
                    <Text variant="body-default-s" className={styles.tooltip__text}>
                        {tooltipContent}
                    </Text>
                </div>
            )}
        </>
    );
};
