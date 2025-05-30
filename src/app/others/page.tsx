import { Meta } from '@/once-ui/modules';
import React from 'react'
import { others } from '../resources/content';
import { baseURL } from '../resources';
import { Badge, Card, Flex, Column, Heading, Text, Grid, Line, Row, RevealFx, Icon, Button, Avatar, AvatarGroup, Scroller } from '@/once-ui/components';
import { OgCard } from '@/once-ui/components/OgCard';
import { ProjectCard } from '@/components';


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
                        <hr className='p-0 m-4' />

                        {/* <Line marginTop="16" marginBottom="16" /> */}
                    </Heading>
                    <Flex center wrap gap="16" className='max-w-3xl mx-auto px-4'>
                        {others.achievements.map((achievement, index) => (
                            <Badge key={index}
                                icon="achievement"
                                paddingLeft="12" paddingRight="16"
                                paddingY="8" onBackground="brand-medium"
                                background="brand-medium"
                                id={`arrow-badge-${index}`} arrow={true}
                            >
                                {achievement}
                            </Badge>
                        ))}
                    </Flex>
                </Column>
            </RevealFx>

            {/* Certifications Section */}
            <RevealFx delay={0.4} translateY={0.5}>
                <Column gap="4" center className='max-w-3xl top-16 mt-24 mb-24 mx-auto px-4'>
                    <Heading variant="display-strong-m"
                        padding='8' marginTop="16" marginBottom="16">
                        <Icon name="certificate" size='l' />
                        <Text> Certifications</Text>
                        <hr className='p-0 m-4' />
                        {/* <Line marginTop="16" marginBottom="16" /> */}
                    </Heading>
                    <Grid className='max-w-3xl mx-auto px-4'
                        fillWidth columns={others.certifications.length >= 3 ? "3" : others.certifications.length.toString()}
                        mobileColumns={1} tabletColumns={2} gap="16" >
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

            {/* Contribution Section */}
            <RevealFx delay={0.4} translateY={0.5}>
                <Column gap="4" center className='max-w-3xl top-16 mt-24 mb-24 mx-auto px-4'>
                    <Heading variant="display-strong-m"
                        padding='8' marginTop="16" marginBottom="16">
                        <Icon name="certificate" size='l' />
                        <Text> Contribution</Text>
                        <hr className='p-0 m-4' />
                        {/* <Line marginTop="16" marginBottom="16" /> */}
                    </Heading>
                    <Grid className='max-w-3xl mx-auto px-4'
                        fillWidth columns={1}
                        mobileColumns={1} tabletColumns={1} gap="16" >
                        <Scroller>
                            {others.contributions.map((contribution, index) => (
                                <Row gap='16' key={index} className='max-w-3xl mx-auto px-4'>
                                    <Card
                                        key={index}
                                        radius="xl-8" direction="column-reverse" border="neutral-alpha-medium"
                                        padding="16"
                                        fillWidth
                                        gap="16"
                                        center
                                    >
                                        <Column gap="2" center className='max-w-3xl mx-auto px-auto'>
                                            <ProjectCard href={contribution.link} title={contribution.title} content={''} description={contribution.description} avatars={contribution.avatars} link={contribution.link} />
                                            <Row center fillWidth paddingX="20" paddingY="4" gap="8" vertical="center">
                                                <Button id={`arrow-button-1-${index}`} href={contribution.link} variant='secondary'
                                                    size="m" arrowIcon={true}>
                                                    <Flex gap="4" vertical="center">
                                                        <Icon name={contribution.icon || "heart"} size="s" color="brand" />
                                                        <Text paddingLeft='8' variant='label-strong-s' align="center"> {contribution.project}</Text>
                                                    </Flex>
                                                </Button>
                                                <Button id={`arrow-button-2-${index}`} href={contribution.link} variant='secondary'
                                                    size="m" arrowIcon={true}>
                                                    <Flex gap="4" vertical="center">
                                                        <Avatar size="s" src={contribution.avatars[0]['src']} />
                                                        <Text paddingLeft='8' variant="label-strong-s" align="center"> {contribution.owner}</Text>
                                                    </Flex>
                                                </Button>
                                            </Row>
                                        </Column>
                                    </Card>
                                </Row>
                            ))}
                             </Scroller>
                        {/* </ScrollerAuto> */}
                    </Grid>
                </Column>
            </RevealFx>

            {/* Extra-curricular Activities */}
            {/* <RevealFx delay={0.4} translateY={0.5}>
                <Column fillWidth gap="4" center className='max-w-3xl mt-24 mb-24 mx-auto px-4'>
                    <Heading variant="display-strong-m"
                        padding='8' marginTop="16" marginBottom="16">
                        Extra-curricular Activities
                        <hr className='p-0 m-4' />
                    </Heading>

                    <Gallery></Gallery>
                </Column>
            </RevealFx> */}


        </Column >
    )
}
