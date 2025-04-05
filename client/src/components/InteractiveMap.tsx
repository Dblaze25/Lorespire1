import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FantasyBorder from './ui/fantasy-border';
import MapMarker from './ui/map-marker';
import type { Location, Region } from '@shared/schema';

// Set default icon paths for leaflet markers
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface InteractiveMapProps {
  worldId: number;
  onLocationClick?: (locationId: number) => void;
}

// Custom marker icons
const createMarkerIcon = (type: 'standard' | 'quest' | 'danger') => {
  let color = '#7B2D26'; // primary - standard
  if (type === 'quest') color = '#D4AF37'; // accent
  if (type === 'danger') color = '#C62828'; // danger

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #F5E6C8;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Map control component for zoom in/out
const MapControls = () => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute bottom-4 right-4 flex space-x-2 z-[1000]">
      <Button
        className="w-10 h-10 bg-foreground/80 text-secondary-light rounded-full flex items-center justify-center hover:bg-foreground"
        onClick={handleZoomIn}
      >
        <Plus className="h-6 w-6" />
      </Button>
      <Button
        className="w-10 h-10 bg-foreground/80 text-secondary-light rounded-full flex items-center justify-center hover:bg-foreground"
        onClick={handleZoomOut}
      >
        <Minus className="h-6 w-6" />
      </Button>
    </div>
  );
};

const InteractiveMap = ({ worldId, onLocationClick }: InteractiveMapProps) => {
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: [`/api/worlds/${worldId}/locations`],
  });

  const { data: regions = [] } = useQuery<Region[]>({
    queryKey: [`/api/worlds/${worldId}/regions`],
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Use standard OpenStreetMap tiles as a fallback
  const mapTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  // Get region name by ID
  const getRegionName = (regionId: number) => {
    if (!regions || regions.length === 0) return 'Unknown';
    const region = regions.find((r: Region) => r.id === regionId);
    return region ? region.name : 'Unknown';
  };

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
    if (onLocationClick) {
      onLocationClick(location.id);
    }
  };

  return (
    <FantasyBorder className="bg-card rounded-sm shadow-lg p-4 relative">
      <h3 className="text-2xl font-cinzel font-bold mb-4 text-primary">World Map</h3>
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-sm">
        {/* Replace with actual fantasy map implementation */}
        <MapContainer 
          center={[50, 50]} 
          zoom={4} 
          style={{ height: '100%', width: '100%' }}
          minZoom={2}
          maxZoom={6}
          zoomControl={false}
        >
          {/* Use OpenStreetMap tiles */}
          <TileLayer
            url={mapTileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {!locationsLoading && locations && locations.length > 0 && locations.map((location: Location) => (
            <Marker
              key={location.id}
              position={[location.x || 50, location.y || 50]} // Use actual coordinates from data
              icon={createMarkerIcon(location.markerType as 'standard' | 'quest' | 'danger')}
              eventHandlers={{
                click: () => handleMarkerClick(location),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-cinzel font-bold text-primary">{location.name}</h4>
                  <p className="text-sm">{location.description}</p>
                  <p className="text-xs mt-2 text-foreground/70">
                    Region: {getRegionName(location.regionId)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          <MapControls />
        </MapContainer>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="inline-flex items-center px-3 py-1 bg-primary text-secondary-light text-sm rounded-sm">
          <span className="w-3 h-3 bg-primary rounded-full border-2 border-accent mr-2"></span>
          Cities
        </Badge>
        <Badge className="inline-flex items-center px-3 py-1 bg-destructive text-secondary-light text-sm rounded-sm">
          <span className="w-3 h-3 bg-destructive rounded-full border-2 border-accent mr-2"></span>
          Danger Zones
        </Badge>
        <Badge className="inline-flex items-center px-3 py-1 bg-accent text-primary text-sm rounded-sm">
          <span className="w-3 h-3 bg-accent rounded-full border-2 border-primary mr-2"></span>
          Quest Locations
        </Badge>
      </div>
    </FantasyBorder>
  );
};

export default InteractiveMap;
