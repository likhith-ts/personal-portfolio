"use client";

import React from "react";
import { Column, Flex, Text, Icon } from "@/once-ui/components";
import styles from "./Toolset.module.scss";

interface ToolsetItem {
    name: string;
    icon: string;
}

interface ToolsetProps {
    tools: ToolsetItem[];
}

const Toolset: React.FC<ToolsetProps> = ({ tools }) => {
    return (
        <Column fillWidth gap="m">
            <Text onBackground="neutral-weak">My commonly used Dev Tools in which I'm proficient & productive with.</Text>
            <div className={styles.marqueeContainer}>
                <div className={styles.marqueeTrack}>
                    {/* Duplicate the tools array to create seamless scrolling */}
                    {[...tools, ...tools, ...tools].map((tool, index) => (
                        <div key={`${tool.name}-${index}`} className={styles.toolItem}>
                            <Icon
                                name={tool.icon}
                                size="xl"
                                className={styles.toolIcon}
                            />
                            <Text
                                variant="body-default-s"
                                className={styles.toolName}
                                onBackground="neutral-medium"
                            >
                                {tool.name}
                            </Text>
                        </div>
                    ))}
                </div>
            </div>
        </Column>
    );
};

export default Toolset;
