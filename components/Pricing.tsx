import React, { useState } from 'react';
import { Check, ShoppingBag, User } from 'lucide-react';
import { PricingPlan } from '../types';

const PLANS: PricingPlan[] = [
  {
    id: 'b2c-credits',
    name: 'Credit Pack',
    price: '₹99',
    type: 'B2C',
    features: ['50 Extra Credits', 'No Expiry', 'High Priority Generation', 'Save to Gallery'],
    recommended: false
  },
  {
    id: 'b2c-sub',
    name: 'Pro Fashionista',
    price: '₹499',
    period: '/month',
    type: 'B2C',
    features: ['Unlimited Try-Ons', 'HD 4K Downloads', 'Access to Wardrobe History', 'Early Access to New Features'],
    recommended: true
  },
  {
    id: 'b2b-plugin',
    name: 'Shopify Plugin',
    price: '₹9,999',
    period: '/year',
    type: 'B2B',
    features: ['One-time Integration Setup', 'Unlimited Customer Try-Ons', 'Analytics Dashboard', 'Custom Branding', '24/7 Priority Support'],
    recommended: true
  },
  {
    id: 'b2b-free',
    name: 'Business Trial',
    price: '₹0',
    type: 'B2B',
    features: ['50 Testing Credits', 'Basic Integration', 'Standard Quality', 'Email Support'],
    recommended: false
  }
];

const Pricing: React.FC = () => {
  const [view, setView] = useState<'B2C' | 'B2B'>('B2C');

  const filteredPlans = PLANS.filter(plan => plan.type === view);

  return (
    <div id="pricing" className="py-20 px-4 bg-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Simple, Transparent <span className="text-neon-cyan">Pricing</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Whether you're exploring your style or scaling your fashion business, we have a plan for the Indian market.
          </p>
          
          <div className="flex justify-center mt-8">
            <div className="p-1 bg-gray-900 rounded-xl inline-flex border border-gray-800">
              <button
                onClick={() => setView('B2C')}
                className={`px-8 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  view === 'B2C' ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                <User size={18} /> For Users
              </button>
              <button
                onClick={() => setView('B2B')}
                className={`px-8 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  view === 'B2B' ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShoppingBag size={18} /> For Business
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {filteredPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`
                relative p-8 rounded-2xl border transition-all duration-300 group hover:-translate-y-2
                ${plan.recommended 
                  ? 'bg-neon-card border-neon-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.1)]' 
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'
                }
              `}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-1 rounded-full text-xs font-bold text-white tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-200">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                {plan.period && <span className="ml-1 text-xl font-semibold text-gray-400">{plan.period}</span>}
              </div>
              <p className="mt-4 text-gray-400 text-sm">
                Perfect for {view === 'B2C' ? 'fashion enthusiasts' : 'Shopify store owners'}
              </p>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className={`h-6 w-6 ${plan.recommended ? 'text-neon-cyan' : 'text-gray-500'}`} />
                    </div>
                    <p className="ml-3 text-base text-gray-300">{feature}</p>
                  </li>
                ))}
              </ul>

              <button className={`
                mt-8 w-full block py-3 px-6 border border-transparent rounded-lg text-center font-bold text-lg transition-all
                ${plan.recommended
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
                }
              `}>
                {plan.price === '₹0' ? 'Start Free Trial' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
