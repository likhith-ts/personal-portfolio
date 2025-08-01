import { Heading, Flex, Text, Button, Avatar, RevealFx, Column, Badge, Row } from "@/once-ui/components";
import { Projects } from "@/components/work/Projects";
import { baseURL, routes } from "@/app/resources";
import { home, about, person, newsletter } from "@/app/resources/content";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { Meta, Schema } from "@/once-ui/modules";
import { HeroBackground } from "@/components/HeroBackground";
import { BackdropSafeRevealFx } from "@/components/BackdropSafeRevealFx";

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
      {/* Neural Network Hero Background */}
      <HeroBackground />

      {/*Hero page content */}
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
          <Column maxWidth="l">
            {home.featured.display && (
              <RevealFx fillWidth horizontal="center" paddingTop="16" paddingBottom="16" paddingLeft="12">
                <Badge background="brand-medium" paddingX="12" paddingY="4" onBackground="neutral-strong" textVariant="label-default-s" arrow={true}
                  href={home.featured.href}>
                  <Row paddingY="2">{home.featured.title}</Row>
                </Badge>
              </RevealFx>
            )}
            {/* Glassmorphism container - outside RevealFx to avoid filter conflicts */}
            <BackdropSafeRevealFx
              horizontal="start"
              translateY="4">
            <div
              className="hero-glassmorphism"
              style={{
                position: "relative",
                backdropFilter: "blur(2px)",
                backgroundColor: "rgba(9, 137, 85, 0.1)",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                padding: "32px",
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="16">
                <Heading align="center" wrap="pretty" variant="display-strong-l">
                  <div
                    style={{
                      // Remove backdrop-filter from here since it conflicts with RevealFx
                      // backdropFilter: "blur(5px)",
                      backgroundColor: "rgba(9, 137, 85, 0.2)",
                      borderRadius: "32px",
                      width: "fit-content",
                      border: "1px solid rgba(78, 212, 101, 0.4)",
                      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                      padding: "12px",
                      overflow: "hidden",
                      zIndex: 3,
                    }}
                  >
                    {home.headline}
                  </div>
                </Heading>
              </RevealFx>
              <RevealFx translateY="8" delay={0.2} fillWidth horizontal="start" paddingBottom="24">
                <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
                  {home.subline}
                </Text>
              </RevealFx>
              <RevealFx delay={0.4} horizontal="center">
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
            </div>
            </BackdropSafeRevealFx>
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
        <Projects range={[2]} />
        {newsletter.display && <Mailchimp newsletter={newsletter} />}
      </Column>
    </>
  );
}


