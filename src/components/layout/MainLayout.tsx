import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans text-slate-900">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} University of Ghana Electoral Commission.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Integri Procedamus</span>
            <span>•</span>
            <span>Student Election Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
