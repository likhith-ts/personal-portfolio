"use client";

import React from 'react';
import { Icon } from '@/once-ui/components';
import styles from './ContributionCarousel.module.scss';
import useEmblaCarousel from 'embla-carousel-react';
import { useFloating, autoUpdate, offset, flip, shift, arrow } from '@floating-ui/react';
import {
  EnhancedContributionCard,
  ContributionItem,
  truncateText,
  MAX_TITLE_WORDS,
  MAX_DESCRIPTION_WORDS
} from './EnhancedContributionCard';

interface ContributionCarouselProps {
  contributions: ContributionItem[];
  autoScroll?: boolean; // Optional prop to enable/disable autoscroll (default: false for stability)
}

export const ContributionCarousel: React.FC<ContributionCarouselProps> = ({
  contributions,
  autoScroll = false // Default to false to prevent visual glitches
}) => {// Smart infinite loop: Use original contributions for clean single-card display
  const enhancedContributions = React.useMemo(() => {
    // For single card display, use original array
    return contributions;
  }, [contributions]);

  const shouldUseManualLoop = false; // Always use Embla's built-in loop

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
    containScroll: false,
    startIndex: 0,
    slidesToScroll: 1,
    watchDrag: true,
    dragThreshold: 10,
    duration: 20,
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(false);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(false); const [selectedIndex, setSelectedIndex] = React.useState(0);
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
  }, []); const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
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
  }, [startAutoPlay, autoScroll]); const onInit = React.useCallback((emblaApi: any) => {
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);

    // Update slides in view
    const inView = emblaApi.slidesInView();
    setSlidesInView(inView);

    // For infinite loop, buttons should never be disabled
    setPrevBtnDisabled(false);
    setNextBtnDisabled(false);
  }, []); const onSelect = React.useCallback((emblaApi: any) => {
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);

    // Update slides in view
    const inView = emblaApi.slidesInView();
    setSlidesInView(inView);

    // For infinite loop, buttons should never be disabled
    setPrevBtnDisabled(false);
    setNextBtnDisabled(false);

    // Restart auto-play after manual navigation
    if (autoScroll && isAutoPlaying) {
      stopAutoPlay();
      startAutoPlay();
    }
  }, [autoScroll, isAutoPlaying, startAutoPlay, stopAutoPlay]); React.useEffect(() => {
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

    window.addEventListener('resize', handleResize); return () => {
      emblaApi.off('reInit', onInit);
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', handleUserInteraction);
      emblaApi.off('pointerUp', handleUserInteraction);
      window.removeEventListener('resize', handleResize);
      clearTimeout(startTimer); clearTimeout(resizeTimeout);
      stopAutoPlay();
    };
  }, [emblaApi, onInit, onSelect, startAutoPlay, stopAutoPlay, pauseAutoPlay, resumeAutoPlay, autoScroll]);
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
    <div className={styles.carousel} role="region" aria-label="Contributions carousel">
      <div className={styles.carousel__wrapper}>
        {/* Navigation buttons positioned beside the carousel */}
        <button
          className={`${styles.carousel__button} ${styles.carousel__button_left}`}
          onClick={() => {
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

        <div className={styles.carousel__viewport} ref={emblaRef}>
          <div className={styles.carousel__container}>
            {enhancedContributions.map((contribution, index) => {
              const isActive = index === selectedIndex;
              const isInView = slidesInView.includes(index);

              return (
                <div
                  key={`slide-${index}-${contribution.title}`}
                  className={styles.carousel__slide}
                >
                  <EnhancedContributionCard
                    contribution={contribution}
                    index={index}
                    isActive={isActive}
                    isInView={isInView}
                    isHovered={hoveredCard === index}
                    onMouseEnter={() => {
                      setHoveredCard(index);
                      if (autoScroll) pauseAutoPlay();
                    }}
                    onMouseLeave={() => {
                      setHoveredCard(null);
                      hideTooltip();
                      if (autoScroll) resumeAutoPlay();
                    }}
                    onTooltipShow={showTooltip}
                    onTooltipHide={hideTooltip}
                    styles={styles}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <button
          className={`${styles.carousel__button} ${styles.carousel__button_right}`}
          onClick={() => {
            if (autoScroll) pauseAutoPlay();
            scrollNext();
            // Resume auto-play after a delay
            if (autoScroll) setTimeout(resumeAutoPlay, 3000);
          }}
          disabled={nextBtnDisabled}
          aria-label="Next slide"
          type="button"
        >
          <Icon name="chevronRight" size="m" />
        </button>
      </div>

      {/* Controls - Only Dots, centered below */}
      <div className={styles.carousel__controls} role="group" aria-label="Carousel navigation">
        <div className={styles.carousel__dots} role="group" aria-label="Slide navigation">
          {contributions.map((_, index) => {
            return (
              <button
                key={index}
                className={`${styles.carousel__dot} ${selectedIndex === index ? styles['carousel__dot--selected'] : ''
                  }`}
                onClick={() => {
                  if (autoScroll) pauseAutoPlay();
                  scrollTo(index);
                  if (autoScroll) setTimeout(resumeAutoPlay, 3000);
                }}
                aria-label={`Go to slide ${index + 1}${selectedIndex === index ? ' (current)' : ''}`}
                type="button"
              />
            );
          })}
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
