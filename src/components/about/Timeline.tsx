"use client"

import React, { useState } from "react"
import { Column, Flex, Text, Button, Icon, SmartImage, Row } from "@/once-ui/components"
import styles from './Timeline.module.scss'

export interface TimelineEntry {
    id: string
    type: 'academic' | 'professional'
    title: string
    subtitle: string
    institute?: string
    timeframe: string
    description?: React.ReactNode
    achievements?: React.ReactNode[]
    images?: Array<{
        src: string
        alt: string
        width: number
        height: number
    }>
}

interface TimelineProps {
    entries: TimelineEntry[]
    className?: string
}

const Timeline: React.FC<TimelineProps> = ({ entries, className = "" }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'academic' | 'professional'>('all')

    const filteredEntries = entries.filter(entry =>
        activeFilter === 'all' || entry.type === activeFilter
    ).sort((a, b) => {
        // Sort by year (extract from timeframe)
        const getYear = (timeframe: string) => {
            const match = timeframe.match(/(\d{4})\s*[-|]\s*(\d{4}|\w+)/)
            return match ? parseInt(match[2] === 'Present' || match[2] === 'current' ? '2024' : match[2]) : 0
        }
        return getYear(b.timeframe) - getYear(a.timeframe)
    })

    return (
        <Column className={className} fillWidth gap="l">
            {/* Filter Buttons */}
            <Flex gap="s" wrap>
                <Button
                    key="filter-all"
                    variant={activeFilter === 'all' ? 'primary' : 'secondary'}
                    size="s"
                    onClick={() => setActiveFilter('all')}
                    label="All"
                />
                <Button
                    key="filter-academic"
                    variant={activeFilter === 'academic' ? 'primary' : 'secondary'}
                    size="s"
                    onClick={() => setActiveFilter('academic')}
                    prefixIcon="academicCap"
                    label="Academic"
                />
                <Button
                    key="filter-professional"
                    variant={activeFilter === 'professional' ? 'primary' : 'secondary'}
                    size="s"
                    onClick={() => setActiveFilter('professional')}
                    prefixIcon="work"
                    label="Professional"
                />
            </Flex>

            {/* Timeline */}
            <Column className={styles.timeline} fillWidth gap="l">
                {filteredEntries.map((entry, index) => (
                    <Flex key={entry.id} className={styles.timelineItem} fillWidth gap="m">
                        {/* Timeline Line */}
                        <Column className={styles.timelineLine} horizontal="center">
                            <div className={`${styles.timelineDot} ${styles[entry.type]}`}>
                                <Icon
                                    name={entry.type === 'academic' ? 'academicCap' : 'work'}
                                    size="m"
                                />
                            </div>
                            {index < filteredEntries.length - 1 && (
                                <div className={styles.timelineConnector} />
                            )}
                        </Column>

                        {/* Content */}
                        <Column className={styles.timelineContent} fillWidth gap="s">
                            <Flex
                                className={styles.timelineHeader}
                                fillWidth
                                horizontal="space-between"
                                vertical="start"
                                wrap
                            >
                                <Column gap="xs">
                                    <Text
                                        align="left"
                                        wrap="pretty"
                                        variant="heading-strong-l"
                                        className={`${styles.timelineTitle} ${styles[entry.type]}`}
                                    >
                                        {entry.title}
                                    </Text>
                                    <Row>
                                        {entry.institute && (
                                            <React.Fragment key={`${entry.id}-institute`}>
                                                <Text variant="body-default-s" onBackground="brand-weak">
                                                    {entry.institute}
                                                </Text>
                                                <Text variant="body-default-s" onBackground="brand-weak">
                                                    &ensp;|&ensp;
                                                </Text>
                                            </React.Fragment>
                                        )}
                                        {entry.subtitle && (
                                            <Text key={`${entry.id}-subtitle`} variant="body-default-s" onBackground="brand-weak">
                                                {entry.subtitle}
                                            </Text>
                                        )}
                                    </Row>
                                </Column>
                                <Text
                                    variant="heading-default-xs"
                                    onBackground="neutral-weak"
                                    className={styles.timeframe}
                                >
                                    <Row align="center" gap="4">
                                        <Icon
                                            name="calendar"
                                            size="s"
                                        />
                                        <Text variant="heading-default-xs">
                                            {entry.timeframe}
                                        </Text>
                                    </Row>
                                </Text>
                            </Flex>

                            {entry.description && (
                                <Text
                                    variant="body-default-m"
                                    onBackground="neutral-medium"
                                >
                                    {entry.description}
                                </Text>
                            )}

                            {entry.achievements && entry.achievements.length > 0 && (
                                <Column as="ul" gap="8" paddingTop="xs">
                                    {entry.achievements.map((achievement, achIndex) => (
                                        <Text
                                            as="li"
                                            variant="body-default-m"
                                            key={`${entry.id}-${achIndex}`}
                                        >
                                            {achievement}
                                        </Text>
                                    ))}
                                </Column>
                            )}

                            {entry.images && entry.images.length > 0 && (
                                <Flex fillWidth paddingTop="s" wrap gap="s">
                                    {entry.images.map((image, imgIndex) => (
                                        <Flex
                                            key={`${entry.id}-image-${imgIndex}`}
                                            border="neutral-medium"
                                            radius="s"
                                            className={styles.imageContainer}
                                            //@ts-ignore
                                            minWidth={image.width}
                                            //@ts-ignore
                                            height={image.height}
                                        >
                                            <SmartImage
                                                enlarge
                                                radius="s"
                                                //@ts-ignore
                                                sizes={image.width.toString()}
                                                //@ts-ignore
                                                // height={image.height.toString()}
                                                //aspect ratio
                                                aspectRatio={`${image.width}/${image.height}`}
                                                //@ts-ignore
                                                alt={image.alt}
                                                //@ts-ignore
                                                src={image.src}
                                            />
                                        </Flex>
                                    ))}
                                </Flex>
                            )}
                        </Column>
                    </Flex>
                ))}
            </Column>
        </Column>
    )
}

export default Timeline
