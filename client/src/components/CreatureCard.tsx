import React from 'react';
import { MapPin } from 'lucide-react';
import { Link } from 'wouter';
import CardFlip from './ui/card-flip';
import FantasyBorder from './ui/fantasy-border';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Creature, Region } from '@shared/schema';

interface CreatureCardProps {
  creature: Creature;
  regions?: Region[];
}

const CreatureCard = ({ creature, regions }: CreatureCardProps) => {
  const getRegionName = (regionId: number | null) => {
    if (!regionId || !regions) return 'Various';
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'Various';
  };

  const getRarityBadgeClass = (rarity: string | null) => {
    if (!rarity) return 'bg-primary/70';
    
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'bg-primary/70';
      case 'rare':
        return 'bg-[#FFA000]/70'; // warning
      case 'legendary':
        return 'bg-destructive/70';
      default:
        return 'bg-primary/70';
    }
  };

  const getElementBadgeClass = (element: string | null) => {
    if (!element) return 'bg-primary';
    
    switch (element.toLowerCase()) {
      case 'fire':
        return 'bg-destructive';
      case 'nature':
        return 'bg-[#2E7D32]'; // success
      case 'shadow':
        return 'bg-foreground';
      default:
        return 'bg-primary';
    }
  };
  
  // Helper function to render abilities safely
  const renderAbilities = () => {
    if (!creature.abilities || typeof creature.abilities !== 'object') {
      return <div className="col-span-6 text-center">No abilities data</div>;
    }
    
    try {
      // Standard D&D ability scores
      const abilityNames = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
      const abilityMap = creature.abilities as Record<string, number>;
      
      return abilityNames.map(ability => {
        const score = abilityMap[ability] || "-";
        return (
          <div key={ability}>
            <div className="font-bold">{ability}</div>
            <div>{score}</div>
          </div>
        );
      });
    } catch (error) {
      console.error("Error rendering abilities:", error);
      return <div className="col-span-6 text-center">Error displaying abilities</div>;
    }
  };

  // Card front component
  const CardFront = ({ flipCard }: { flipCard?: () => void }) => (
    <FantasyBorder className="h-full w-full flex flex-col rounded-sm overflow-hidden">
      <div className="h-48 overflow-hidden relative">
        <img
          src={creature.imageUrl || '/placeholder-creature.svg'}
          className="w-full h-full object-cover"
          alt={creature.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/placeholder-creature.svg';
          }}
        />
        <div className={`absolute top-0 left-0 w-full py-1 ${getRarityBadgeClass(creature.rarity || 'common')} text-secondary-light text-center font-cinzel`}>
          {creature.rarity ? creature.rarity.charAt(0).toUpperCase() + creature.rarity.slice(1) : 'Common'}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h4 className="text-xl font-cinzel font-bold text-primary mb-2">{creature.name}</h4>
        <div className="flex items-center mb-3 text-sm">
          <span className="mr-3">CR {creature.challengeRating}</span>
          <Badge className="px-2 py-0.5 bg-secondary-dark text-foreground rounded-sm mr-2">
            {creature.creatureType}
          </Badge>
          {creature.elementType && (
            <Badge className={`px-2 py-0.5 ${getElementBadgeClass(creature.elementType)} text-secondary-light rounded-sm`}>
              {creature.elementType}
            </Badge>
          )}
        </div>
        <p className="text-sm text-foreground/80">{creature.description}</p>
        <div className="mt-auto flex justify-between items-center">
          <div className="flex items-center text-sm text-foreground/70">
            <MapPin className="h-4 w-4 mr-1" />
            {creature.regionId ? (
              <Link href={`/regions?highlight=${creature.regionId}`} className="hover:text-accent underline underline-offset-2 transition-colors">
                {getRegionName(creature.regionId)}
              </Link>
            ) : (
              getRegionName(creature.regionId)
            )}
          </div>
          <Button
            onClick={flipCard}
            variant="outline"
            className="px-3 py-1 text-sm border border-accent text-accent hover:bg-accent hover:text-primary rounded-sm transition"
          >
            Stats
          </Button>
        </div>
      </div>
    </FantasyBorder>
  );

  // Card back component
  const CardBack = ({ flipCard }: { flipCard?: () => void }) => (
    <FantasyBorder className="h-full w-full p-5 rounded-sm bg-card">
      <h4 className="text-xl font-cinzel font-bold text-primary mb-3">{creature.name}</h4>
      
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Armor Class</h5>
          <p className="text-foreground/80">{creature.armorClass} (Natural Armor)</p>
        </div>
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Hit Points</h5>
          <p className="text-foreground/80">{creature.hitPoints}</p>
        </div>
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Speed</h5>
          <p className="text-foreground/80">{creature.speed}</p>
        </div>
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Challenge Rating</h5>
          <p className="text-foreground/80">{creature.challengeRating} ({calculateXP(creature.challengeRating)} XP)</p>
        </div>
      </div>
      
      <div className="mb-3">
        <h5 className="font-cinzel font-semibold text-foreground">Abilities</h5>
        <div className="grid grid-cols-6 gap-1 text-center text-sm">
          {renderAbilities()}
        </div>
      </div>
      
      {creature.specialAttacks && creature.specialAttacks.length > 0 && (
        <div className="mb-3 text-sm">
          <h5 className="font-cinzel font-semibold text-foreground">Special Attacks</h5>
          {creature.specialAttacks.map((attack, index) => (
            <p key={index} className="text-foreground/80">{attack}</p>
          ))}
        </div>
      )}
      
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

  // Helper function to calculate XP from CR
  const calculateXP = (cr: string | null): string => {
    if (!cr) return 'Unknown';
    
    const xpValues: {[key: string]: number} = {
      '0': 10,
      '1/8': 25,
      '1/4': 50,
      '1/2': 100,
      '1': 200,
      '2': 450,
      '3': 700,
      '4': 1100,
      '5': 1800,
      '6': 2300,
      '8': 3900,
      '9': 5000,
      '10': 5900,
      '12': 8400,
      '15': 13000,
      '20': 25000,
      '24': 62000,
      '30': 155000
    };
    
    return xpValues[cr]?.toLocaleString() || 'Unknown';
  };

  return (
    <CardFlip
      front={<CardFront />}
      back={<CardBack />}
      cardHeight="h-[460px]"
      cardWidth="w-[320px]"
    />
  );
};

export default CreatureCard;
