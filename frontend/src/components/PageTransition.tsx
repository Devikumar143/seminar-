import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (location.pathname !== prevPath) {
      setPrevPath(location.pathname);
      setIsNavigating(true);
      window.scrollTo({ top: 0, behavior: 'instant' });

      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevPath]);

  return (
    <>
      {/* Top Route Progress Glow Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[2.5px] bg-transparent overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 w-full animate-route-progress shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        </div>
      )}

      {/* Hardware-accelerated Smooth Enter Container */}
      <div key={location.pathname} className="page-enter w-full flex-1">
        {children}
      </div>
    </>
  );
};
