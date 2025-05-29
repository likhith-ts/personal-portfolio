import { Meta } from '@/once-ui/modules';
import React from 'react'
import { others } from '../resources/content';
import { baseURL } from '../resources';
import { Badge, Card, Flex, Column, Heading, Text, Grid, Line, Row, RevealFx, Icon, Button, Avatar } from '@/once-ui/components';
import { OgCard } from '@/once-ui/components/OgCard';
import Gallery from '../gallery/page';
import { CursorCard } from '@/once-ui/components/CursorCard';
import { Media } from '@/once-ui/components/Media';

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
    return (
        <Column gap="4" fillWidth className="max-w-6xl mx-auto px-4">

            {/* Achievements Section */}
            <RevealFx delay={0.2} translateY={0.5}>
                <Column gap="4" center className='max-w-3xl  mx-auto px-4'>
                    <Heading variant="display-strong-m"
                        padding='8' marginTop="16" marginBottom="16">
                        <Icon name="achievement" size='l' />
                        <Text> Achievements</Text>
                        <hr className='p-0 m-4'/>

                        {/* <Line marginTop="16" marginBottom="16" /> */}
                    </Heading>
                    <Flex center wrap gap="16" className='max-w-3xl mx-auto px-4'>
                        {others.achievements.map((achievement, index) => (
                            <Badge key={index}
                                icon="achievement" arrow={false} paddingLeft="12" paddingRight="16" paddingY="8" onBackground="brand-medium" background="brand-medium">
                                {achievement}
                            </Badge>
                        ))}
                    </Flex>
                </Column>
            </RevealFx>

            {/* <Line marginY="16" className='marginTop-16'/> */}

            {/* Certifications Section */}
            <RevealFx delay={0.4} translateY={0.5}>
                <Column gap="4" center className='max-w-3xl top-16 mt-24 mb-24 mx-auto px-4'>
                    <Heading variant="display-strong-m"
                        padding='8' marginTop="16" marginBottom="16">
                        <Icon name="certificate" size='l' />
                        <Text> Certifications</Text>
                        <hr className='p-0 m-4'/>
                        {/* <Line marginTop="16" marginBottom="16" /> */}
                    </Heading>
                    <Grid className='max-w-3xl mx-auto px-4'
                        fillWidth columns={3} mobileColumns={1} tabletColumns={2} gap="16" >
                        {others.certifications.map((cert, index) => (
                            <OgCard
                                key={index}
                                ogData={{
                                    title: `🏆 ${cert.name}`,
                                    description: cert.issuer,
                                    image: '/images/projects/project-01/cover-04.jpg',
                                    // image: { cert.image }
                                    // link: { cert.link }
                                }} />
                        ))}
                    </Grid>
                </Column>
            </RevealFx>

            {/* <Line marginTop="16" marginBottom="16" /> */}


            {/* Extra-curricular Activities */}
            <RevealFx delay={0.4} translateY={0.5}>
                <Column fillWidth gap="4" center className='max-w-3xl mt-24 mb-24 mx-auto px-4'>
                    <Heading variant="display-strong-m"
                        padding='8' marginTop="16" marginBottom="16">
                        Extra-curricular Activities
                        <hr className='p-0 m-4'/>
                        {/* <Line marginTop="16" marginBottom="16" /> */}
                    </Heading>
                    {/* <Masonry>
                    <Column breakpointCols={breakpointColumnsObj}
                        className={styles.masonryGrid}
                        columnClassName={styles.masonryGridColumn}
                    >
                        {others.activities.map((activity, index) => (
                            <Card key={index} padding="4">
                                <Text weight="semibold">{activity.title}</Text>
                                <Text size="sm" color="gray.600">{activity.description}</Text>
                            </Card>
                        ))}
                    </Column>
                </Masonry> */}
                    <Gallery></Gallery>
                </Column>
            </RevealFx>
            {/* <Line marginTop="16" marginBottom="16" /> */}

            {/* Contributions */}
            <Column gap="4" center className='max-w-3xl mt-24 mb-24 mx-auto px-4'>
                <Heading variant="display-strong-m"
                    padding='8' marginTop="16" marginBottom="16">
                    Contributions
                    {/* <Line marginTop="16" marginBottom="16" /> */}
                    <hr className='p-0 m-4'/>
                </Heading>
                    {/* <Row fitWidth center> */}
                <Grid as='div' className='max-w-3xl mx-auto px-4'
                        columns={others.contributions.length >= 3 ? "3" : others.contributions.length.toString()} 
                        mobileColumns="1" 
                        tabletColumns={others.contributions.length >= 2 ? "2" : "1"} 
                        gap="64"
                        >
                    {others.contributions.map((contribution, index) => (
                        // <Row maxWidth={24} key={index} fillWidth gap="16" center>
                        <Card
                            key={index}
                            // href={contribution.link}
                            // target="_blank"
                            radius="l-4" direction="column" border="neutral-alpha-medium"
                            padding="16"
                            fillWidth
                            gap="8"
                            center
                        >
                            <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
                                <Avatar size="xs" src="/images/avatar.jpg" />
                                <Text variant="label-default-s">{contribution.owner}</Text>
                            </Row>
                            <Media
                                border="neutral-alpha-weak"
                                sizes="400px"
                                fillWidth
                                aspectRatio="4 / 3"
                                radius="l"
                                alt="Proxima b"
                                src="/images/github.png"
                            />
                            <Icon name={contribution.icon || "heart"} size="xl" color="brand" />
                            <Column gap="2" center>
                                <Badge background="brand-weak" onBackground="brand-strong">
                                <Text weight="strong" align="center">{contribution.project}</Text>
                                    {contribution.count}
                                </Badge>
                                <Text size="s" color="gray.600" align="center">{contribution.description}</Text>
                            </Column>
                        </Card>
                        // </Row>
                    ))}
                </Grid>
                    {/* </Row> */}
            </Column>
        </Column >
    )
}
