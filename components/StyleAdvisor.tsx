import React from 'react';
import { StyleRecommendation } from '../types';
import { Sparkles, ArrowRight, Loader2, ShoppingBag, ExternalLink } from 'lucide-react';

interface StyleAdvisorProps {
  recommendation: StyleRecommendation | null;
  isLoading: boolean;
  onGetAdvice: () => void;
  isVisible: boolean;
}

const StyleAdvisor: React.FC<StyleAdvisorProps> = ({ recommendation, isLoading, onGetAdvice, isVisible }) => {
  if (!isVisible) return null;

  const handleBuyClick = (query: string) => {
    const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full mt-8 animate-in slide-in-from-bottom-5 duration-700">
      {!recommendation && !isLoading ? (
        <button
          onClick={onGetAdvice}
          className="w-full py-4 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-xl flex items-center justify-center gap-3 text-neon-purple hover:border-neon-purple/50 transition-all group shadow-lg shadow-purple-900/10"
        >
          <Sparkles className="group-hover:animate-spin" />
          <span className="font-bold tracking-wide">UNLOCK AI STYLE ADVICE & SHOP THE LOOK</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      ) : isLoading ? (
        <div className="w-full py-8 bg-black/40 border border-gray-800 rounded-xl flex flex-col items-center justify-center text-neon-purple gap-3">
          <Loader2 className="animate-spin h-8 w-8" />
          <span className="text-sm font-medium animate-pulse">Scanning outfit & searching for matching items...</span>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-neon-purple/30 rounded-xl p-6 relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-neon-purple border-b border-gray-800 pb-4">
              <Sparkles size={20} />
              <h3 className="font-bold text-lg uppercase tracking-wider">AI Stylist Report</h3>
            </div>
            
            <p className="text-gray-300 italic leading-relaxed">
              "{recommendation?.analysis}"
            </p>

            {/* Shopping Section */}
            {recommendation?.complementaryItem && (
              <div className="bg-neon-purple/5 border border-neon-purple/20 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neon-purple/10 rounded-full text-neon-purple">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">We paired this with:</h4>
                    <p className="text-neon-cyan text-lg font-bold">{recommendation.complementaryItem.name}</p>
                    <p className="text-xs text-gray-400">Est. Price: {recommendation.complementaryItem.priceRange}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleBuyClick(recommendation.complementaryItem!.searchQuery)}
                  className="w-full md:w-auto px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  Buy Similar <ExternalLink size={16} />
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendation?.suggestions?.map((item, idx) => (
                <div key={idx} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-neon-cyan/50 transition-colors">
                  <div className="text-neon-cyan text-sm font-bold uppercase mb-1">{item.item}</div>
                  <div className="text-xs text-gray-500 mb-2">{item.color}</div>
                  <p className="text-xs text-gray-400">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleAdvisor;