"use client";

import React from 'react';
import { Card, Flex, Column, Text, Button, Icon, Avatar } from '@/once-ui/components';
import styles from './ContributionCarousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import { useFloating, autoUpdate, offset, flip, shift, arrow } from '@floating-ui/react';

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
  autoScroll?: boolean; // Optional prop to enable/disable autoscroll (default: false for stability)
}

// Utility function to truncate text to a specific word count
const truncateText = (text: string, maxWords: number): { truncated: string; isTruncated: boolean } => {
  const words = text.split(' ');
  if (words.length <= maxWords) {
    return { truncated: text, isTruncated: false };
  }
  return { 
    truncated: words.slice(0, maxWords).join(' ') + '...', 
    isTruncated: true 
  };
};

// Constants for uniform text lengths
const MAX_TITLE_WORDS = 6;
const MAX_DESCRIPTION_WORDS = 15;

export const ContributionCarousel: React.FC<ContributionCarouselProps> = ({ 
  contributions,
  autoScroll = false // Default to false to prevent visual glitches
}) => {// Smart infinite loop: Only duplicate if we have few items, otherwise use Embla's built-in loop
  const enhancedContributions = React.useMemo(() => {
    // If we have very few items (1-3), we need duplicates for smooth infinite scroll
    // If we have enough items (4+), Embla's built-in loop works fine
    if (contributions.length <= 3) {
      // For 1-3 items, create enough duplicates to fill the viewport and provide smooth scrolling
      const duplicatesNeeded = Math.max(6, contributions.length * 3);
      const sets = Math.ceil(duplicatesNeeded / contributions.length);
      return Array(sets).fill(contributions).flat();
    }
    // For 4+ items, use original array - Embla's loop will handle it smoothly
    return contributions;
  }, [contributions]);

  const shouldUseManualLoop = contributions.length <= 3;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: !shouldUseManualLoop, // Use Embla's loop for 4+ items, manual for fewer
    align: 'center',
    skipSnaps: false,
    dragFree: false,
    containScroll: shouldUseManualLoop ? false : 'trimSnaps',
    startIndex: shouldUseManualLoop ? Math.floor(enhancedContributions.length / 2) : 0,
    slidesToScroll: 1,
    watchDrag: true,
    dragThreshold: 10,
    duration: 25,
    inViewThreshold: 0.7,
  });
    const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(false);  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [slidesInView, setSlidesInView] = React.useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(autoScroll); // Initialize based on autoScroll prop
  
  // Floating UI tooltip state
  const [tooltipContent, setTooltipContent] = React.useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const arrowRef = React.useRef(null);

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    open: tooltipOpen,
    onOpenChange: setTooltipOpen,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef })
    ],
    whileElementsMounted: autoUpdate,
  });
  // Handle mouse movement for tooltip positioning
  const showTooltip = React.useCallback((content: string, element: HTMLElement) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipContent(content);
      refs.setReference(element);
      setTooltipOpen(true);
    }, 300);
  }, [refs]);
  const hideTooltip = React.useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipOpen(false);
      setTooltipContent(null);
    }, 100);
  }, []);  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  // Seamless infinite loop handler - only for small item counts
  const handleInfiniteLoop = React.useCallback(() => {
    if (!emblaApi || !shouldUseManualLoop) return;
    
    const currentIndex = emblaApi.selectedScrollSnap();
    const originalLength = contributions.length;
    const totalSlides = enhancedContributions.length;
    
    // Calculate the safe zone (middle portion of duplicated slides)
    const safeZoneStart = Math.floor(totalSlides * 0.25);
    const safeZoneEnd = Math.floor(totalSlides * 0.75);
    
    // If we're outside the safe zone, jump to equivalent position in safe zone
    if (currentIndex < safeZoneStart) {
      const equivalentIndex = currentIndex + originalLength;
      emblaApi.scrollTo(equivalentIndex, false); // false = no animation
    } else if (currentIndex > safeZoneEnd) {
      const equivalentIndex = currentIndex - originalLength;
      emblaApi.scrollTo(equivalentIndex, false); // false = no animation
    }
  }, [emblaApi, shouldUseManualLoop, contributions.length, enhancedContributions.length]);
  const scrollTo = React.useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);  // Auto-play functionality
  const startAutoPlay = React.useCallback(() => {
    if (!emblaApi || !isAutoPlaying || !autoScroll) return; // Only start if autoScroll is enabled
    
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    
    autoPlayTimeoutRef.current = setTimeout(() => {
      if (emblaApi && isAutoPlaying && autoScroll) { // Check autoScroll again
        emblaApi.scrollNext();
        startAutoPlay(); // Continue the loop
      }
    }, 4000); // Auto-advance every 4 seconds
  }, [emblaApi, isAutoPlaying, autoScroll]);

  const stopAutoPlay = React.useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  }, []);
  const pauseAutoPlay = React.useCallback(() => {
    if (!autoScroll) return; // No-op if autoScroll is disabled
    setIsAutoPlaying(false);
    stopAutoPlay();
  }, [stopAutoPlay, autoScroll]);

  const resumeAutoPlay = React.useCallback(() => {
    if (!autoScroll) return; // No-op if autoScroll is disabled
    setIsAutoPlaying(true);
    startAutoPlay();
  }, [startAutoPlay, autoScroll]);const onInit = React.useCallback((emblaApi: any) => {
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    
    // Update slides in view
    const inView = emblaApi.slidesInView();
    setSlidesInView(inView);
    
    // For infinite loop, buttons should never be disabled
    setPrevBtnDisabled(false);
    setNextBtnDisabled(false);
  }, []);  const onSelect = React.useCallback((emblaApi: any) => {
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    
    // Update slides in view
    const inView = emblaApi.slidesInView();
    setSlidesInView(inView);
    
    // For infinite loop, buttons should never be disabled
    setPrevBtnDisabled(false);
    setNextBtnDisabled(false);
    
    // Handle seamless infinite loop only for small item counts
    if (shouldUseManualLoop) {
      setTimeout(handleInfiniteLoop, 50);
    }
      // Restart auto-play after manual navigation
    if (autoScroll && isAutoPlaying) {
      stopAutoPlay();
      startAutoPlay();
    }
  }, [autoScroll, isAutoPlaying, startAutoPlay, stopAutoPlay, shouldUseManualLoop, handleInfiniteLoop]);React.useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
      // Handle user interactions to pause auto-play (only if autoScroll is enabled)
    const handleUserInteraction = () => {
      if (autoScroll) {
        pauseAutoPlay();
        setTimeout(resumeAutoPlay, 5000); // Resume after 5 seconds of inactivity
      }
    };
    
    emblaApi.on('pointerDown', handleUserInteraction);
    emblaApi.on('pointerUp', handleUserInteraction);
    
    // Start auto-play when carousel is ready (only if autoScroll is enabled)
    const startTimer = setTimeout(() => {
      if (autoScroll) {
        startAutoPlay();
      }
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
    
    window.addEventListener('resize', handleResize);    return () => {
      emblaApi.off('reInit', onInit);
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', handleUserInteraction);
      emblaApi.off('pointerUp', handleUserInteraction);
      window.removeEventListener('resize', handleResize);
      clearTimeout(startTimer);      clearTimeout(resizeTimeout);
      stopAutoPlay();
    };
  }, [emblaApi, onInit, onSelect, handleInfiniteLoop, shouldUseManualLoop, startAutoPlay, stopAutoPlay, pauseAutoPlay, resumeAutoPlay, autoScroll]);
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
        <div className={styles.carousel__container}>          {enhancedContributions.map((contribution, index) => {
            const isActive = index === selectedIndex;
            const isInView = slidesInView.includes(index);
            
            // Get truncated text
            const titleData = truncateText(contribution.title, MAX_TITLE_WORDS);
            const descriptionData = truncateText(contribution.description, MAX_DESCRIPTION_WORDS);
            
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
                }`}                onMouseEnter={() => {
                  setHoveredCard(index);
                  if (autoScroll) pauseAutoPlay();
                }}
                onMouseLeave={() => {
                  setHoveredCard(null);
                  hideTooltip();
                  if (autoScroll) resumeAutoPlay();
                }}
              >                {/* Card Header with Gradient Background */}
                <div className={styles.contribution__header}>
                  <div className={styles.contribution__header_content}>
                    <div className={styles.contribution__title_wrapper}>
                      <Text 
                        variant="heading-strong-s" 
                        align="center"
                        wrap="balance"
                        className={styles.contribution__title}                        onMouseEnter={(e) => {
                          if (titleData.isTruncated) {
                            showTooltip(contribution.title, e.currentTarget as HTMLElement);
                          }
                        }}
                        onMouseLeave={hideTooltip}
                      >
                        {titleData.truncated}
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
                      {contribution.avatars.slice(0, 4).map((avatar: { src: string }, avatarIndex: number) => (
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
                )}                {/* Description Section */}
                <div className={styles.contribution__body}>
                  <div className={styles.contribution__description_wrapper}>
                    <Text 
                      variant="body-default-s" 
                      align="left"
                      onBackground="neutral-weak"
                      wrap="pretty"
                      className={styles.contribution__description}                      onMouseEnter={(e) => {
                        if (descriptionData.isTruncated) {
                          showTooltip(contribution.description, e.currentTarget as HTMLElement);
                        }
                      }}
                      onMouseLeave={hideTooltip}
                    >
                      {descriptionData.truncated}
                    </Text>
                  </div>
                </div>                {/* Footer Actions */}
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
              </Card>
            </div>
            );
          })}
        </div>
      </div>{/* Controls - Vertical Stack: Dots first, then Buttons */}
      <div className={styles.carousel__controls} role="group" aria-label="Carousel navigation">        <div className={styles.carousel__dots} role="group" aria-label="Slide navigation">
          {contributions.map((_, index) => {
            // Calculate active dot based on scenario
            let activeDotIndex;
            if (shouldUseManualLoop) {
              // For manual loop, map back to original index
              activeDotIndex = selectedIndex % contributions.length;
            } else {
              // For Embla's built-in loop, use direct index
              activeDotIndex = selectedIndex;
            }
            
            return (
              <button
                key={index}
                className={`${styles.carousel__dot} ${
                  activeDotIndex === index ? styles['carousel__dot--selected'] : ''
                }`}                onClick={() => {
                  if (autoScroll) pauseAutoPlay();
                  if (shouldUseManualLoop) {
                    // Navigate to equivalent position in the safe zone
                    const safeIndex = Math.floor(enhancedContributions.length / 2) + index;
                    scrollTo(safeIndex);
                  } else {
                    // Direct navigation for built-in loop
                    scrollTo(index);
                  }
                  if (autoScroll) setTimeout(resumeAutoPlay, 3000);
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
              if (autoScroll) pauseAutoPlay();
              scrollPrev();
              // Resume auto-play after a delay
              if (autoScroll) setTimeout(resumeAutoPlay, 3000);
            }}
            disabled={prevBtnDisabled}
            aria-label="Previous slide"
            type="button"
          >
            <Icon name="chevronLeft" size="m" />
          </button>
          <button
            className={styles.carousel__button}            onClick={() => {
              if (autoScroll) pauseAutoPlay();
              scrollNext();
              // Resume auto-play after a delay
              if (autoScroll) setTimeout(resumeAutoPlay, 3000);
            }}
            disabled={nextBtnDisabled}
            aria-label="Next slide"
            type="button"
          >
            <Icon name="chevronRight" size="m" />          </button>
        </div>
      </div>

      {/* Floating UI Tooltip */}
      {tooltipOpen && tooltipContent && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={styles.floating__tooltip}
        >
          <div ref={arrowRef} className={styles.floating__tooltip_arrow} />
          {tooltipContent}
        </div>
      )}
    </div>
  );
};
