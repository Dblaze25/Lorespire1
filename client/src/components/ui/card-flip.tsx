import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CardFlipProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  cardHeight?: string;
  cardWidth?: string;
}

const CardFlip = ({ 
  front, 
  back, 
  className, 
  cardHeight = 'h-[460px]', 
  cardWidth = 'w-[320px]' 
}: CardFlipProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className={cn(
      "card bg-card rounded-sm shadow-lg", 
      cardHeight, 
      cardWidth, 
      className, 
      {
        'flipped': isFlipped
      }
    )}>
      <div className="card-inner relative h-full w-full">
        <div className="card-front absolute w-full h-full flex flex-col rounded-sm overflow-hidden">
          {React.cloneElement(front as React.ReactElement, { flipCard })}
        </div>
        <div className="card-back absolute w-full h-full rounded-sm overflow-hidden">
          {React.cloneElement(back as React.ReactElement, { flipCard })}
        </div>
      </div>
    </div>
  );
};

export default CardFlip;
