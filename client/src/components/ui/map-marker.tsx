import React from 'react';
import { cn } from '@/lib/utils';

type MarkerType = 'standard' | 'quest' | 'danger';

interface MapMarkerProps {
  type?: MarkerType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  title?: string;
}

const getMarkerClasses = (type: MarkerType) => {
  switch (type) {
    case 'standard':
      return 'bg-primary border-accent';
    case 'quest':
      return 'bg-accent border-primary';
    case 'danger':
      return 'bg-destructive border-accent';
    default:
      return 'bg-primary border-accent';
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-6 h-6';
    case 'lg':
      return 'w-8 h-8';
    default:
      return 'w-6 h-6';
  }
};

const MapMarker = ({ 
  type = 'standard', 
  size = 'md', 
  className, 
  onClick,
  title 
}: MapMarkerProps) => {
  return (
    <div 
      className={cn(
        'map-marker rounded-full border-2 cursor-pointer', 
        getMarkerClasses(type),
        getSizeClasses(size),
        className
      )}
      onClick={onClick}
      title={title}
    />
  );
};

export default MapMarker;
