import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { PageTransition } from '../components/PageTransition';

export const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      {/* Ambient Hexagonal Honeycomb Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-grid-honeycomb mask-radial-top opacity-70" />
      </div>

      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex relative z-10">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 flex flex-col">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <Footer />
    </div>
  );
};
