import React from 'react';
import Navbar from './components/Navbar';
import TryOnGenerator from './components/TryOnGenerator';
import Pricing from './components/Pricing';
import { ChevronDown, Zap, ShieldCheck, Globe } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-cyan selection:text-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-neon-pink/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-700 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">Powered by Gemini Nano Pro</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Stop Guessing. <br />
            Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple">Fitting.</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
            The ultimate AI virtual try-on experience for the Indian market. Upload a selfie, choose a dress, and see exactly how it looks on you in seconds.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button 
              onClick={() => document.getElementById('try-on')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-neon-cyan text-black font-bold text-lg rounded-xl hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all transform hover:-translate-y-1"
            >
              Try On Now For Free
            </button>
            <button className="px-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-xl border border-gray-700 hover:bg-gray-800 transition-all">
              View Demo Video
            </button>
          </div>

          <div className="flex justify-center gap-12 text-gray-500 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Mock Logos */}
             <div className="flex items-center gap-2 font-bold"><Zap size={20} /> FASHION.IO</div>
             <div className="flex items-center gap-2 font-bold"><Globe size={20} /> VOGUE AI</div>
             <div className="flex items-center gap-2 font-bold"><ShieldCheck size={20} /> SHOPIFY PLUS</div>
          </div>
        </div>
      </section>

      {/* Main App Interface */}
      <section id="try-on" className="py-16 bg-black/80 border-y border-gray-800 relative shadow-[0_0_100px_rgba(0,0,0,0.8)_inset]">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] pointer-events-none"></div>
        <TryOnGenerator />
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold mb-4">How <span className="text-neon-purple">FaceFit</span> Works</h2>
             <p className="text-gray-400">Three simple steps to your new look.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "1. Take a Selfie", desc: "Upload a clear photo of your face. Our AI maps your facial features instantly.", icon: "📸" },
              { title: "2. Choose Outfit", desc: "Upload a photo of the dress or shirt you want to try. Even from a screenshot.", icon: "👗" },
              { title: "3. See Magic", desc: "Gemini Nano Pro generates a hyper-realistic image of you wearing the outfit.", icon: "✨" }
            ].map((step, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-neon-purple/50 transition-all group">
                <div className="absolute -top-6 left-8 text-4xl bg-black p-2 rounded-lg border border-gray-800 group-hover:border-neon-purple group-hover:text-neon-purple transition-colors">
                  {step.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Section */}
      <section id="b2b" className="py-20 bg-gradient-to-b from-black to-neon-purple/10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-neon-cyan font-bold tracking-wider text-sm uppercase">For Business</span>
            <h2 className="text-4xl font-bold mt-2 mb-6">Boost Your Sales with the FaceFit Shopify Plugin</h2>
            <p className="text-gray-300 mb-6 text-lg">
              Reduce return rates and increase conversion by letting your customers try before they buy directly on your website.
            </p>
            <ul className="space-y-4 mb-8">
              {['Easy 1-click installation', 'Custom branding for your store', 'Analytics on user preferences'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple">✓</div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
              Get Plugin Demo
            </button>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-neon-cyan/20 blur-[100px] rounded-full"></div>
             <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-gray-700 pb-4 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 text-center text-xs text-gray-500 font-mono">store.myshopify.com</div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2 bg-gray-800 h-48 rounded-lg animate-pulse"></div>
                  <div className="w-1/2 space-y-3">
                    <div className="h-6 w-3/4 bg-gray-800 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-800 rounded"></div>
                    <div className="h-10 w-full bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded flex items-center justify-center font-bold text-sm mt-8">
                      Try On Myself
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-neon-cyan to-neon-purple rounded-lg"></div>
            <span className="text-xl font-bold">FaceFit</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2024 FaceFit Technologies Pvt Ltd. All rights reserved. 
            <span className="mx-2">|</span> 
            <a href="#" className="hover:text-white">Privacy</a>
            <span className="mx-2">|</span> 
            <a href="#" className="hover:text-white">Terms</a>
          </div>
          <div className="flex gap-4">
            {/* Social icons placeholder */}
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-800 cursor-pointer">𝕏</div>
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-800 cursor-pointer">in</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
