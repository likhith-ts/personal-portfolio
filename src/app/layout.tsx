import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";
import classNames from "classnames";

import { Footer, Header, RouteGuard, /* DebugControls */ } from "@/components";
import { baseURL, /* effects, */ style, font, home } from "@/app/resources";

import { /* Background, */  Column, Flex, ThemeProvider, ToastProvider } from "@/once-ui/components";
// import { opacity, SpacingToken } from "@/once-ui/types";
import { Meta } from "@/once-ui/modules";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { WelcomeLoadingScreen } from "@/components/SimpleEnhancedWelcomeScreen";
import { RenderController } from "@/components/RenderController";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
// import './globals.css';

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Flex
        suppressHydrationWarning
        as="html"
        lang="en"
        background="page"
        data-neutral={style.neutral}
        data-brand={style.brand}
        data-accent={style.accent}
        data-solid={style.solid}
        data-solid-style={style.solidStyle}
        data-border={style.border}
        data-surface={style.surface}
        data-transition={style.transition}
        className={classNames(
          font.primary.variable,
          font.secondary.variable,
          font.tertiary.variable,
          font.code.variable,
        )}
      >
        <head>
          {/* Add preconnect for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const theme = localStorage.getItem('theme') || 'system';
                    const root = document.documentElement;
                    if (theme === 'system') {
                      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
                    } else {
                      root.setAttribute('data-theme', theme);
                    }
                  } catch (e) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                })();
              `,
            }}
          />
        </head>
        <ThemeProvider>
          <ToastProvider>
            <RenderController>
              <WelcomeLoadingScreen />
              <Column
                suppressHydrationWarning
                style={{ minHeight: "100vh" }}
                as="body"
                fillWidth
                margin="0"
                padding="0"
              >
                <SmoothCursor />
                <MainContentWrapper>
                  {/* DebugControls for testing welcome screen */}
                  {/* uncomment below line to use */}
                  {/* <DebugControls /> */}
                  <BackgroundEffects />
                  <Flex fillWidth minHeight="16" hide="s" />
                  <Header />
                  <Flex
                    zIndex={0}
                    fillWidth
                    paddingY="l"
                    paddingX="l"
                    horizontal="center"
                    flex={1}
                  >
                    <Flex horizontal="center" fillWidth minHeight="0">
                      <RouteGuard>{children}</RouteGuard>
                    </Flex>
                  </Flex>
                  <Footer />
                </MainContentWrapper>
              </Column>
            </RenderController>
          </ToastProvider>
        </ThemeProvider>
      </Flex>
    </>
  );
}
