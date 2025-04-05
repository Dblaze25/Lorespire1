import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'wouter';
import CardFlip from './ui/card-flip';
import FantasyBorder from './ui/fantasy-border';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Character, Region } from '@shared/schema';

interface CharacterCardProps {
  character: Character;
  regions?: Region[];
}

const CharacterCard = ({ character, regions }: CharacterCardProps) => {
  const getRegionName = (regionId: number | null) => {
    if (!regionId || !regions) return 'Unknown';
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'Unknown';
  };

  const getCharacterTypeBadgeClass = (type: string | null) => {
    if (!type) return 'bg-primary text-secondary-light';
    
    switch (type.toLowerCase()) {
      case 'npc':
        return 'bg-primary text-secondary-light';
      case 'villain':
        return 'bg-destructive text-secondary-light';
      case 'ally':
        return 'bg-[#2E7D32] text-secondary-light';
      default:
        return 'bg-primary text-secondary-light';
    }
  };

  // Card front component
  const CardFront = ({ flipCard }: { flipCard?: () => void }) => (
    <FantasyBorder className="h-full w-full flex flex-col rounded-sm overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img
          src={character.imageUrl || '/placeholder-creature.svg'}
          className="w-full h-full object-cover"
          alt={character.name || 'Character'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/placeholder-creature.svg';
          }}
        />
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2 flex items-center">
          <Badge className={`px-2 py-1 text-xs mr-2 ${getCharacterTypeBadgeClass(character.characterType)}`}>
            {character.characterType ? character.characterType.toUpperCase() : 'NPC'}
          </Badge>
          <Badge className="px-2 py-1 text-xs bg-secondary-dark text-foreground">
            {character.race || 'Unknown'}
          </Badge>
        </div>
        <h4 className="text-xl font-cinzel font-bold text-primary mb-2">{character.name}</h4>
        <p className="text-sm text-foreground/80 mb-4">{character.description}</p>
        <div className="mt-auto flex justify-between items-center">
          <div className="flex items-center text-sm text-foreground/70">
            <MapPin className="h-4 w-4 mr-1" />
            {character.regionId ? (
              <Link href={`/regions?highlight=${character.regionId}`} className="hover:text-accent underline underline-offset-2 transition-colors">
                {getRegionName(character.regionId)}
              </Link>
            ) : (
              getRegionName(character.regionId)
            )}
          </div>
          <Button
            onClick={flipCard}
            variant="outline"
            className="px-3 py-1 text-sm border border-accent text-accent hover:bg-accent hover:text-primary rounded-sm transition"
          >
            Details
          </Button>
        </div>
      </div>
    </FantasyBorder>
  );

  // Card back component
  const CardBack = ({ flipCard }: { flipCard?: () => void }) => (
    <FantasyBorder className="h-full w-full p-5 rounded-sm bg-card">
      <h4 className="text-xl font-cinzel font-bold text-primary mb-3">{character.name}</h4>
      
      <div className="space-y-3 text-sm mb-4">
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Appearance</h5>
          <p className="text-foreground/80">{character.appearance}</p>
        </div>
        
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Personality</h5>
          <p className="text-foreground/80">{character.personality}</p>
        </div>
        
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Abilities</h5>
          <ul className="list-disc list-inside text-foreground/80">
            {character.abilities?.map((ability, index) => (
              <li key={index}>{ability}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-auto text-right">
        <Button
          onClick={flipCard}
          variant="outline"
          className="px-3 py-1 text-sm border border-accent text-accent hover:bg-accent hover:text-primary rounded-sm transition"
        >
          Back
        </Button>
      </div>
    </FantasyBorder>
  );

  return (
    <CardFlip
      front={<CardFront />}
      back={<CardBack />}
      cardHeight="h-[460px]"
      cardWidth="w-[320px]"
    />
  );
};

export default CharacterCard;
