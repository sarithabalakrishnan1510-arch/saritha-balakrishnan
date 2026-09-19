import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './lib/store/appStore';
import { FavoritesProvider } from './lib/store/favoritesStore';
import { LocationReviewsProvider } from './lib/store/locationReviewsStore';
import { ToastProvider } from './lib/store/toastStore';
import 'leaflet/dist/leaflet.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <FavoritesProvider>
        <LocationReviewsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LocationReviewsProvider>
      </FavoritesProvider>
    </AppProvider>
  </StrictMode>,
);


