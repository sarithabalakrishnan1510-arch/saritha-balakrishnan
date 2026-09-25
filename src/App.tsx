/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CastingCallsPage } from './pages/CastingCallsPage';
import { CastingDetailPage } from './pages/CastingDetailPage';
import { TalentRegistryPage } from './pages/TalentRegistryPage';
import { TalentProfilePage } from './pages/TalentProfilePage';
import { TalentDashboardPage } from './pages/TalentDashboardPage';
import { ProductionDashboardPage } from './pages/ProductionDashboardPage';
import { CreateCastingCallPage } from './pages/CreateCastingCallPage';
import { ServicesAndCrewPage } from './pages/ServicesAndCrewPage';
import { ShootingLocationsPage } from './pages/ShootingLocationsPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { AuthPage } from './pages/AuthPage';
import { FavoritesPage } from './pages/FavoritesPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#07080a] text-[#f3f4f6] font-sans selection:bg-amber-500/30 selection:text-amber-200">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/casting" element={<CastingCallsPage />} />
            <Route path="/casting/:id" element={<CastingDetailPage />} />
            <Route path="/talent" element={<TalentRegistryPage />} />
            <Route path="/talent/:id" element={<TalentProfilePage />} />
            <Route path="/talent/dashboard" element={<TalentDashboardPage />} />
            <Route path="/production/dashboard" element={<ProductionDashboardPage />} />
            <Route path="/production/casting/new" element={<CreateCastingCallPage />} />
            <Route path="/services" element={<ServicesAndCrewPage />} />
            <Route path="/locations" element={<ShootingLocationsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/saved" element={<FavoritesPage />} />
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="/login" element={<AuthPage />} />
          </Routes>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}

