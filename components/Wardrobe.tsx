import React from 'react';
import { WardrobeItem } from '../types';
import { Trash2, Calendar } from 'lucide-react';

interface WardrobeProps {
  items: WardrobeItem[];
  onDelete: (id: string) => void;
}

const Wardrobe: React.FC<WardrobeProps> = ({ items, onDelete }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full mt-16 border-t border-gray-800 pt-10">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-neon-cyan">Your Digital Wardrobe</span>
        <span className="text-sm font-normal text-gray-500 bg-gray-900 px-2 py-1 rounded-md">{items.length} saved looks</span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-neon-cyan transition-all">
            <img 
              src={item.image} 
              alt="Saved Look" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <Calendar size={12} />
                {new Date(item.timestamp).toLocaleDateString()}
              </div>
              <button 
                onClick={() => onDelete(item.id)}
                className="w-full py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wardrobe;
