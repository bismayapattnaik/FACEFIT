import React from 'react';
import { Camera } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Camera className="text-neon-cyan" size={28} />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-white">
              FaceFit
            </span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">Try On</a>
              <a href="#how-it-works" className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">How it Works</a>
              <a href="#pricing" className="hover:text-neon-cyan px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
              <a href="#b2b" className="bg-neon-purple/20 text-neon-purple border border-neon-purple/50 hover:bg-neon-purple hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                For Business
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
