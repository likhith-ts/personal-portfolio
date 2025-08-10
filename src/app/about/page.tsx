import {
  Avatar,
  Button,
  Column,
  Flex,
  GlitchFx,
  Heading,
  Icon,
  IconButton,
  LetterFx,
  Row,
  SmartImage,
  Tag,
  Text,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import TableOfContents from "@/components/about/TableOfContents";
import Timeline from "@/components/about/Timeline";
import { transformToTimelineEntries } from "@/components/about/timelineUtils";
import styles from "@/components/about/about.module.scss";
import { person, about, social } from "@/app/resources/content";
import React from "react";
import { Meta, Schema } from "@/once-ui/modules";
import ResumeViewer from "@/components/ResumeViewer";
import TechnicalSkills from "@/components/about/TechnicalSkills";
import Toolset from "@/components/about/Toolset";
import SoftSkills from "@/components/about/SoftSkills";

export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `${baseURL}/og?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

export default function About() {
  // Transform work and studies data into timeline entries
  const timelineEntries = transformToTimelineEntries(about)

  const structure = [
    {
      title: about.intro.title,
      display: about.intro.display,
      items: [],
    },
    {
      title: "Experience", // Combined section title
      display: about.work.display || about.studies.display,
      items: [], // No sub-items needed since we use Timeline component
    },
    {
      title: about.technical.title,
      display: about.technical.display,
      items: about.technical.skills.map((skill, index) => `skill-${skill.title}-${index}`),
    },
    {
      title: about.toolset.title,
      display: about.toolset.display,
      items: [], // Placeholder for future toolset items
    },
    {
      title: about.softskills.title,
      display: about.softskills.display,
      items: [], // Placeholder for future soft skills items
    },
  ];
  return (
    <Column maxWidth="m">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={about.title}
        description={about.description}
        path={about.path}
        image={`${baseURL}/og?title=${encodeURIComponent(about.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      {about.tableOfContent.display && (
        <Column
          left="0"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed"
          paddingLeft="24"
          gap="32"
          hide="s"
        >
          <TableOfContents structure={structure} about={about} />
        </Column>
      )}
      <Flex fillWidth align="justify" mobileDirection="column" horizontal="center">
        {about.avatar.display && (
          <Column
            className={styles.avatar}
            position="sticky"
            minWidth="160"
            paddingX="l"
            paddingBottom="xl"
            gap="m"
            flex={3}
            horizontal="center"
          >
            <GlitchFx speed="fast" continuous={false} interval={2}>
              <Avatar src={person.avatar} size="xl" />
            </GlitchFx>
            <Flex gap="8" vertical="center">
              <Icon onBackground="accent-weak" name="globe" />
              {person.location}
            </Flex>
            {person.languages.length > 0 && (
              <Flex wrap gap="8">
                {person.languages.map((language, index) => (
                  <Tag key={language} size="l">
                    {language}
                  </Tag>
                ))}
              </Flex>
            )}
          </Column>
        )}
        <Column className={styles.blockAlign} flex={9} maxWidth={40}>
          <Column
            id={about.intro.title}
            fillWidth
            minHeight="160"
            vertical="center"
            marginBottom="16"
          >
            <Flex gap="m" mobileDirection="column">
              {about.calendar.display && (
                <Flex
                  fitWidth
                  border="brand-alpha-medium"
                  className={styles.blockAlign}
                  style={{
                    backdropFilter: "blur(var(--static-space-1))",
                  }}
                  background="brand-alpha-weak"
                  radius="full"
                  padding="4"
                  gap="8"
                  marginBottom="m"
                  vertical="center"
                >
                  <Icon paddingLeft="12" name="calendar" onBackground="brand-weak" />
                  <Flex paddingX="8">Schedule a call</Flex>
                  <IconButton
                    href={about.calendar.link}
                    data-border="rounded"
                    variant="secondary"
                    icon="chevronRight"
                  />

                </Flex>
              )}
              {about.resume.display && (
                <ResumeViewer className={styles.blockAlign} />
              )}
            </Flex>
            <Heading className={styles.textAlign} variant="display-strong-xl">
              {person.name}
            </Heading>
            <Text
              className={styles.textAlign}
              variant="display-default-xs"
              onBackground="neutral-weak"
            >
              <LetterFx
                speed="medium"
                trigger="instant"
                // @ts-ignore
                charset="X$@aHz0y#?*01+"
              >
                {person.role}
              </LetterFx>
            </Text>
            {social.length > 0 && (
              <Flex className={styles.blockAlign} paddingTop="20" paddingBottom="8" gap="8" wrap horizontal="center" fitWidth data-border="rounded">
                {social.map((item) => {
                  if (!item.link) return null;
                  return (
                    <React.Fragment key={`social-${item.name}`}>
                      <Button
                        className="s-flex-hide"
                        href={item.link}
                        prefixIcon={item.icon}
                        label={item.name}
                        size="s"
                        variant="secondary"
                      />
                      <IconButton
                        className="s-flex-show"
                        size="l"
                        href={item.link}
                        icon={item.icon}
                        variant="secondary"
                      />
                    </React.Fragment>
                  );
                })}
              </Flex>
            )}
          </Column>

          {about.intro.display && (
            <Column textVariant="body-default-l" fillWidth gap="m" marginBottom="l">
              {about.intro.description}
            </Column>
          )}

          {/* Combined Experience Timeline */}
          {(about.work.display || about.studies.display) && (
            <>
              <Heading as="h2" id="Experience" variant="display-strong-s" marginBottom="m">
                <Row gap="8" fillWidth vertical="center">
                  <Icon name="calendar" size="xl" />
                  <Text> Experience</Text>
                </Row>
              </Heading>
              <Column marginBottom="48">
                <Timeline entries={timelineEntries} />
              </Column>
            </>
          )}

          {about.technical.display && (
            <>
              <Heading
                as="h2"
                id={about.technical.title}
                variant="display-strong-s"
                marginBottom="m"
              >
                <Row gap="8" fillWidth vertical="center">
                  <Icon name="tool" size="l" />
                  <Text> {about.technical.title}</Text>
                </Row>
              </Heading>
              <Column fillWidth gap="l" marginBottom="48">
                {/* Technical Skills component */}
                <TechnicalSkills skills={about.technical.skills} />
              </Column>
            </>
          )}

          {/* Toolset */}
          {about.toolset.display && (
            <>
              <Heading
                as="h2"
                id={about.toolset.title}
                variant="display-strong-s"
                marginBottom="m"
              >
                <Row gap="8" fillWidth vertical="center">
                  <Icon center align="center" name="laptopCode" size="xl" />
                  <Text> {about.toolset.title}</Text>
                </Row>
              </Heading>
              <Column fillWidth gap="l" marginBottom="48">
                <Toolset tools={about.toolset.items} />
              </Column>
            </>
          )}

          {/* Soft Skills */}
          {about.softskills.display && (
            <>
              <Heading
                as="h2"
                id={about.softskills.title}
                variant="display-strong-s"
                marginBottom="m"
              >
                <Row gap="8" fillWidth vertical="center">
                  <Icon name="heart" size="xl" />
                  <Text> {about.softskills.title}</Text>
                </Row>
              </Heading>
              <Column fillWidth gap="l" marginBottom="48">
                <SoftSkills skills={about.softskills.items} />
              </Column>
            </>
          )}

        </Column>
      </Flex>
    </Column>
  );
}
