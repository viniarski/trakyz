// components/ui/loading-screen.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function LoadingScreen({ isLoading, onComplete }: LoadingScreenProps) {
  console.log('LoadingScreen rendered with isLoading:', isLoading);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  
  useEffect(() => {
    if (!isLoading && isVisible) {
      console.log('isLoading prop changed to false, hiding loading screen');
      setIsVisible(false);
      if (onComplete) onComplete();
    }
  }, [isLoading, isVisible, onComplete]);

  useEffect(() => {
    if (hasStartedLoading || !isLoading) return;
    setHasStartedLoading(true);
    
    console.log('Starting loading animation');
    setIsVisible(true);
    
    setTimeout(() => setProgress(30), 100);
    setTimeout(() => setProgress(70), 200);
    setTimeout(() => setProgress(90), 300);
    
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        console.log('Animation complete, hiding loading screen');
        setIsVisible(false);
        if (onComplete) {
          console.log('Calling onComplete callback');
          onComplete();
        }
      }, 100);
    }, 600);
    
    return () => clearTimeout(completeTimer);
  }, [onComplete, hasStartedLoading, isLoading]);

  if (!isVisible) {
    console.log('Loading screen is not visible, returning null');
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[9999]">
      <div className="absolute inset-0 bg-[var(--bg-primary)]"></div>
      <div className="flex flex-col items-center gap-6 z-10">
        <div className="flex items-center gap-2 font-mono font-medium text-3xl text-[var(--text-primary)] tracking-tight">
          <div className="relative h-8 w-8">
            <Image 
              src="/logo_trakyz.png"
              alt="Trakyz Logo"
              fill
              sizes="64px"
              className="object-contain"
              priority
            />
          </div>
          TRAKYZ
        </div>
        <div className="w-64 h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}