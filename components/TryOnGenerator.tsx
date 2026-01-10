import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import { generateTryOnImage, getStyleRecommendations } from '../services/geminiService';
import { TryOnState, WardrobeItem, StyleRecommendation } from '../types';
import { Sparkles, Loader2, Shirt, User, Download, RefreshCw, Heart } from 'lucide-react';
import Wardrobe from './Wardrobe';
import StyleAdvisor from './StyleAdvisor';

const TryOnGenerator: React.FC = () => {
  const [state, setState] = useState<TryOnState>({
    faceImage: null,
    clothImage: null,
    generatedImage: null,
    isGenerating: false,
    error: null,
  });

  const [credits, setCredits] = useState<number>(5);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [recommendation, setRecommendation] = useState<StyleRecommendation | null>(null);
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState(false);

  // Load wardrobe from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('facefit-wardrobe');
    if (saved) {
      try {
        setWardrobe(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wardrobe", e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!state.faceImage || !state.clothImage) return;
    if (credits <= 0) {
      setState(prev => ({ ...prev, error: "You have run out of daily credits. Please upgrade." }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    setRecommendation(null); // Reset advice for new generation

    try {
      const resultImage = await generateTryOnImage(state.faceImage, state.clothImage);
      setState(prev => ({ 
        ...prev, 
        generatedImage: resultImage, 
        isGenerating: false 
      }));
      setCredits(prev => prev - 1);
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: err.message || "Failed to generate image. Please try again." 
      }));
    }
  };

  const handleSaveToWardrobe = () => {
    if (!state.generatedImage) return;
    
    const newItem: WardrobeItem = {
      id: Date.now().toString(),
      image: state.generatedImage,
      timestamp: Date.now()
    };

    const updated = [newItem, ...wardrobe];
    setWardrobe(updated);
    localStorage.setItem('facefit-wardrobe', JSON.stringify(updated));
  };

  const handleDeleteFromWardrobe = (id: string) => {
    const updated = wardrobe.filter(item => item.id !== id);
    setWardrobe(updated);
    localStorage.setItem('facefit-wardrobe', JSON.stringify(updated));
  };

  const handleGetAdvice = async () => {
    if (!state.faceImage || !state.clothImage) return;
    
    setIsAnalyzingStyle(true);
    try {
      const advice = await getStyleRecommendations(state.faceImage, state.clothImage);
      setRecommendation(advice);
    } catch (e) {
      console.error(e);
      // Optional: handle error visually
    } finally {
      setIsAnalyzingStyle(false);
    }
  };

  const handleReset = () => {
    setState({
      faceImage: null,
      clothImage: null,
      generatedImage: null,
      isGenerating: false,
      error: null
    });
    setRecommendation(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-8 bg-neon-card p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-400">System Online: Gemini Nano Pro</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm font-bold text-neon-cyan">
             {credits} Credits Remaining Today
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neon-card/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-neon-purple">1. Upload Inputs</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <ImageUploader 
                id="face-upload"
                label="Your Face" 
                image={state.faceImage} 
                onImageChange={(img) => setState(prev => ({ ...prev, faceImage: img }))} 
              />
              <ImageUploader 
                id="cloth-upload"
                label="The Outfit" 
                image={state.clothImage} 
                onImageChange={(img) => setState(prev => ({ ...prev, clothImage: img }))} 
              />
            </div>

            <div className="mt-8">
              <button
                onClick={handleGenerate}
                disabled={!state.faceImage || !state.clothImage || state.isGenerating}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300
                  ${!state.faceImage || !state.clothImage 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-neon-purple to-neon-cyan text-white hover:shadow-[0_0_20px_rgba(188,19,254,0.5)] transform hover:-translate-y-1'
                  }
                `}
              >
                {state.isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> TRY ON NOW
                  </>
                )}
              </button>
              {state.error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                  {state.error}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-neon-dark p-6 rounded-2xl border border-gray-800/50 text-sm text-gray-400">
             <h4 className="font-semibold text-white mb-2">Best Results Tips:</h4>
             <ul className="list-disc pl-4 space-y-1">
               <li>Use a well-lit selfie looking straight at the camera.</li>
               <li>Outfit image should be clear, preferably on a hanger or mannequin.</li>
               <li>Avoid blurry or low-resolution images.</li>
             </ul>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7">
          <div className="h-full flex flex-col gap-4">
            <div className="bg-neon-card rounded-2xl border border-gray-800 p-1 overflow-hidden relative min-h-[500px] flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan opacity-50"></div>
              
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 rounded-xl m-1 relative">
                {state.generatedImage ? (
                  <div className="relative w-full h-full flex flex-col items-center animate-in fade-in duration-700">
                      <img 
                        src={state.generatedImage} 
                        alt="Virtual Try On Result" 
                        className="max-h-[500px] w-auto object-contain rounded-lg shadow-2xl shadow-neon-purple/20"
                      />
                      <div className="flex gap-4 mt-6">
                        <button 
                          onClick={handleSaveToWardrobe}
                          className="flex items-center gap-2 px-6 py-3 bg-neon-purple text-white hover:bg-neon-purple/80 rounded-lg font-medium transition-colors shadow-lg shadow-neon-purple/20"
                        >
                          <Heart size={18} className="fill-current" /> Save Look
                        </button>
                        <a 
                          href={state.generatedImage} 
                          download="facefit-result.png"
                          className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                        >
                          <Download size={18} /> Download
                        </a>
                        <button 
                          onClick={handleReset}
                          className="flex items-center gap-2 px-6 py-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 rounded-lg font-medium transition-colors"
                        >
                          <RefreshCw size={18} /> Try Another
                        </button>
                      </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 max-w-md">
                      {state.isGenerating ? (
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-neon-cyan border-r-neon-purple border-b-transparent border-l-transparent animate-spin"></div>
                            <div className="absolute inset-4 rounded-full bg-neon-card flex items-center justify-center animate-pulse">
                              <Sparkles className="text-white" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Synthesizing Model...</h3>
                            <p className="text-gray-400">Gemini Nano Pro is analyzing fabric physics and facial geometry.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center gap-4 mb-4 opacity-30">
                            <User size={64} />
                            <span className="text-4xl text-gray-600">+</span>
                            <Shirt size={64} />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-300">Your Future Look Awaits</h3>
                          <p className="text-gray-500">
                            Upload your selfie and a product photo to see the magic happen. 
                            Our AI seamlessly blends them for a realistic preview.
                          </p>
                        </>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Style Advisor Section */}
            <StyleAdvisor 
              isVisible={!!state.generatedImage}
              isLoading={isAnalyzingStyle}
              recommendation={recommendation}
              onGetAdvice={handleGetAdvice}
            />
          </div>
        </div>
      </div>

      {/* Wardrobe Section */}
      <Wardrobe items={wardrobe} onDelete={handleDeleteFromWardrobe} />
    </div>
  );
};

export default TryOnGenerator;