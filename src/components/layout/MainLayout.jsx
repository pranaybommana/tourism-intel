import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import NetworkStatusBanner from '../common/NetworkStatusBanner';

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ocean-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <NetworkStatusBanner />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
