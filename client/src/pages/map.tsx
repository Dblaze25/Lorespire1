import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { World, Region, Location } from '@shared/schema';
import WorldSelector from '@/components/WorldSelector';
import { Button } from '@/components/ui/button';
import { Plus, Info, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddLocationModal } from '@/modals/AddLocationModal';
import InteractiveMap from '@/components/InteractiveMap';
import FantasyBorder from '@/components/ui/fantasy-border';

export default function Map() {
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  const { data: worlds } = useQuery({
    queryKey: ['/api/worlds'],
  });

  const { data: regions } = useQuery({
    queryKey: [`/api/worlds/${currentWorldId}/regions`],
    enabled: !!currentWorldId,
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: [`/api/worlds/${currentWorldId}/locations`],
    enabled: !!currentWorldId,
  });

  // Set initial world ID once data is loaded
  useEffect(() => {
    if (worlds && worlds.length > 0 && !currentWorldId) {
      setCurrentWorldId(worlds[0].id);
    }
  }, [worlds, currentWorldId]);

  const handleWorldChange = (worldId: number) => {
    setCurrentWorldId(worldId);
    setSelectedLocationId(null);
  };

  const handleLocationClick = (locationId: number) => {
    setSelectedLocationId(locationId);
  };

  const getSelectedLocation = () => {
    if (!selectedLocationId || !locations) return null;
    return locations.find((location: Location) => location.id === selectedLocationId);
  };

  const getRegionName = (regionId: number) => {
    if (!regions) return 'Unknown';
    const region = regions.find((r: Region) => r.id === regionId);
    return region ? region.name : 'Unknown';
  };

  const selectedLocation = getSelectedLocation();

  return (
    <>
      <WorldSelector currentWorldId={currentWorldId} onWorldChange={handleWorldChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map */}
        <div className="lg:col-span-2">
          <InteractiveMap 
            worldId={currentWorldId} 
            onLocationClick={handleLocationClick}
          />
        </div>
        
        {/* Location Details */}
        <div>
          <FantasyBorder className="bg-card p-4 h-full">
            {!selectedLocation ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <Info className="w-16 h-16 text-foreground/30 mb-4" />
                <h3 className="text-xl font-cinzel text-foreground/70 mb-4 text-center">
                  Select a location marker on the map to view details
                </h3>
                <Button 
                  className="bg-accent text-primary hover:bg-accent/90 flex items-center"
                  onClick={() => setIsAddLocationModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Location
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-cinzel font-bold text-primary">{selectedLocation.name}</h2>
                    <p className="text-sm text-foreground/70">
                      {selectedLocation.locationType} in {getRegionName(selectedLocation.regionId)}
                    </p>
                  </div>
                  <Badge 
                    className={`px-2 py-1 ${
                      selectedLocation.markerType === 'danger' ? 'bg-destructive text-secondary' :
                      selectedLocation.markerType === 'quest' ? 'bg-accent text-primary' :
                      'bg-primary text-secondary'
                    }`}
                  >
                    {selectedLocation.markerType === 'danger' ? 'Danger Zone' :
                     selectedLocation.markerType === 'quest' ? 'Quest Location' :
                     'Standard'}
                  </Badge>
                </div>
                
                {selectedLocation.imageUrl && (
                  <div className="my-4 h-48 overflow-hidden rounded-sm">
                    <img 
                      src={selectedLocation.imageUrl} 
                      alt={selectedLocation.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="my-4">
                  <h3 className="text-lg font-cinzel text-primary mb-2">Description</h3>
                  <p className="text-foreground/80">{selectedLocation.description}</p>
                </div>
                
                <div className="my-4">
                  <h3 className="text-lg font-cinzel text-primary mb-2">Coordinates</h3>
                  <div className="bg-secondary/50 p-3 rounded-sm">
                    <p className="text-foreground/80">X: {selectedLocation.x || 'Not set'}, Y: {selectedLocation.y || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="mt-6 space-x-2">
                  <Button 
                    variant="outline"
                    className="border border-accent text-accent hover:bg-accent hover:text-primary"
                  >
                    Edit Location
                  </Button>
                  <Button 
                    variant="outline"
                    className="border border-destructive text-destructive hover:bg-destructive hover:text-secondary"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </FantasyBorder>
        </div>
      </div>

      <AddLocationModal 
        isOpen={isAddLocationModalOpen} 
        onClose={() => setIsAddLocationModalOpen(false)}
        worldId={currentWorldId}
      />
    </>
  );
}
