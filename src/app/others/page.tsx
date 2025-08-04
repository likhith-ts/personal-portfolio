import { Meta, Schema } from '@/once-ui/modules';
import React from 'react'
import { person, about, social, others } from '../resources/content';
import TableOfContents from "@/components/about/TableOfContents";
import { baseURL } from '../resources';
import { Badge, Column, Flex, Row, Heading, Text, RevealFx, Icon } from '@/once-ui/components';
import { ContributionCarousel, CertificationGrid, ContributionCard } from '@/components';
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

    const structure = [
        {
            title: "Achievements",
            display: others.achievements.display,
            items: [],
        },
        {
            title: "Certifications",
            display: others.certifications.display,
            items: others.certifications.items.map(cert => cert.name),
        },
        {
            title: "Contributions",
            display: others.contributions.display,
            items: others.contributions.items.map(contrib => contrib.title),
        },
    ];
    return (
        <Column maxWidth="m">
        <div className={styles.page}>
                <Schema
                    as="webPage"
                    baseURL={baseURL}
                    title={others.title}
                    description={others.description}
                    path={others.path}
                    image={`${baseURL}/og?title=${encodeURIComponent(others.title)}`}
                    author={{
                        name: person.name,
                        url: `${baseURL}${others.path}`,
                        image: `${baseURL}${person.avatar}`,
                    }}
                />
                {others.tableOfContent.display && (
                    <Column
                        left="0"
                        style={{ top: "50%", transform: "translateY(-50%)" }}
                        position="fixed"
                        paddingLeft="24"
                        gap="32"
                        hide="s"
                    >
                        <TableOfContents structure={structure} about={others} />
                    </Column>
                )}
                <Flex className={styles.otherContainer} fillWidth direction="column" mobileDirection="column" horizontal="center">
                    {/* Achievements Section */}
                    <RevealFx delay={0.2} translateY={0.5}>
                        <section className={`${styles.section} ${styles.achievements}`} id={others.achievements.title}>
                            <div className={styles.section__header}>
                                <Heading
                                    id={others.achievements.title}
                                    variant="display-strong-m"
                                    className={styles.section__title}
                                >
                                    <hr className={styles.section__divider} />
                                    <Row align="center" center>
                                        <Icon name="achievement" size='xl' />
                                        <Text>{others.achievements.title}</Text>
                                    </Row>
                                    <hr className={styles.section__divider} />
                                </Heading>
                            </div>
                            <div className={styles.achievements__marquee}>
                                <div className={styles.marquee__container}>
                                    <div className={styles.marquee__track}>
                                        {others.achievements.items.map((achievement, index) => (
                                            <Badge
                                                key={`first-${index}`}
                                                icon="achievement"
                                                paddingLeft="16"
                                                paddingRight="20"
                                                paddingY="12"
                                                onBackground="brand-medium"
                                                background="brand-medium"
                                                arrow={true} id={`badge-${index}`}
                                                className={styles.achievement__badge}
                                            >
                                                {achievement}
                                            </Badge>
                                        ))}
                                        {/* Duplicate for seamless loop */}
                                        {others.achievements.items.map((achievement, index) => (
                                            <Badge
                                                key={`second-${index}`}
                                                icon="achievement"
                                                paddingLeft="16"
                                                paddingRight="20"
                                                paddingY="12"
                                                onBackground="brand-medium"
                                                background="brand-medium"
                                                arrow={true} id={`badge-duplicate-${index}`}
                                                className={styles.achievement__badge}
                                            >
                                                {achievement}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </RevealFx>
                    {/* Certifications Section */}
                    <RevealFx delay={0.4} translateY={0.5}>
                        <section className={`${styles.section} ${styles.certifications}`}>
                            <div className={styles.section__header}>
                                <Heading
                                    id={others.certifications.title}
                                    variant="display-strong-m"
                                    className={styles.section__title}
                                >
                                    <hr className={styles.section__divider} />
                                    <Row align="center" center>
                                        <Icon name="certificate" size='xl' />
                                        <Text paddingLeft='12'>Certifications</Text>
                                    </Row>
                                    <hr className={styles.section__divider} />
                                </Heading>
                                <div className={styles.section__subtitle}>
                                    <Text>Online Courses | Hackathons | Workshops</Text>
                                </div>
                            </div>
                            <CertificationGrid
                                certifications={others.certifications.items}
                                baseURL={baseURL}
                            />
                        </section>
                    </RevealFx>
                    {/* Contributions Section */}
                    <RevealFx delay={0.6} translateY={0.5}>
                        <section className={`${styles.section} ${styles.contributions} `}>
                            <div className={styles.section__header}>
                                <Heading
                                    id={others.contributions.title}
                                    variant="display-strong-m"
                                    className={styles.section__title}
                                >
                                    <hr className={styles.section__divider} />
                                    <Row align="center" center>
                                        <Icon name="github" size='l' />
                                        <Text paddingLeft='12'>Contributions</Text>
                                    </Row>
                                    <hr className={styles.section__divider} />
                                </Heading>
                                <div className={styles.section__subtitle}>
                                    <Text>My Independent projects & Contributions</Text>
                                </div>
                                {/* <Text className={styles.section__subtitle}>Contributions</Text> */}
                            </div>
                            <div className={styles.contributions__container}>
                                <ContributionCarousel contributions={others.contributions.items} />
                            </div>
                        </section>
                    </RevealFx>
                </Flex>
        </div>
            </Column>
    );
}

