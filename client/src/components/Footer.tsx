import React from 'react';
import { Link } from 'wouter';
import { MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-secondary-light">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <MapPin className="w-8 h-8 text-accent" />
              <span 
                onClick={() => window.location.href = '/'} 
                className="ml-2 text-xl font-medieval cursor-pointer hover:text-accent transition"
              >
                Realm Keeper
              </span>
            </div>
            <p className="text-sm mt-2 text-center md:text-left">The ultimate tool for D&D Dungeon Masters</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-secondary-light hover:text-accent transition">Help</a>
            <a href="#" className="text-secondary-light hover:text-accent transition">Feedback</a>
            <a href="#" className="text-secondary-light hover:text-accent transition">Terms</a>
            <a href="#" className="text-secondary-light hover:text-accent transition">Privacy</a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Realm Keeper. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
