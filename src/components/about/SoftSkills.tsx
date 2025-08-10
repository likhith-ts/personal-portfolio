"use client";

import React from "react";
import { Column, Flex, Text, Row } from "@/once-ui/components";
import styles from "./SoftSkills.module.scss";

interface SoftSkill {
    name: string;
    star: number;
}

interface SoftSkillsProps {
    skills: SoftSkill[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className={styles.starRating}>
            <Text
                variant="body-default-xs"
                className={styles.ratingText}
                onBackground="neutral-medium"
            >
                {rating.toFixed(1)}
            </Text>
            <div className={styles.starsContainer}>
                <div className={styles.starsEmpty}>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                </div>
                <div
                    className={styles.starsFilled}
                    style={{ width: `${(rating / 5) * 100}%` }}
                >
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                </div>
            </div>
        </div>
    );
};

const SoftSkills: React.FC<SoftSkillsProps> = ({ skills }) => {
    // Find the highest rating to determine expert skills
    const maxRating = Math.max(...skills.map(skill => skill.star));

    return (
        <Column fillWidth gap="m">
            <div className={styles.skillsGrid}>
                {skills.map((skill, index) => (
                    <div
                        key={skill.name}
                        className={`${styles.skillCard} ${skill.star === maxRating ? styles.expertSkill : ''}`}
                    >
                        <Flex
                            fillWidth
                            horizontal="space-between"
                            vertical="center"
                            gap="m"
                        >
                            <Text
                                variant="body-default-m"
                                className={styles.skillName}
                                weight="strong"
                            >
                                {skill.name}
                            </Text>
                            <Flex className={styles.ratingWrapper}>
                                <StarRating rating={skill.star} />
                            </Flex>
                        </Flex>
                    </div>
                ))}
            </div>
        </Column>
    );
};

export default SoftSkills;
