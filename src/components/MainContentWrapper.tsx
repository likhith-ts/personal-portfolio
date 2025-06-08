'use client';

import { ReactNode } from 'react';
import { useRenderControl } from './RenderController';
import { Flex, Spinner } from '@/once-ui/components';

interface MainContentWrapperProps {
    children: ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
    const { isWelcomeComplete, shouldShowWelcome } = useRenderControl();

    console.log('MainContentWrapper render:', { isWelcomeComplete, shouldShowWelcome });

    // If we should show welcome but it's not complete, show nothing
    if (shouldShowWelcome && !isWelcomeComplete) {
        console.log('MainContentWrapper: Blocking render - welcome not complete');
        return null;
    }

    console.log('MainContentWrapper: Rendering children');
    // If welcome is complete or shouldn't show, render children
    return <>{children}</>;
}
