'use client';

import { ReactNode } from 'react';
import { useRenderControl } from './RenderController';
import { Flex, Spinner } from '@/once-ui/components';

interface MainContentWrapperProps {
    children: ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
    const { isWelcomeComplete, shouldShowWelcome } = useRenderControl();

    // If we should show welcome but it's not complete, show nothing
    if (shouldShowWelcome && !isWelcomeComplete) {
        return null;
    }

    // If welcome is complete or shouldn't show, render children
    return <>{children}</>;
}
