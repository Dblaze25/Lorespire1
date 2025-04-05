import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Skull, 
  Book, 
  Map, 
  MapPin, 
  BookOpen,
  Settings
} from "lucide-react";
import React, { useState, useEffect } from "react";
import FantasyBorder from "@/components/ui/fantasy-border";
import { useQuery } from "@tanstack/react-query";
import type { World } from "@shared/schema";

export default function Home() {
  const { data: worlds } = useQuery<World[]>({
    queryKey: ['/api/worlds'],
  });
  
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  
  // Set initial world ID once data is loaded
  useEffect(() => {
    if (worlds && worlds.length > 0) {
      setCurrentWorldId(worlds[0].id);
    }
  }, [worlds]);
  
  // Navigation sections
  const navSections = [
    {
      title: "Characters",
      icon: <Users className="h-12 w-12 text-accent" />,
      description: "Manage your campaign's NPCs and important characters",
      path: "/characters"
    },
    {
      title: "Bestiary",
      icon: <Skull className="h-12 w-12 text-accent" />,
      description: "Track monsters and creatures in your world",
      path: "/bestiary"
    },
    {
      title: "Spellbook",
      icon: <Book className="h-12 w-12 text-accent" />,
      description: "Browse magical spells and abilities",
      path: "/spellbook"
    },
    {
      title: "World Map",
      icon: <Map className="h-12 w-12 text-accent" />,
      description: "Visualize your campaign world and important locations",
      path: "/map"
    },
    {
      title: "Regions",
      icon: <MapPin className="h-12 w-12 text-accent" />,
      description: "Manage kingdoms, cities, and other regions",
      path: "/regions"
    },
    {
      title: "Lore",
      icon: <BookOpen className="h-12 w-12 text-accent" />,
      description: "Record the history and knowledge of your world",
      path: "/lore"
    },
    {
      title: "Settings",
      icon: <Settings className="h-12 w-12 text-accent" />,
      description: "Customize appearance and world settings",
      path: "/settings"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-cinzel mb-4 text-primary">
          {worlds && worlds.length > 0 ? worlds.find(world => world.id === currentWorldId)?.name || 'Loading...' : 'Loading...'}
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          {worlds && worlds.length > 0 
            ? worlds.find(world => world.id === currentWorldId)?.description || 'No description available.'
            : 'Welcome, Dungeon Master. Your campaign world awaits.'}
        </p>
      </div>
      
      {worlds && worlds.length > 0 && (
        <div className="flex justify-center mb-8">
          <select 
            className="px-4 py-2 bg-card border border-border rounded-sm text-foreground font-medieval"
            value={currentWorldId}
            onChange={(e) => setCurrentWorldId(Number(e.target.value))}
          >
            {worlds.map((world) => (
              <option key={world.id} value={world.id}>
                {world.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {navSections.map((section, index) => (
          <Link key={index} href={section.path}>
            <div className="flex flex-col items-center text-center cursor-pointer transform transition-transform hover:scale-110">
              <div className="mb-3 p-5 rounded-full bg-primary/10 flex items-center justify-center border-2 border-accent">
                <div className="h-10 w-10 text-accent">
                  {section.icon}
                </div>
              </div>
              <h2 className="text-lg font-cinzel font-bold text-primary mb-1">
                {section.title}
              </h2>
              <p className="text-xs text-foreground/80 px-1">
                {section.description.split(' ').slice(0, 3).join(' ')}...
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
