import React from 'react';
import { Sparkles, ShieldCheck, Gem } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'client' | 'admin';
  onTabChange: (tab: 'client' | 'admin') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-orbit-950 font-sans text-gray-200 selection:bg-orbit-gold selection:text-black">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-transparent to-orbit-gold/5" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-b-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://i.ibb.co/1959M5J/orbit-logo-white.png" 
              alt="ORBIT" 
              className="h-8 md:h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          
          <div className="flex gap-8">
            <button 
              onClick={() => onTabChange('client')}
              className={`text-sm tracking-widest uppercase transition-all duration-300 ${activeTab === 'client' ? 'text-orbit-gold border-b border-orbit-gold pb-1' : 'text-gray-400 hover:text-white'}`}
            >
              Reserve
            </button>
            <button 
              onClick={() => onTabChange('admin')}
              className={`text-sm tracking-widest uppercase transition-all duration-300 ${activeTab === 'admin' ? 'text-orbit-gold border-b border-orbit-gold pb-1' : 'text-gray-400 hover:text-white'}`}
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-24 px-4 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 mt-12 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; 2024 ORBIT Mobility. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-orbit-gold" />
              <span>Secure Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orbit-gold" />
              <span>Concierge Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;