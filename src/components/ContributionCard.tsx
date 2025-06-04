"use client";

import {
  Column,
  Flex,
  Heading,
  SmartLink,
  Text,
  AvatarGroup,
} from "@/once-ui/components";

interface ContributionCardProps {
  href: string;
  title: string;
  description: string;
  avatars: { src: string }[];
  link: string;
}

export const ContributionCard: React.FC<ContributionCardProps> = ({
  href,
  title,
  description,
  avatars,
  link,
}) => {  return (
    <Column 
      fillWidth 
      gap="m" 
      style={{ flex: 1 }}
    >
      {/* Title Section */}
      <Flex fillWidth horizontal="center">
        <Heading 
          as="h3" 
          wrap="balance" 
          variant="heading-strong-m"
          align="center"
          style={{ lineHeight: '1.2' }}
        >
          {title}
        </Heading>
      </Flex>

      {/* Content Section */}
      <Column gap="s" fillWidth style={{ flex: 1 }}>
        {/* Avatars */}
        {avatars?.length > 0 && (
          <Flex fillWidth horizontal="center">
            <AvatarGroup avatars={avatars} size="s" reverse />
          </Flex>
        )}
        
        {/* Description */}
        {description?.trim() && (
          <Text 
            wrap="pretty" 
            variant="body-default-s" 
            onBackground="neutral-weak"
            align="center"
            style={{ lineHeight: '1.4' }}
          >
            {description}
          </Text>
        )}
      </Column>

      {/* Action Links */}
      <Flex gap="xs" wrap horizontal="center" fillWidth>
        {href && (
          <SmartLink
            suffixIcon="arrowRight"
            style={{ margin: "0", width: "fit-content" }}
            href={href}
          >
            <Text variant="body-default-xs">Read more</Text>
          </SmartLink>
        )}
        {link && (
          <SmartLink
            suffixIcon="arrowUpRightFromSquare"
            style={{ margin: "0", width: "fit-content" }}
            href={link}
          >
            <Text variant="body-default-xs">View project</Text>
          </SmartLink>
        )}
      </Flex>
    </Column>
  );
};
