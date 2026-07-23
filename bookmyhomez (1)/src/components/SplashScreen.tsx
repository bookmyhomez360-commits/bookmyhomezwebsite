import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onDismiss(), 250);
          return 100;
        }
        return prev + 25;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 bg-[#090D16] flex flex-col items-center justify-center p-4 transition-opacity duration-300">
      <div className="relative flex flex-col items-center text-center max-w-sm w-full">
        <div className="absolute -inset-12 rounded-full bg-gradient-to-r from-violet-600/25 via-amber-500/20 to-indigo-600/25 blur-3xl animate-pulse"></div>

        <div className="relative mb-6 animate-[logoGlow_3.5s_infinite_ease-in-out] w-72 sm:w-80 bg-white p-2.5 rounded-2xl shadow-2xl border border-indigo-500/40 flex flex-col items-center justify-center overflow-hidden">
          <Logo className="w-full h-auto max-h-48" />
        </div>

        <div className="w-48 h-1.5 bg-slate-800/90 rounded-full overflow-hidden mt-2 relative border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-amber-400 to-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <button
          onClick={onDismiss}
          className="mt-6 text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 transition cursor-pointer flex items-center gap-1"
        >
          Skip intro <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>
  );
};
