import { Heading, Flex, Text, Button, Avatar, RevealFx, Column, Badge, Row } from "@/once-ui/components";
import { Projects } from "@/components/work/Projects";
import { baseURL, routes } from "@/app/resources";
import { home, about, person, newsletter } from "@/app/resources/content";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { Meta, Schema } from "@/once-ui/modules";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
  });
}

export default function Home() {
  return (
    <>
    <Column maxWidth="m" gap="xl" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`${baseURL}/og?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }} />
      <Column fillWidth paddingY="24" gap="m">
        <Column maxWidth="s">
          {home.featured.display && (
            <RevealFx fillWidth horizontal="start" paddingTop="16" paddingBottom="32" paddingLeft="12">
              <Badge background="brand-alpha-weak" paddingX="12" paddingY="4" onBackground="neutral-strong" textVariant="label-default-s" arrow={true}
                href={home.featured.href}>
                <Row paddingY="2">{home.featured.title}</Row>
              </Badge>
            </RevealFx>
          )}
          <RevealFx translateY="4" fillWidth horizontal="start" paddingBottom="16">
            <Heading wrap="balance" variant="display-strong-l">
              {home.headline}
            </Heading>
          </RevealFx>
          <RevealFx translateY="8" delay={0.2} fillWidth horizontal="start" paddingBottom="32">
            <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
              {home.subline}
            </Text>
          </RevealFx>
          <RevealFx paddingTop="12" delay={0.4} horizontal="start" paddingLeft="12">
            <Button
              id="about"
              data-border="rounded"
              href={about.path}
              variant="secondary"
              size="m"
              arrowIcon
            >
              <Flex gap="8" vertical="center">
                {about.avatar.display && (
                  <Avatar
                    style={{ marginLeft: "-0.75rem", marginRight: "0.25rem" }}
                    src={person.avatar}
                    size="m" />
                )}
                {about.title}
              </Flex>
            </Button>
          </RevealFx>
        </Column>
      </Column>
      <RevealFx translateY="16" delay={0.6}>
        <Projects range={[1, 1]} />
      </RevealFx>
      {routes["/blog"] && (
        <Flex fillWidth gap="24" mobileDirection="column">
          <Flex flex={1} paddingLeft="l" paddingTop="24">
            <Heading as="h2" variant="display-strong-xs" wrap="balance">
              Latest from the blog
            </Heading>
          </Flex>
          <Flex flex={3} paddingX="20">
            <Posts range={[1, 2]} columns="2" />
          </Flex>
        </Flex>
      )}
      {/* <Row maxWidth={24}>
<Card radius="l-4" direction="column" border="neutral-alpha-medium">
  <Row fillWidth paddingX="20" paddingY="12" gap="8" vertical="center">
    <Avatar size="xs" src="/images/avatar.jpg"/>
    <Text variant="label-default-s">Lorant One</Text>
  </Row>
  <Media
    border="neutral-alpha-weak"
    sizes="400px"
    fillWidth
    aspectRatio="4 / 3"
    radius="l"
    alt="Proxima b"
    src="https://youtu.be/ye0fsgO0NyA?si=eyJKboM_iTR7mX39"
  />
  <Column fillWidth paddingX="20" paddingY="24" gap="8">
    <Text variant="body-default-xl">Proxima b</Text>
    <Text onBackground="neutral-weak" variant="body-default-s">
      A planet so cruel on the surface, but once you explore what's underneath, you'll question
      everything you know. Yet, you vibe with it.
    </Text>
  </Column>
  <Line background="neutral-alpha-medium" />
  <Row
    paddingX="20" paddingY="12" gap="8" vertical="center"
    textVariant="label-default-s" onBackground="neutral-medium"
  >
    <Icon name="like" size="s" onBackground="neutral-strong" />
    34
    <Icon name="chat" size="s" onBackground="neutral-strong" marginLeft="24" />
    5
  </Row>
</Card>
</Row> */}
      <Projects range={[2]} />
      {newsletter.display && <Mailchimp newsletter={newsletter} />}
    </Column></>

    
  );
}


