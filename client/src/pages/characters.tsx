import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { World, Character, Region } from '@shared/schema';
import WorldSelector from '@/components/WorldSelector';
import CharacterCard from '@/components/CharacterCard';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddCharacterModal } from '@/modals/AddCharacterModal';
import FantasyBorder from '@/components/ui/fantasy-border';
import { CardCarousel, CarouselItem } from '@/components/ui/card-carousel';
import { useLocation } from 'wouter';

export default function Characters() {
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  const [isAddCharacterModalOpen, setIsAddCharacterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [highlightedCharacterId, setHighlightedCharacterId] = useState<number | null>(null);
  const carouselRef = useRef<any>(null);
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const { data: worlds } = useQuery({
    queryKey: ['/api/worlds'],
  });

  const { data: characters, isLoading } = useQuery<Character[]>({
    queryKey: [`/api/worlds/${currentWorldId}/characters`],
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
  
  // Parse query parameters for any highlighted character
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const characterId = params.get('highlight');
    if (characterId) {
      setHighlightedCharacterId(parseInt(characterId, 10));
    }
  }, [location]);
  
  // Scroll to highlighted character once data is loaded
  useEffect(() => {
    if (highlightedCharacterId && characters && Array.isArray(characters)) {
      const characterIndex = characters.findIndex(c => c.id === highlightedCharacterId);
      if (characterIndex !== -1 && carouselRef.current?.api) {
        // Wait for carousel to fully initialize
        setTimeout(() => {
          carouselRef.current.api.scrollTo(characterIndex);
        }, 500);
      }
    }
  }, [highlightedCharacterId, characters]);

  const handleWorldChange = (worldId: number) => {
    setCurrentWorldId(worldId);
  };

  const handleCharacterAdded = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/worlds/${currentWorldId}/characters`] });
  };

  const filteredCharacters = characters && Array.isArray(characters) ? characters.filter((character: Character) => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          character.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || character.characterType === filter;
    
    return matchesSearch && matchesFilter;
  }) : [];

  return (
    <>
      <WorldSelector currentWorldId={currentWorldId} onWorldChange={handleWorldChange} />

      <FantasyBorder className="bg-card p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-3xl font-cinzel font-bold text-primary">Characters & NPCs</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input 
                className="pl-8 bg-secondary border-accent/30"
                placeholder="Search characters..." 
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
                <option value="all">All Types</option>
                <option value="npc">NPCs</option>
                <option value="ally">Allies</option>
                <option value="villain">Villains</option>
              </select>
              
              <Button 
                className="bg-accent text-primary hover:bg-accent/90 flex items-center whitespace-nowrap"
                onClick={() => setIsAddCharacterModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Character
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">Loading characters...</div>
        ) : filteredCharacters?.length === 0 ? (
          <div className="text-center py-20">
            <p className="mb-4 text-foreground/70">No characters found. Create your first character!</p>
            <Button 
              className="bg-accent text-primary hover:bg-accent/90"
              onClick={() => setIsAddCharacterModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Character
            </Button>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-cinzel font-bold mb-4 text-primary/80">Swipe to Browse Characters</h3>
            <div className="card-carousel-container py-4">
              <CardCarousel ref={carouselRef}>
                {filteredCharacters?.map((character: Character) => (
                  <CarouselItem key={character.id}>
                    <div className={`${character.id === highlightedCharacterId ? 'ring-4 ring-primary ring-offset-4 ring-offset-background rounded-lg transition-all duration-300' : ''}`}>
                      <CharacterCard character={character} regions={regions} />
                    </div>
                  </CarouselItem>
                ))}
              </CardCarousel>
            </div>
          </div>
        )}
      </FantasyBorder>

      <AddCharacterModal 
        isOpen={isAddCharacterModalOpen} 
        onClose={() => setIsAddCharacterModalOpen(false)}
        onCharacterAdded={handleCharacterAdded}
        worldId={currentWorldId}
      />
    </>
  );
}
