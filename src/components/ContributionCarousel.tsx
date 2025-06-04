"use client";

import React from 'react';
import { Card, Flex, Column, Text, Button, Icon, Avatar } from '@/once-ui/components';
import styles from './ContributionCarousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';

interface ContributionItem {
  title: string;
  description: string;
  project: string;
  owner: string;
  link: string;
  icon?: string;
  avatars: { src: string }[];
}

interface ContributionCarouselProps {
  contributions: ContributionItem[];
}

export const ContributionCarousel: React.FC<ContributionCarouselProps> = ({ 
  contributions 
}) => {  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState(0);  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
  const [tooltipType, setTooltipType] = React.useState<'title' | 'description' | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle mouse movement for tooltip positioning
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Check if text is truncated
  const isTextTruncated = React.useCallback((element: HTMLElement | null): boolean => {
    if (!element) return false;
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }, []);
  // Handle title hover
  const handleTitleHover = React.useCallback((index: number, isEntering: boolean, event?: React.MouseEvent) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    if (isEntering) {
      const titleElement = event?.currentTarget.querySelector('.' + styles.contribution__title);
      if (isTextTruncated(titleElement as HTMLElement)) {
        tooltipTimeoutRef.current = setTimeout(() => {
          setHoveredCard(index);
          setTooltipType('title');
          if (event) setTooltipPosition({ x: event.clientX, y: event.clientY });
        }, 300);
      }
    } else {
      tooltipTimeoutRef.current = setTimeout(() => {
        if (tooltipType === 'title') {
          setTooltipType(null);
        }
      }, 100);
    }
  }, [isTextTruncated, tooltipType, styles.contribution__title]);

  // Handle description hover
  const handleDescriptionHover = React.useCallback((index: number, isEntering: boolean, event?: React.MouseEvent) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    if (isEntering) {
      const descElement = event?.currentTarget.querySelector('.' + styles.contribution__description);
      if (isTextTruncated(descElement as HTMLElement)) {
        tooltipTimeoutRef.current = setTimeout(() => {
          setHoveredCard(index);
          setTooltipType('description');
          if (event) setTooltipPosition({ x: event.clientX, y: event.clientY });
        }, 300);
      }
    } else {
      tooltipTimeoutRef.current = setTimeout(() => {
        if (tooltipType === 'description') {
          setTooltipType(null);
        }
      }, 100);
    }
  }, [isTextTruncated, tooltipType, styles.contribution__description]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onInit = React.useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  const onSelect = React.useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);
  React.useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);
  return (
    <div className={styles.carousel} role="region" aria-label="Contributions carousel">
      <div className={styles.carousel__viewport} ref={emblaRef}>
        <div className={styles.carousel__container}>
          {contributions.map((contribution, index) => (            <div key={index} className={styles.carousel__slide} role="tabpanel" aria-label={`Contribution ${index + 1} of ${contributions.length}`}>              <Card
                radius="xl"
                direction="column"
                border="neutral-alpha-medium"
                padding="l"
                gap="s"
                className={styles.contribution__card}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => {
                  setHoveredCard(null);
                  setTooltipType(null);
                }}
                onMouseMove={handleMouseMove}
              >
                {/* Header */}
                <Column gap="xs" fillWidth>                  <div 
                    onMouseEnter={(e) => handleTitleHover(index, true, e)}
                    onMouseLeave={() => handleTitleHover(index, false)}
                  >
                    <Text 
                      variant="heading-strong-s" 
                      align="center"
                      wrap="balance"
                      className={styles.contribution__title}
                    >
                      {contribution.title}
                    </Text>
                  </div>
                  
                  {contribution.avatars?.length > 0 && (
                    <Flex fillWidth horizontal="center" paddingTop="xs">
                      <div className={styles.contribution__avatars} role="group" aria-label="Contributors">
                        {contribution.avatars.slice(0, 3).map((avatar, avatarIndex) => (
                          <Avatar 
                            key={avatarIndex}
                            size="xs" 
                            src={avatar.src}
                            className={styles.contribution__avatar}
                          />
                        ))}
                        {contribution.avatars.length > 3 && (
                          <div className={styles.contribution__avatar_more} aria-label={`${contribution.avatars.length - 3} more contributors`}>
                            +{contribution.avatars.length - 3}
                          </div>
                        )}
                      </div>
                    </Flex>
                  )}
                </Column>

                {/* Content */}
                <Column gap="xs" fillWidth className={styles.contribution__content}>                  <div 
                    onMouseEnter={(e) => handleDescriptionHover(index, true, e)}
                    onMouseLeave={() => handleDescriptionHover(index, false)}
                  >
                    <Text 
                      variant="body-default-xs" 
                      align="center"
                      onBackground="neutral-weak"
                      wrap="pretty"
                      className={styles.contribution__description}
                    >
                      {contribution.description}
                    </Text>
                  </div>
                </Column>{/* Actions */}
                <Flex 
                  gap="s" 
                  wrap 
                  horizontal="center" 
                  fillWidth
                  className={styles.contribution__actions}
                >
                  <Button 
                    href={contribution.link} 
                    variant="secondary"
                    size="s"
                    className={styles.contribution__button}
                    aria-label={`View ${contribution.project} project`}
                  >
                    <Flex gap="xs" vertical="center">
                      <Icon name={contribution.icon || "heart"} size="xs" />
                      <Text variant="label-strong-s">{contribution.project}</Text>
                    </Flex>
                  </Button>
                  
                  <Button 
                    href={contribution.link} 
                    variant="secondary"
                    size="s"
                    className={styles.contribution__button}
                    aria-label={`View ${contribution.owner}'s profile`}
                  >
                    <Flex gap="xs" vertical="center">
                      <Avatar size="xs" src={contribution.avatars[0]?.src} />
                      <Text variant="label-strong-s">{contribution.owner}</Text>
                    </Flex>
                  </Button>                </Flex>                {/* Tooltip overlay */}
                {hoveredCard === index && tooltipType && (
                  <div 
                    className={`${styles.text__tooltip} ${styles['text__tooltip--visible']}`}
                    style={{
                      left: tooltipPosition.x,
                      top: tooltipPosition.y,
                      transform: 'translate(-50%, calc(-100% - 12px))'
                    }}
                  >
                    {tooltipType === 'title' ? (
                      <p className={styles.tooltip__title}>{contribution.title}</p>
                    ) : (
                      <p className={styles.tooltip__text}>{contribution.description}</p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.carousel__controls} role="group" aria-label="Carousel navigation">
        <div className={styles.carousel__buttons}>
          <button
            className={styles.carousel__button}
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            aria-label="Previous slide"
            type="button"
          >
            <Icon name="chevronLeft" size="m" />
          </button>
          <button
            className={styles.carousel__button}
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            aria-label="Next slide"
            type="button"
          >
            <Icon name="chevronRight" size="m" />
          </button>
        </div>        <div className={styles.carousel__dots} role="group" aria-label="Slide navigation">          {contributions.map((_, index) => (
            <button
              key={index}
              className={`${styles.carousel__dot} ${
                index === selectedIndex ? styles['carousel__dot--selected'] : ''
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}${index === selectedIndex ? ' (current)' : ''}`}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
