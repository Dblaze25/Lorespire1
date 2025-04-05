import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { World } from '@shared/schema';

interface WorldSelectorProps {
  currentWorldId: number;
  onWorldChange: (worldId: number) => void;
}

const WorldSelector = ({ currentWorldId, onWorldChange }: WorldSelectorProps) => {
  const [location] = useLocation();
  const { data: worlds, isLoading } = useQuery({
    queryKey: ['/api/worlds'],
  });

  const currentWorld = worlds?.find((world: World) => world.id === currentWorldId);
  
  const tabs = [
    { id: 'overview', label: 'Overview', path: '/' },
    { id: 'map', label: 'Map', path: '/map' },
    { id: 'regions', label: 'Regions', path: '/regions' },
    { id: 'npcs', label: 'NPCs', path: '/characters' },
    { id: 'bestiary', label: 'Bestiary', path: '/bestiary' },
    { id: 'spellbook', label: 'Spellbook', path: '/spellbook' },
    { id: 'lore', label: 'Lore', path: '/lore' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-cinzel font-bold text-primary">
          {currentWorld?.name || 'Loading world...'}
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center space-x-2 px-4 py-2 bg-foreground/10 hover:bg-foreground/20 rounded-sm text-foreground font-cinzel">
              <span>Change World</span>
              <ChevronDown className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select World</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoading ? (
              <DropdownMenuItem>Loading...</DropdownMenuItem>
            ) : (
              worlds?.map((world: World) => (
                <DropdownMenuItem
                  key={world.id}
                  onClick={() => onWorldChange(world.id)}
                  className={world.id === currentWorldId ? 'bg-accent/20' : ''}
                >
                  {world.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex overflow-x-auto py-3 space-x-4 scrollbar-thin">
        {tabs.map((tab) => (
          <Link key={tab.id} href={tab.path}>
            <Button
              variant={isActivePath(tab.path) ? "default" : "outline"}
              className={`px-4 py-2 whitespace-nowrap font-cinzel ${
                isActivePath(tab.path)
                  ? "bg-primary text-secondary"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorldSelector;
