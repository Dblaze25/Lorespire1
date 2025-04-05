import React, { useState, useCallback, ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

type EmblaOptionsType = {
  loop?: boolean;
  align?: 'start' | 'center' | 'end';
  skipSnaps?: boolean;
  draggable?: boolean;
  dragFree?: boolean;
  [key: string]: any;
};
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CardCarouselProps = {
  children: ReactNode;
  options?: EmblaOptionsType;
  className?: string;
};

export function CardCarousel({ children, options, className = '' }: CardCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    skipSnaps: false,
    ...options,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>
      <Button
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function CarouselItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 flex-[0_0_90%] md:flex-[0_0_40%] lg:flex-[0_0_30%] mx-4 ${className}`}>
      {children}
    </div>
  );
}