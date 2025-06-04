import { Meta } from '@/once-ui/modules';
import React from 'react'
import { others } from '../resources/content';
import { baseURL } from '../resources';
import { Badge, Card, Flex, Column, Heading, Text, Grid, RevealFx, Icon, SmartImage } from '@/once-ui/components';
import { ContributionCarousel } from '@/components';
import styles from './Others.module.scss';

export async function generateMetadata() {
    return Meta.generate({
        title: others.title,
        description: others.description,
        baseURL: baseURL,
        image: `${baseURL}/og?title=${encodeURIComponent(others.title)}`,
        path: others.path,
    });
}

export default function page() {
    // Get grid class based on certificate count
    const getCertificationGridClass = () => {
        const certCount = others.certifications.length;
        if (certCount === 1) {
            return styles.certifications__grid;
        } else if (certCount === 2) {
            return `${styles.certifications__grid} ${styles['certifications__grid--two']}`;
        } else if (certCount >= 3) {
            return `${styles.certifications__grid} ${styles['certifications__grid--three']}`;
        }
        return styles.certifications__grid;
    };

    return (
        <div className={styles.page}>
            {/* Achievements Section */}
            <RevealFx delay={0.2} translateY={0.5}>
                <section className={`${styles.section} ${styles.achievements}`}>
                    <div className={styles.section__header}>
                        <Heading 
                            variant="display-strong-l" 
                            className={styles.section__title}
                        >
                            <Icon name="achievement" size='l' />
                            <Text>Achievements</Text>
                        <hr className={styles.section__divider} />
                        </Heading>
                    </div>
                    
                    <div className={styles.achievements__grid}>
                        {others.achievements.map((achievement, index) => (
                            <Badge 
                                key={index}
                                icon="achievement"
                                paddingLeft="16" 
                                paddingRight="20"
                                paddingY="12" 
                                onBackground="brand-medium"
                                background="brand-medium"
                                arrow={true}
                                id={`badge-${index}`}
                                // className={styles.achievement__badge}
                            >
                                {achievement}
                            </Badge>
                        ))}
                    </div>
                </section>
            </RevealFx>

            {/* Certifications Section */}
            <RevealFx delay={0.4} translateY={0.5}>
                <section className={`${styles.section} ${styles.certifications}`}>                    <div className={styles.section__header}>
                        <Heading 
                            variant="display-strong-l" 
                            className={styles.section__title}
                        >
                            <Icon name="certificate" size='l' />
                            <Text>Certifications</Text>
                        <hr className={styles.section__divider} />
                        </Heading>
                    </div>
                    
                    <div className={getCertificationGridClass()}>
                        {others.certifications.map((cert, index) => (
                            <Card
                                key={index}
                                href={cert.url || undefined}
                                direction="column"
                                fillWidth
                                padding="xl"
                                gap="l"
                                radius="xl"
                                border="neutral-alpha-medium"
                                className={styles.certification__card}
                            >
                                <SmartImage
                                    src={cert.image || `${baseURL}/og?title=${encodeURIComponent(cert.name)}`}
                                    alt={cert.name}
                                    aspectRatio="16/9"
                                    radius="l"
                                    objectFit="contain"
                                />
                                <Column gap="s" fillWidth>
                                    <Text variant="heading-strong-m" align="center">
                                        🏆 {cert.name}
                                    </Text>
                                    <Text variant="body-default-m" onBackground="neutral-weak" align="center">
                                        {cert.issuer}
                                    </Text>
                                </Column>
                            </Card>
                        ))}
                    </div>
                </section>
            </RevealFx>

            {/* Contributions Section */}
            <RevealFx delay={0.6} translateY={0.5}>
                <section className={`${styles.section} ${styles.contributions}`}>                    <div className={styles.section__header}>
                        <Heading 
                            variant="display-strong-l" 
                            className={styles.section__title}
                        >
                            <Icon name="github" size='l' />
                            <Text>Contributions</Text>
                        <hr className={styles.section__divider} />
                        </Heading>
                    </div>
                    
                    <div className={styles.contributions__container}>
                        <ContributionCarousel contributions={others.contributions} />
                    </div>
                </section>
            </RevealFx>
        </div>
    );
}

