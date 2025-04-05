import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FantasyBorder from './ui/fantasy-border';
import type { World, Region, LoreEntry } from '@shared/schema';

interface WorldSummaryProps {
  worldId: number;
}

const WorldSummary = ({ worldId }: WorldSummaryProps) => {
  const { data: world, isLoading: worldLoading } = useQuery({
    queryKey: [`/api/worlds/${worldId}`],
  });
  
  const { data: regions, isLoading: regionsLoading } = useQuery({
    queryKey: [`/api/worlds/${worldId}/regions`],
  });
  
  const { data: loreEntries, isLoading: loreLoading } = useQuery({
    queryKey: [`/api/worlds/${worldId}/lore`],
  });

  const handleShareWorld = () => {
    // Implement sharing functionality
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('World URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  if (worldLoading) {
    return (
      <FantasyBorder className="bg-card rounded-sm shadow-lg p-4 h-full">
        <h3 className="text-2xl font-cinzel font-bold mb-4 text-primary">Realm Summary</h3>
        <div>Loading world information...</div>
      </FantasyBorder>
    );
  }

  return (
    <FantasyBorder className="bg-card rounded-sm shadow-lg p-4 h-full">
      <h3 className="text-2xl font-cinzel font-bold mb-4 text-primary">Realm Summary</h3>
      
      <div className="prose prose-sm max-w-none">
        <p className="mb-4">{world?.description}</p>
        
        <div className="mb-4">
          <h4 className="text-lg font-cinzel font-semibold text-foreground mb-2">Key Regions</h4>
          <ul className="space-y-2">
            {regionsLoading ? (
              <li>Loading regions...</li>
            ) : (
              regions?.slice(0, 3).map((region: Region) => (
                <li key={region.id} className="flex items-start">
                  <svg className="h-5 w-5 text-accent flex-shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>{region.name}:</strong> {region.description}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        
        <div className="mb-4">
          <h4 className="text-lg font-cinzel font-semibold text-foreground mb-2">Important Factions</h4>
          <div className="space-y-2">
            {loreLoading ? (
              <div>Loading factions...</div>
            ) : (
              loreEntries?.filter((entry: LoreEntry) => entry.category === 'Factions & Organizations')
                .slice(0, 3)
                .map((faction: LoreEntry) => (
                  <div key={faction.id} className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span>{faction.title}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          className="w-full px-4 py-3 bg-primary text-secondary font-cinzel flex items-center justify-center rounded-sm hover:bg-primary/90 transition"
          onClick={handleShareWorld}
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share World
        </Button>
      </div>
    </FantasyBorder>
  );
};

export default WorldSummary;
