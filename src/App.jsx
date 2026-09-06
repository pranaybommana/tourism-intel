import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { SyncProvider } from './context/SyncContext';
import { DestinationProvider } from './context/DestinationContext';
import MainLayout from './components/layout/MainLayout';

import HomePage from './pages/Home/HomePage';
import ExplorePage from './pages/Explore/ExplorePage';
import DestinationDetailPage from './pages/Explore/DestinationDetailPage';
import NavigatePage from './pages/Navigate/NavigatePage';
import AssistantPage from './pages/Assistant/AssistantPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';
import FairPricePage from './pages/AI/FairPricePage';
import LandmarkPage from './pages/AI/LandmarkPage';
import WasteDetectionPage from './pages/AI/WasteDetectionPage';

export function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <SyncProvider>
          <DestinationProvider>
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/destination/:id" element={<DestinationDetailPage />} />
                <Route path="/navigate" element={<NavigatePage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/ai/fairprice" element={<FairPricePage />} />
                <Route path="/ai/landmark" element={<LandmarkPage />} />
                <Route path="/ai/waste" element={<WasteDetectionPage />} />
                <Route path="/ai/waste-detection" element={<WasteDetectionPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </MainLayout>
          </DestinationProvider>
        </SyncProvider>
      </AppStateProvider>
    </BrowserRouter>
  );
}

export default App;
