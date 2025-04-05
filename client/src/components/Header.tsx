import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Sparkles } from 'lucide-react';
import { 
  GiScrollUnfurled, 
  GiCastle, 
  GiMountainCave, 
  GiWizardFace, 
  GiDragonHead, 
  GiSpellBook, 
  GiBookCover, 
  GiDiceTwentyFacesTwenty, 
  GiCrownedSkull 
} from 'react-icons/gi';
import { Button } from '@/components/ui/button';
import { AddWorldModal } from '@/modals/AddWorldModal';

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddWorldModalOpen, setIsAddWorldModalOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { path: '/map', label: 'Map', icon: <GiScrollUnfurled className="w-5 h-5" /> },
    { path: '/regions', label: 'Kingdoms', icon: <GiCastle className="w-5 h-5" /> },
    { path: '/locations', label: 'Locations', icon: <GiMountainCave className="w-5 h-5" /> },
    { path: '/characters', label: 'Characters', icon: <GiWizardFace className="w-5 h-5" /> },
    { path: '/bestiary', label: 'Bestiary', icon: <GiDragonHead className="w-5 h-5" /> },
    { path: '/spellbook', label: 'Spellbook', icon: <GiSpellBook className="w-5 h-5" /> },
    { path: '/lore', label: 'Lore', icon: <GiBookCover className="w-5 h-5" /> },
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-[hsl(var(--forest-green))] via-[hsl(var(--primary))] to-[hsl(var(--forest-dark))] shadow-lg relative">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[hsl(var(--gold))/30] via-[hsl(var(--gold))] to-[hsl(var(--gold))/30]"></div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 dragon-scales opacity-10 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center relative">
              <GiDiceTwentyFacesTwenty className="w-10 h-10 text-[hsl(var(--gold))] drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
            </div>
            <Link href="/" className="ml-3 text-2xl font-cinzel-decorative flex items-center">
              <span className="bg-gradient-to-br from-[hsl(var(--gold))] via-[hsl(var(--accent))/90] to-[hsl(var(--gold))] bg-clip-text text-transparent drop-shadow-sm">Realm Keeper</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`transition-all duration-300 ${
                  location === link.path 
                    ? 'font-bold text-[hsl(var(--gold))] scale-105 shadow-[0_0_10px_rgba(255,200,50,0.3)]' 
                    : 'text-[hsl(var(--parchment))]'
                } py-1 px-3 rounded-sm flex items-center gap-1.5 hover:bg-[hsl(var(--primary))/50] hover:text-[hsl(var(--gold))]`}
              >
                <div className={`p-1 rounded ${location === link.path ? 'bg-[hsl(var(--accent))/20]' : ''}`}>
                  {link.icon}
                </div>
                <span className="font-cinzel">{link.label}</span>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            <button 
              className="md:hidden text-[hsl(var(--parchment))] hover:text-[hsl(var(--gold))]"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Button
              className="hidden md:flex items-center px-4 py-2 ml-4 bg-gradient-to-r from-[hsl(var(--leather))] to-[hsl(var(--gold))] text-[hsl(var(--forest-dark))] font-cinzel font-bold rounded-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
              onClick={() => setIsAddWorldModalOpen(true)}
            >
              <div className="absolute inset-0 opacity-20 bg-pattern-diamond"></div>
              <GiCrownedSkull className="h-5 w-5 mr-2 animate-pulse text-[hsl(var(--forest-dark))]" />
              <span className="relative z-10">Create World</span>
            </Button>
          </div>
        </div>
        
        {/* Decorative bottom border with small notches */}
        <div className="absolute bottom-0 left-0 w-full h-2 overflow-hidden">
          <div className="relative w-full h-full bg-[hsl(var(--wood-dark))]">
            <div className="absolute top-0 left-0 w-full h-1 bg-[hsl(var(--gold))/30]"></div>
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 bg-[hsl(var(--forest-dark))] w-2 h-2"
                style={{ left: `${i * 3.33}%` }}
              ></div>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-[hsl(var(--forest-green))/95] to-[hsl(var(--forest-dark))/90] border-t border-[hsl(var(--gold))/30] border-b border-b-[hsl(var(--gold))/30] px-4 py-3 shadow-lg">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`flex items-center gap-2 py-2 transition-all duration-300 ${
                  location === link.path 
                    ? 'font-bold text-[hsl(var(--gold))] bg-[hsl(var(--forest-dark))/50] shadow-inner' 
                    : 'text-[hsl(var(--parchment))] hover:text-[hsl(var(--gold))] hover:bg-[hsl(var(--forest-dark))/30]'
                } px-3 rounded-md font-cinzel`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Button
              className="flex items-center justify-center w-full px-4 py-3 mt-2 bg-gradient-to-r from-[hsl(var(--leather))] to-[hsl(var(--gold))] text-[hsl(var(--forest-dark))] font-cinzel font-bold rounded-md shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAddWorldModalOpen(true);
              }}
            >
              <div className="absolute inset-0 opacity-20 bg-pattern-diamond"></div>
              <GiCrownedSkull className="h-5 w-5 mr-2 text-[hsl(var(--forest-dark))]" />
              <span className="relative z-10">Create New World</span>
            </Button>
          </nav>
        </div>
      )}
      
      <AddWorldModal 
        isOpen={isAddWorldModalOpen} 
        onClose={() => setIsAddWorldModalOpen(false)} 
      />
    </>
  );
};

export default Header;
