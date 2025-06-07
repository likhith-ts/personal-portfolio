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
}) => {  // Ensure we have enough slides for smooth infinite looping
  const enhancedContributions = React.useMemo(() => {
    if (contributions.length <= 2) {
      // For very few slides, duplicate them to ensure smooth infinite scrolling
      return [...contributions, ...contributions, ...contributions];
    }
    return contributions;
  }, [contributions]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    startIndex: 0,
    slidesToScroll: 1,
    watchDrag: true,
    duration: 20, // Even smoother transition duration
    inViewThreshold: 0.5, // More responsive detection of slides in view
  });
    const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(false);  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [slidesInView, setSlidesInView] = React.useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
  const [tooltipType, setTooltipType] = React.useState<'title' | 'description' | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);
  const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
  }, [emblaApi]);  // Auto-play functionality
  const startAutoPlay = React.useCallback(() => {
    if (!emblaApi || !isAutoPlaying) return;
    
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    
    autoPlayTimeoutRef.current = setTimeout(() => {
      if (emblaApi && isAutoPlaying) {
        // Use the built-in scrollNext which handles looping automatically
        emblaApi.scrollNext();
        startAutoPlay(); // Continue the loop
      }
    }, 4000); // Auto-advance every 4 seconds (slightly faster)
  }, [emblaApi, isAutoPlaying]);

  const stopAutoPlay = React.useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  }, []);

  const pauseAutoPlay = React.useCallback(() => {
    setIsAutoPlaying(false);
    stopAutoPlay();
  }, [stopAutoPlay]);

  const resumeAutoPlay = React.useCallback(() => {
    setIsAutoPlaying(true);
    startAutoPlay();
  }, [startAutoPlay]);  const onInit = React.useCallback((emblaApi: any) => {
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    
    // Update slides in view
    const inView = emblaApi.slidesInView();
    setSlidesInView(inView);
    
    // For infinite loop, buttons should never be disabled
    setPrevBtnDisabled(false);
    setNextBtnDisabled(false);
  }, []);

  const onSelect = React.useCallback((emblaApi: any) => {
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    
    // Update slides in view
    const inView = emblaApi.slidesInView();
    setSlidesInView(inView);
    
    // For infinite loop, buttons should never be disabled
    setPrevBtnDisabled(false);
    setNextBtnDisabled(false);
    
    // Restart auto-play after manual navigation
    if (isAutoPlaying) {
      stopAutoPlay();
      startAutoPlay();
    }
  }, [isAutoPlaying, startAutoPlay, stopAutoPlay]);  React.useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
    
    // Handle user interactions to pause auto-play
    const handleUserInteraction = () => {
      pauseAutoPlay();
      setTimeout(resumeAutoPlay, 5000); // Resume after 5 seconds of inactivity
    };
    
    emblaApi.on('pointerDown', handleUserInteraction);
    emblaApi.on('pointerUp', handleUserInteraction);
    
    // Start auto-play when carousel is ready
    const startTimer = setTimeout(() => {
      startAutoPlay();
    }, 1000); // Delay start to ensure carousel is fully initialized
    
    // Handle window resize with throttling for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (emblaApi) {
          emblaApi.reInit();
        }
      }, 250); // Throttle resize events
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      emblaApi.off('reInit', onInit);
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', handleUserInteraction);
      emblaApi.off('pointerUp', handleUserInteraction);
      window.removeEventListener('resize', handleResize);
      clearTimeout(startTimer);
      clearTimeout(resizeTimeout);
      stopAutoPlay();
    };
  }, [emblaApi, onInit, onSelect, startAutoPlay, stopAutoPlay, pauseAutoPlay, resumeAutoPlay]);
  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, []);
  return (
    <div className={styles.carousel} role="region" aria-label="Contributions carousel">      <div className={styles.carousel__viewport} ref={emblaRef}>
        <div className={styles.carousel__container}>
          {enhancedContributions.map((contribution, index) => {
            const isActive = index === selectedIndex;
            const isInView = slidesInView.includes(index);
            
            return (
              <div 
                key={`slide-${index}-${contribution.title}`} 
                className={`${styles.carousel__slide} ${
                  isActive ? styles['carousel__slide--active'] : ''
                } ${isInView ? styles['carousel__slide--in-view'] : ''}`}
                role="tabpanel" 
                aria-label={`Contribution ${index + 1} of ${enhancedContributions.length}`}
              ><Card
                radius="xl"
                direction="column"
                border="neutral-alpha-medium"
                className={`${styles.contribution__card} ${
                  hoveredCard === index ? styles['contribution__card--hovered'] : ''
                }`}
                onMouseEnter={() => {
                  setHoveredCard(index);
                  pauseAutoPlay();
                }}
                onMouseLeave={() => {
                  setHoveredCard(null);
                  setTooltipType(null);
                  resumeAutoPlay();
                }}
                onMouseMove={handleMouseMove}
              >
                {/* Card Header with Gradient Background */}
                <div className={styles.contribution__header}>
                  <div className={styles.contribution__header_content}>
                    <div 
                      onMouseEnter={(e) => handleTitleHover(index, true, e)}
                      onMouseLeave={() => handleTitleHover(index, false)}
                      className={styles.contribution__title_wrapper}
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
                    
                    {/* Project Badge */}
                    <div className={styles.contribution__project_badge}>
                      <Icon name={contribution.icon || "heart"} size="xs" />
                      <Text variant="label-strong-xs" className={styles.contribution__project_name}>
                        {contribution.project}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Contributors Section */}
                {contribution.avatars?.length > 0 && (
                  <div className={styles.contribution__contributors}>
                    <Text variant="label-default-xs" className={styles.contribution__contributors_label}>
                      Contributors
                    </Text>
                    <div className={styles.contribution__avatars} role="group" aria-label="Contributors">
                      {contribution.avatars.slice(0, 4).map((avatar, avatarIndex) => (
                        <div key={avatarIndex} className={styles.contribution__avatar_wrapper}>
                          <Avatar 
                            size="s" 
                            src={avatar.src}
                            className={styles.contribution__avatar}
                          />
                        </div>
                      ))}
                      {contribution.avatars.length > 4 && (
                        <div 
                          className={styles.contribution__avatar_more} 
                          aria-label={`${contribution.avatars.length - 4} more contributors`}
                        >
                          <Text variant="label-strong-xs">+{contribution.avatars.length - 4}</Text>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description Section */}
                <div className={styles.contribution__body}>
                  <div 
                    onMouseEnter={(e) => handleDescriptionHover(index, true, e)}
                    onMouseLeave={() => handleDescriptionHover(index, false)}
                    className={styles.contribution__description_wrapper}
                  >
                    <Text 
                      variant="body-default-s" 
                      align="left"
                      onBackground="neutral-weak"
                      wrap="pretty"
                      className={styles.contribution__description}
                    >
                      {contribution.description}
                    </Text>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className={styles.contribution__footer}>
                  <Button 
                    href={contribution.link} 
                    variant="secondary"
                    size="s"
                    fillWidth
                    className={styles.contribution__main_button}
                    aria-label={`View ${contribution.project} contribution`}
                  >
                    <Flex gap="xs" vertical="center">
                      <Icon name="externalLink" size="xs" />
                      <Text variant="label-strong-s">View Contribution</Text>
                    </Flex>
                  </Button>
                  
                  <Button 
                    href={contribution.link} 
                    variant="tertiary"
                    size="s"
                    className={styles.contribution__owner_button}
                    aria-label={`View ${contribution.owner}'s profile`}
                  >
                    <Flex gap="xs" vertical="center">
                      <Avatar size="xs" src={contribution.avatars[0]?.src} />
                      <Text variant="label-default-s">{contribution.owner}</Text>
                    </Flex>
                  </Button>
                </div>

                {/* Tooltip overlay */}
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
                )}              </Card>
            </div>
            );
          })}
        </div>
      </div>      {/* Controls - Vertical Stack: Dots first, then Buttons */}
      <div className={styles.carousel__controls} role="group" aria-label="Carousel navigation">        <div className={styles.carousel__dots} role="group" aria-label="Slide navigation">
          {contributions.map((_, index) => {
            // Calculate the active dot based on the original contributions array
            const isDuplicatedScenario = enhancedContributions.length > contributions.length;
            const activeDotIndex = isDuplicatedScenario 
              ? selectedIndex % contributions.length
              : selectedIndex;
            
            return (
              <button
                key={index}
                className={`${styles.carousel__dot} ${
                  activeDotIndex === index ? styles['carousel__dot--selected'] : ''
                }`}
                onClick={() => {
                  pauseAutoPlay();
                  scrollTo(index);
                  // Resume auto-play after a delay
                  setTimeout(resumeAutoPlay, 3000);
                }}
                aria-label={`Go to slide ${index + 1}${activeDotIndex === index ? ' (current)' : ''}`}
                type="button"
              />
            );
          })}
        </div>
          <div className={styles.carousel__buttons}>
          <button
            className={styles.carousel__button}            onClick={() => {
              pauseAutoPlay();
              scrollPrev();
              // Resume auto-play after a delay
              setTimeout(resumeAutoPlay, 3000);
            }}
            disabled={prevBtnDisabled}
            aria-label="Previous slide"
            type="button"
          >
            <Icon name="chevronLeft" size="m" />
          </button>
          <button
            className={styles.carousel__button}            onClick={() => {
              pauseAutoPlay();
              scrollNext();
              // Resume auto-play after a delay
              setTimeout(resumeAutoPlay, 3000);
            }}
            disabled={nextBtnDisabled}
            aria-label="Next slide"
            type="button"
          >
            <Icon name="chevronRight" size="m" />
          </button>
        </div>
      </div>
    </div>
  );
};
