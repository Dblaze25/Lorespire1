import React from 'react';
import { Link } from 'wouter';
import { User } from 'lucide-react';
import CardFlip from './ui/card-flip';
import FantasyBorder from './ui/fantasy-border';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Spell, Character } from '@shared/schema';

interface SpellCardProps {
  spell: Spell;
  characters?: Character[];
}

const SpellCard = ({ spell, characters }: SpellCardProps) => {
  // Find the creator character if creatorCharacterId is present
  const getCreator = () => {
    if (!spell.creatorCharacterId || !characters || characters.length === 0) return null;
    return characters.find(char => char.id === spell.creatorCharacterId);
  };
  
  const getSpellSchoolColor = (school: string | null) => {
    if (!school) return 'bg-primary text-secondary-light';
    
    switch (school.toLowerCase()) {
      case 'evocation':
        return 'bg-destructive text-secondary-light';
      case 'abjuration':
        return 'bg-[#1976D2] text-secondary-light'; // blue
      case 'necromancy':
        return 'bg-[#9C27B0] text-secondary-light'; // purple
      case 'transmutation':
        return 'bg-[#2E7D32] text-secondary-light'; // success/green
      case 'enchantment':
        return 'bg-[#E91E63] text-secondary-light'; // pink
      case 'divination':
        return 'bg-[#00BCD4] text-foreground'; // cyan
      case 'illusion':
        return 'bg-[#673AB7] text-secondary-light'; // deep purple
      case 'conjuration':
        return 'bg-[#FF9800] text-foreground'; // orange
      default:
        return 'bg-primary text-secondary-light';
    }
  };

  // Card front component
  const CardFront = ({ flipCard }: { flipCard?: () => void }) => (
    <FantasyBorder className="h-full w-full flex flex-col rounded-sm overflow-hidden">
      <div className="h-32 overflow-hidden relative">
        <img
          src={spell.imageUrl || '/placeholder-creature.svg'}
          className="w-full h-full object-cover"
          alt={spell.name || 'Spell'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/placeholder-creature.svg';
          }}
        />
        <div className="absolute top-0 left-0 w-full flex justify-between items-center py-1 px-2 bg-foreground/50">
          <Badge className={getSpellSchoolColor(spell.school)}>
            {spell.school || 'Unknown'}
          </Badge>
          <Badge className="bg-foreground text-secondary-light">
            Level {spell.level || '?'}
          </Badge>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h4 className="text-xl font-cinzel font-bold text-primary mb-2">{spell.name}</h4>
        <div className="grid grid-cols-2 gap-1 text-xs mb-2">
          <div>
            <span className="font-semibold">Casting Time:</span> {spell.castingTime}
          </div>
          <div>
            <span className="font-semibold">Range:</span> {spell.range}
          </div>
          <div>
            <span className="font-semibold">Components:</span> {spell.components}
          </div>
          <div>
            <span className="font-semibold">Duration:</span> {spell.duration}
          </div>
        </div>
        <p className="text-sm text-foreground/80 line-clamp-4">{spell.description?.substring(0, 100)}...</p>
        <div className="mt-auto text-right">
          <Button
            onClick={flipCard}
            variant="outline"
            className="px-3 py-1 text-sm border border-accent text-accent hover:bg-accent hover:text-primary rounded-sm transition"
          >
            Full Details
          </Button>
        </div>
      </div>
    </FantasyBorder>
  );

  // Card back component
  const CardBack = ({ flipCard }: { flipCard?: () => void }) => (
    <FantasyBorder className="h-full w-full p-5 rounded-sm bg-card">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xl font-cinzel font-bold text-primary">{spell.name}</h4>
        <Badge className={getSpellSchoolColor(spell.school)}>
          {spell.school || 'Unknown'} {spell.level || '?'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Casting Time</h5>
          <p className="text-foreground/80">{spell.castingTime}</p>
        </div>
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Range</h5>
          <p className="text-foreground/80">{spell.range}</p>
        </div>
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Components</h5>
          <p className="text-foreground/80">{spell.components}</p>
        </div>
        <div>
          <h5 className="font-cinzel font-semibold text-foreground">Duration</h5>
          <p className="text-foreground/80">{spell.duration}</p>
        </div>
      </div>
      
      <div className="mb-3 text-sm">
        <h5 className="font-cinzel font-semibold text-foreground">Description</h5>
        <p className="text-foreground/80 mt-1">{spell.description}</p>
      </div>
      
      {spell.creatorCharacterId && (
        <div className="mb-3 text-sm">
          <h5 className="font-cinzel font-semibold text-foreground flex items-center">
            <User className="h-3.5 w-3.5 mr-1" />
            Creator
          </h5>
          <div className="text-foreground/80 mt-1 flex items-center">
            {(() => {
              const creator = getCreator();
              return creator ? (
                <Link href={`/characters?highlight=${creator.id}`} className="hover:text-accent underline underline-offset-2 transition-colors">
                  {creator.name}
                </Link>
              ) : 'Unknown wizard';
            })()}
          </div>
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

  return (
    <CardFlip
      front={<CardFront />}
      back={<CardBack />}
      cardHeight="h-[460px]"
      cardWidth="w-[320px]"
    />
  );
};

export default SpellCard;
