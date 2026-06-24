import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-brutalBorder bg-darkBg text-textMuted py-8 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 font-space text-xs">
        <div>
          <span className="font-bold text-textPrimary uppercase">CivicPulse Platform</span> © 2026. Empowering citizens through real-time AI classification & mapping.
        </div>
        <div className="flex items-center gap-1.5">
          Made with <Heart className="h-3 w-3 fill-danger text-danger" /> for municipal transparency and action.
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary uppercase transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary uppercase transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary uppercase transition-colors">Developer API</a>
        </div>
      </div>
    </footer>
  );
};
