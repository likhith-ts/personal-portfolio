"use client";

import React, { useState } from "react";
import { Column, Flex, Text, Icon } from "@/once-ui/components";
import styles from "./TechnicalSkills.module.scss";

interface Skill {
    skill: string;
    xp: number;
}

interface SkillCategory {
    title: string;
    icon: string;
    experience: string;
    description: {
        subtitle: string;
        skills: Skill[];
    };
}

interface TechnicalSkillsProps {
    skills: SkillCategory[];
}

const SkillCard: React.FC<{
    category: SkillCategory;
    isExpanded: boolean;
    onToggle: () => void;
    cardIndex: number;
}> = ({
    category,
    isExpanded,
    onToggle,
    cardIndex,
}) => {
        return (
            <Column
                className={`${styles.skillCard} ${isExpanded ? styles.expanded : ""}`}
                fillWidth
                // background="neutral-weak"
                background="transparent"
                // border="neutral-medium"
                radius="l"
                padding="l"
                gap="s"
            >
                <Flex
                    fillWidth
                    horizontal="space-between"
                    vertical="center"
                    className={styles.skillHeader}
                    onClick={onToggle}
                    style={{ cursor: "pointer", minHeight: "fit-content" }}
                >
                    <Flex gap="m" vertical="center" style={{ alignItems: "center" }}>
                        <Icon name={category.icon} size="l" onBackground="brand-medium" />
                        <Column gap="4" fillHeight>
                            <Text variant="heading-strong-l">{category.title}</Text>
                            <Text variant="body-default-s" onBackground="neutral-medium">
                                {category.experience}
                            </Text>
                        </Column>
                    </Flex>
                    <Icon
                        name="chevronDown"
                        size="s"
                        className={`${styles.chevron} ${isExpanded ? styles.rotated : ""}`}
                        onBackground="neutral-medium"
                    />
                </Flex>

                <div className={`${styles.expandableContent} ${isExpanded ? styles.show : ""}`}>
                    <Column gap="s">
                        <Text variant="body-default-m" onBackground="neutral-medium">
                            {category.description.subtitle}
                        </Text>                        <Column gap="12">
                            {category.description.skills
                                .sort((a, b) => b.xp - a.xp) // Sort by XP in descending order
                                .map((skillItem, index) => {
                                    return (
                                        <Column key={index} fillWidth gap="8">
                                            <Flex fillWidth horizontal="space-between" vertical="center">
                                                <Text variant="body-default-m">{skillItem.skill}</Text>
                                                <Text variant="body-default-s" onBackground="neutral-medium">
                                                    {skillItem.xp} XP
                                                </Text>
                                            </Flex>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{
                                                        transitionDelay: isExpanded ? `${(index * 150) + 300}ms` : '0ms',
                                                        width: isExpanded ? `${skillItem.xp}%` : '0%',
                                                        transition: 'width 1s ease-out'
                                                    }}
                                                />
                                            </div>
                                        </Column>
                                    );
                                })}
                        </Column>
                    </Column>
                </div>
            </Column>
        );
    };

const TechnicalSkills: React.FC<TechnicalSkillsProps> = ({ skills }) => {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

    const toggleCard = (index: number) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedCards(newExpanded);
    };

    return (
        <div className={styles.technicalSkills}>
            {skills.map((category, index) => (
                <SkillCard
                    key={index}
                    category={category}
                    isExpanded={expandedCards.has(index)}
                    onToggle={() => toggleCard(index)}
                    cardIndex={index}
                />
            ))}
        </div>
    );
};

export default TechnicalSkills;
