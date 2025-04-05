import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Location, Region } from '@shared/schema';
import WorldSelector from '@/components/WorldSelector';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Search, MapPin, Upload, Image, Castle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddLocationModal } from '@/modals/AddLocationModal';
import FantasyBorder from '@/components/ui/fantasy-border';
import { useLocation, Link } from 'wouter';

export default function Locations() {
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const locationRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const queryClient = useQueryClient();

  // For URL query params
  const [locationPath] = useLocation();

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

  // Parse URL query params
  useEffect(() => {
    // Extract regionId from URL if present
    const queryPart = locationPath.includes('?') ? locationPath.split('?')[1] : '';
    const urlParams = new URLSearchParams(queryPart);
    const regionParam = urlParams.get('regionId');
    
    if (regionParam) {
      const regionId = parseInt(regionParam);
      if (!isNaN(regionId)) {
        setSelectedRegionId(regionId);
      }
    }
  }, [locationPath]);

  // Scroll to selected location when it changes
  useEffect(() => {
    if (selectedLocationId && locationRefs.current[selectedLocationId]) {
      locationRefs.current[selectedLocationId]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [selectedLocationId]);

  const handleWorldChange = (worldId: number) => {
    setCurrentWorldId(worldId);
    setSelectedRegionId(null);
    setSelectedLocationId(null);
  };

  const handleLocationAdded = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/worlds/${currentWorldId}/locations`] });
  };

  const filteredLocations = locations?.filter((location: Location) => {
    // Filter by search term
    const matchesSearch = 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.locationType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by selected region if any
    const matchesRegion = selectedRegionId ? location.regionId === selectedRegionId : true;
    
    return matchesSearch && matchesRegion;
  });

  const getRegionName = (regionId: number) => {
    const region = regions?.find((r) => r.id === regionId);
    return region ? region.name : 'Unknown Region';
  };

  const getRegionById = (regionId: number) => {
    return regions?.find((r) => r.id === regionId);
  };

  const selectedLocation = locations?.find((l) => l.id === selectedLocationId);
  const selectedLocationRegion = selectedLocation ? getRegionById(selectedLocation.regionId) : null;

  // Helper function to get marker styles based on location type
  const getMarkerStyles = (markerType: string | null) => {
    switch(markerType) {
      case 'danger':
        return 'bg-gradient-to-br from-destructive to-destructive/70 text-secondary shadow-[0_0_10px_rgba(255,50,50,0.5)]';
      case 'quest':
        return 'bg-gradient-to-br from-accent to-amber-400 text-primary shadow-[0_0_10px_rgba(255,200,50,0.5)]';
      default:
        return 'bg-gradient-to-br from-primary to-primary/70 text-secondary shadow-[0_0_8px_rgba(100,150,255,0.4)]';
    }
  };

  return (
    <>
      <WorldSelector currentWorldId={currentWorldId} onWorldChange={handleWorldChange} />
      
      <div className="my-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 rounded-lg -z-10"></div>
        
        <div className="flex justify-between items-center mb-6 px-6 py-4 border-b border-accent/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/60 text-primary shadow-[0_0_15px_rgba(255,200,50,0.3)]">
              <Castle className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-cinzel font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
              {selectedRegionId 
                ? `Locations in ${getRegionName(selectedRegionId)}`
                : 'Mystical Locations'
              }
            </h1>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-accent to-amber-400 text-primary hover:from-amber-400 hover:to-accent shadow-[0_0_10px_rgba(255,200,50,0.3)] transition-all duration-300 flex items-center"
            onClick={() => setIsAddLocationModalOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
            <span className="font-cinzel">Create Location</span>
          </Button>
        </div>
        
        <div className="flex flex-col-reverse lg:flex-row gap-6 p-4">
          {/* Locations List - Left Column */}
          <div className="lg:w-1/3">
            <div className="bg-gradient-to-b from-card/90 to-card/70 backdrop-blur-sm rounded-lg border border-accent/30 overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.1)] transform perspective-1000">
              <div className="p-4 bg-gradient-to-r from-accent/10 to-transparent border-b border-accent/20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent rounded-md"></div>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent/70" />
                  <Input 
                    className="pl-10 bg-secondary/70 border-accent/40 rounded-md focus:ring-2 focus:ring-accent/30 transition-all duration-300"
                    placeholder="Search magical places..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="h-[calc(100vh-330px)] overflow-hidden">
                {locationsLoading ? (
                  <div className="text-center py-10 animate-pulse">
                    <Sparkles className="h-10 w-10 text-accent/60 mx-auto mb-3" />
                    <p className="text-foreground/70 font-cinzel">Summoning locations...</p>
                  </div>
                ) : filteredLocations?.length === 0 ? (
                  <div className="text-center py-10 bg-gradient-to-b from-secondary/30 to-secondary/10 rounded-sm mx-4 my-4 border border-primary/10">
                    <MapPin className="h-10 w-10 text-foreground/30 mx-auto mb-3" />
                    <p className="text-foreground/70 mb-4 font-cinzel">No mystical places discovered</p>
                    <Button 
                      className="bg-gradient-to-r from-accent to-amber-400 text-primary hover:opacity-90 flex items-center shadow-[0_2px_8px_rgba(255,200,50,0.3)]"
                      onClick={() => setIsAddLocationModalOpen(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      <span className="font-cinzel">Create One</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 h-full overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
                    {filteredLocations?.map((location: Location) => (
                      <div 
                        key={location.id}
                        ref={el => locationRefs.current[location.id] = el}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                          selectedLocationId === location.id 
                            ? 'bg-gradient-to-r from-primary/90 to-primary/70 text-secondary border-primary/30 shadow-[0_0_12px_rgba(100,150,255,0.3)] scale-[1.02] -translate-y-px'
                            : 'bg-gradient-to-r from-secondary/80 to-secondary/60 hover:from-secondary/90 hover:to-secondary/70 border-accent/10 hover:border-accent/30 hover:shadow-[0_3px_10px_rgba(0,0,0,0.1)]'
                        }`}
                        onClick={() => setSelectedLocationId(location.id)}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full mr-3 flex items-center justify-center ${getMarkerStyles(location.markerType)}`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-cinzel font-semibold text-sm">{location.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/30 font-medium">
                                {location.locationType || 'Unknown'}
                              </span>
                              <span className="text-xs italic opacity-70">
                                {getRegionName(location.regionId)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Location Details - Right Column */}
          <div className="lg:w-2/3">
            <div className="bg-gradient-to-b from-card/90 to-card/70 backdrop-blur-sm rounded-lg border border-accent/30 overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.1)] h-[calc(100vh-330px)]">
              {!selectedLocationId ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <div className="relative">
                    <MapPin className="w-16 h-16 text-foreground/30 mb-4" />
                    <div className="absolute top-0 left-0 w-full h-full bg-accent/10 blur-xl rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-cinzel text-foreground/70 text-center mt-4">
                    Select a mystical location<br />from the ancient scrolls
                  </h3>
                </div>
              ) : (
                <>
                  {selectedLocation && (
                    <div className="h-full flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
                      <div className="sticky top-0 z-10 border-b border-accent/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getMarkerStyles(selectedLocation.markerType)}`}>
                                <MapPin className="h-6 w-6" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-cinzel font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                                  {selectedLocation.name}
                                </h2>
                                <div className="flex items-center text-sm text-foreground/70 mt-1">
                                  <span className="mr-2 px-2 py-0.5 rounded-full bg-secondary/30 text-xs font-medium">
                                    {selectedLocation.locationType || 'Location'}
                                  </span>
                                  <span>in</span>
                                  <Link 
                                    href={`/regions?highlight=${selectedLocation.regionId}`}
                                    className="ml-2 text-primary hover:underline flex items-center"
                                  >
                                    <Castle className="h-3 w-3 mr-1 text-accent" />
                                    {getRegionName(selectedLocation.regionId)}
                                  </Link>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300"
                              onClick={() => {
                                // TODO: Implement edit functionality
                                alert('Edit functionality will be added soon');
                              }}
                            >
                              <Sparkles className="h-3 w-3 mr-1 text-accent" />
                              <span className="font-cinzel">Edit</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <h3 className="text-xl font-cinzel bg-gradient-to-br from-primary to-accent/80 bg-clip-text text-transparent mb-3 flex items-center">
                              <span className="mr-2">Description</span>
                              <div className="h-px flex-grow bg-gradient-to-r from-primary/50 to-transparent"></div>
                            </h3>
                            <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 p-4 rounded-lg border border-primary/10 shadow-inner">
                              <p className="text-foreground/90 font-medieval">
                                {selectedLocation.description || 'No tales have been told of this mysterious place.'}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-cinzel bg-gradient-to-br from-primary to-accent/80 bg-clip-text text-transparent mb-3 flex items-center">
                              <span className="mr-2">Arcane Details</span>
                              <div className="h-px flex-grow bg-gradient-to-r from-primary/50 to-transparent"></div>
                            </h3>
                            <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 p-4 rounded-lg border border-primary/10 shadow-inner">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-foreground/70 font-cinzel">Type</p>
                                  <p className="font-medium font-medieval">{selectedLocation.locationType || 'Unknown'}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-foreground/70 font-cinzel">Marker</p>
                                  <p className="font-medium capitalize font-medieval">{selectedLocation.markerType || 'Standard'}</p>
                                </div>
                                {selectedLocation.x !== null && selectedLocation.y !== null && (
                                  <div className="col-span-2">
                                    <p className="text-sm text-foreground/70 font-cinzel">Map Coordinates</p>
                                    <p className="font-medium font-medieval">X: {selectedLocation.x}, Y: {selectedLocation.y}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 mb-4">
                          <h3 className="text-xl font-cinzel bg-gradient-to-br from-primary to-accent/80 bg-clip-text text-transparent mb-3 flex items-center">
                            <span className="mr-2">Mystical Vision</span>
                            <div className="h-px flex-grow bg-gradient-to-r from-primary/50 to-transparent"></div>
                          </h3>
                          {selectedLocation.imageUrl ? (
                            <div className="relative group">
                              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                              <div className="relative w-full h-56 rounded-lg overflow-hidden border border-accent/20">
                                <img 
                                  src={selectedLocation.imageUrl} 
                                  alt={selectedLocation.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-40 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-lg border border-primary/10 shadow-inner">
                              <div className="relative">
                                <Image className="w-12 h-12 text-foreground/30 mb-2" />
                                <div className="absolute top-0 left-0 w-full h-full bg-accent/5 blur-xl rounded-full"></div>
                              </div>
                              <p className="text-foreground/70 font-cinzel">No mystical vision available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AddLocationModal 
        isOpen={isAddLocationModalOpen} 
        onClose={() => setIsAddLocationModalOpen(false)}
        onLocationAdded={handleLocationAdded}
        worldId={currentWorldId}
        regionId={selectedRegionId || undefined}
      />
    </>
  );
}