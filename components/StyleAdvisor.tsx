import React from 'react';
import { StyleRecommendation } from '../types';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface StyleAdvisorProps {
  recommendation: StyleRecommendation | null;
  isLoading: boolean;
  onGetAdvice: () => void;
  isVisible: boolean;
}

const StyleAdvisor: React.FC<StyleAdvisorProps> = ({ recommendation, isLoading, onGetAdvice, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="w-full mt-8 animate-in slide-in-from-bottom-5 duration-700">
      {!recommendation && !isLoading ? (
        <button
          onClick={onGetAdvice}
          className="w-full py-4 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-xl flex items-center justify-center gap-3 text-neon-purple hover:border-neon-purple/50 transition-all group shadow-lg shadow-purple-900/10"
        >
          <Sparkles className="group-hover:animate-spin" />
          <span className="font-bold tracking-wide">UNLOCK AI STYLE ADVICE</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      ) : isLoading ? (
        <div className="w-full py-8 bg-black/40 border border-gray-800 rounded-xl flex flex-col items-center justify-center text-neon-purple gap-3">
          <Loader2 className="animate-spin h-8 w-8" />
          <span className="text-sm font-medium animate-pulse">Analyzing skin tone & fashion trends...</span>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-neon-purple/30 rounded-xl p-6 relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-neon-purple">
              <Sparkles size={20} />
              <h3 className="font-bold text-lg uppercase tracking-wider">AI Stylist Report</h3>
            </div>
            
            <p className="text-gray-300 mb-6 italic border-l-2 border-neon-purple pl-4 leading-relaxed">
              "{recommendation?.analysis}"
            </p>
            
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
