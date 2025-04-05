import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { World, Creature, Region } from '@shared/schema';
import WorldSelector from '@/components/WorldSelector';
import CreatureCard from '@/components/CreatureCard';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddCreatureModal } from '@/modals/AddCreatureModal';
import FantasyBorder from '@/components/ui/fantasy-border';
import { CardCarousel, CarouselItem } from '@/components/ui/card-carousel';

export default function Bestiary() {
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  const [isAddCreatureModalOpen, setIsAddCreatureModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: worlds } = useQuery<World[]>({
    queryKey: ['/api/worlds'],
  });

  const { data: creatures, isLoading } = useQuery<Creature[]>({
    queryKey: [`/api/worlds/${currentWorldId}/creatures`],
    enabled: !!currentWorldId,
  });

  const { data: regions } = useQuery<Region[]>({
    queryKey: [`/api/worlds/${currentWorldId}/regions`],
    enabled: !!currentWorldId,
  });

  // Set initial world ID once data is loaded
  useEffect(() => {
    if (worlds && Array.isArray(worlds) && worlds.length > 0 && !currentWorldId) {
      setCurrentWorldId(worlds[0].id);
    }
  }, [worlds, currentWorldId]);

  const handleWorldChange = (worldId: number) => {
    setCurrentWorldId(worldId);
  };

  const handleCreatureAdded = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/worlds/${currentWorldId}/creatures`] });
  };

  const filteredCreatures = creatures && Array.isArray(creatures) ? creatures.filter((creature: Creature) => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         creature.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || creature.rarity === filter;
    
    return matchesSearch && matchesFilter;
  }) : [];

  return (
    <>
      <WorldSelector currentWorldId={currentWorldId} onWorldChange={handleWorldChange} />

      <FantasyBorder className="bg-card p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-3xl font-cinzel font-bold text-primary">Bestiary</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input 
                className="pl-8 bg-secondary border-accent/30"
                placeholder="Search creatures..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 bg-secondary border border-accent/30 rounded-sm text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="legendary">Legendary</option>
              </select>
              
              <Button 
                className="bg-accent text-primary hover:bg-accent/90 flex items-center whitespace-nowrap"
                onClick={() => setIsAddCreatureModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Creature
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">Loading creatures...</div>
        ) : filteredCreatures?.length === 0 ? (
          <div className="text-center py-20">
            <p className="mb-4 text-foreground/70">No creatures found. Add your first creature to the bestiary!</p>
            <Button 
              className="bg-accent text-primary hover:bg-accent/90"
              onClick={() => setIsAddCreatureModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Creature
            </Button>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-cinzel font-bold mb-4 text-primary/80">Swipe to Browse Creatures</h3>
            <div className="card-carousel-container py-4">
              <CardCarousel>
                {filteredCreatures?.map((creature: Creature) => (
                  <CarouselItem key={creature.id}>
                    <CreatureCard creature={creature} regions={regions} />
                  </CarouselItem>
                ))}
              </CardCarousel>
            </div>
          </div>
        )}
      </FantasyBorder>

      <AddCreatureModal 
        isOpen={isAddCreatureModalOpen} 
        onClose={() => setIsAddCreatureModalOpen(false)}
        onCreatureAdded={handleCreatureAdded}
        worldId={currentWorldId}
      />
    </>
  );
}
