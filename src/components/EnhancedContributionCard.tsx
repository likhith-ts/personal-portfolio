"use client";

import React from 'react';
import { Card, Flex, Text, Button, Icon, Avatar } from '@/once-ui/components';

export interface ContributionItem {
    title: string;
    description: string;
    project: string;
    owner: string;
    link: string;
    icon?: string;
    avatars: { src: string }[];
}

interface EnhancedContributionCardProps {
    contribution: ContributionItem;
    index: number;
    isActive: boolean;
    isInView: boolean;
    isHovered: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTooltipShow: (content: string, element: HTMLElement) => void;
    onTooltipHide: () => void;
    className?: string;
    styles: any; // CSS modules styles object
}

// Utility function to truncate text to a specific word count
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
const MAX_TITLE_WORDS = 6;
const MAX_DESCRIPTION_WORDS = 15;

export const EnhancedContributionCard: React.FC<EnhancedContributionCardProps> = ({
    contribution,
    index,
    isActive,
    isInView,
    isHovered,
    onMouseEnter,
    onMouseLeave,
    onTooltipShow,
    onTooltipHide,
    className,
    styles
}) => {
    // Get truncated text
    const titleData = truncateText(contribution.title, MAX_TITLE_WORDS);
    const descriptionData = truncateText(contribution.description, MAX_DESCRIPTION_WORDS);

    return (
        <Card
            marginX='20'
            radius="xl"
            direction="column"
            border="neutral-alpha-medium"
            className={`${styles.contribution__card} ${isHovered ? styles['contribution__card--hovered'] : ''
                } ${className || ''}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            role="tabpanel"
            aria-label={`Contribution ${index + 1}`}
        >
            {/* Card Header with Gradient Background */}
            <div className={styles.contribution__header}>
                <div className={styles.contribution__header_content}>
                    <div className={styles.contribution__title_wrapper}>
                        <Text
                            variant="heading-strong-s"
                            align="center"
                            wrap="balance"
                            className={styles.contribution__title}
                            onMouseEnter={(e) => {
                                if (titleData.isTruncated) {
                                    onTooltipShow(contribution.title, e.currentTarget as HTMLElement);
                                }
                            }}
                            onMouseLeave={onTooltipHide}
                        >
                            {titleData.truncated}
                        </Text>
                    </div>

                    {/* Project Badge */}
                    <div className={styles.contribution__project_badge}>
                        <Icon name={contribution.icon || "heart"} size="l" />
                        <Text variant="label-strong-xs" paddingX="8" className={styles.contribution__project_name}>
                            {contribution.project}
                        </Text>
                    </div>
                </div>
            </div>

            {/* Contributors Section */}
            {contribution.avatars?.length > 0 && (
                <div className={styles.contribution__contributors}>
                    <Text variant="label-default-xs" className={styles.contribution__contributors_label}>
                        Contributors
                    </Text>
                    <div className={styles.contribution__avatars} role="group" aria-label="Contributors">
                        {contribution.avatars.slice(0, 4).map((avatar: { src: string }, avatarIndex: number) => (
                            <div key={avatarIndex} className={styles.contribution__avatar_wrapper}>
                                <Avatar
                                    size="s"
                                    src={avatar.src}
                                    className={styles.contribution__avatar}
                                />
                            </div>
                        ))}
                        {contribution.avatars.length > 4 && (
                            <div
                                className={styles.contribution__avatar_more}
                                aria-label={`${contribution.avatars.length - 4} more contributors`}
                            >
                                <Text variant="label-strong-xs">+{contribution.avatars.length - 4}</Text>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Description Section */}
            <div className={styles.contribution__body}>
                <div className={styles.contribution__description_wrapper}>
                    <Text
                        variant="body-default-s"
                        align="left"
                        onBackground="neutral-weak"
                        wrap="pretty"
                        className={styles.contribution__description}
                        onMouseEnter={(e) => {
                            if (descriptionData.isTruncated) {
                                onTooltipShow(contribution.description, e.currentTarget as HTMLElement);
                            }
                        }}
                        onMouseLeave={onTooltipHide}
                    >
                        {descriptionData.truncated}
                    </Text>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={styles.contribution__footer}>
                <Button
                    href={contribution.link}
                    variant="secondary"
                    size="s"
                    id={contribution.project + "main"}
                    // fillWidth
                    arrowIcon
                    prefixIcon='externalLink'
                    className={styles.contribution__main_button}
                    aria-label={`View ${contribution.project} contribution`}
                >
                    <Flex gap="xs" vertical="center">
                        {/* <Icon name="externalLink" size="xs" /> */}
                        <Text variant="label-strong-s">View</Text>
                    </Flex>
                </Button>

                <Button
                    id={contribution.project + "owner"}
                    href={contribution.link}
                    variant="tertiary"
                    size="s"
                    className={styles.contribution__owner_button}
                    aria-label={`View ${contribution.owner}'s profile`}
                    arrowIcon
                >
                    <Flex gap="xs" vertical="center">
                        <Avatar size="xs" src={contribution.avatars[0]?.src} />
                        <Text variant="label-default-s">{contribution.owner}</Text>
                    </Flex>
                </Button>
            </div>
        </Card>
    );
};

// Export the utility functions for external use
export { truncateText, MAX_TITLE_WORDS, MAX_DESCRIPTION_WORDS };
