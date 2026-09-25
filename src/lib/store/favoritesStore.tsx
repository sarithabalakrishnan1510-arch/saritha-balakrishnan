import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cast_kerala_favorites_v1';

export interface FavoritesData {
  castingCallIds: string[];
  locationIds: string[];
  notes?: Record<string, string>;
  savedAt?: Record<string, string>;
}

export interface FavoritesContextType {
  savedCastingIds: string[];
  savedLocationIds: string[];
  notes: Record<string, string>;
  isFavoriteCasting: (id: string) => boolean;
  toggleFavoriteCasting: (id: string, itemTitle?: string) => boolean;
  isFavoriteLocation: (id: string) => boolean;
  toggleFavoriteLocation: (id: string, itemTitle?: string) => boolean;
  setFavoriteNote: (id: string, note: string) => void;
  removeFavoriteCasting: (id: string) => void;
  removeFavoriteLocation: (id: string) => void;
  clearAllFavorites: () => void;
  totalCount: number;
  castingCount: number;
  locationCount: number;
  toast: { message: string; type: 'add' | 'remove' | 'info' } | null;
  dismissToast: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedCastingIds, setSavedCastingIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: FavoritesData = JSON.parse(stored);
        return Array.isArray(parsed.castingCallIds) ? parsed.castingCallIds : [];
      }
    } catch (e) {
      console.error('Failed to read favorites from localStorage', e);
    }
    return ['call_1', 'call_2']; // sensible defaults to demonstrate personal list
  });

  const [savedLocationIds, setSavedLocationIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: FavoritesData = JSON.parse(stored);
        return Array.isArray(parsed.locationIds) ? parsed.locationIds : [];
      }
    } catch (e) {
      console.error('Failed to read favorites from localStorage', e);
    }
    return ['loc_1', 'loc_4']; // default saved locations (Varikkasseri Mana, Kuttanad Tharavadu)
  });

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: FavoritesData = JSON.parse(stored);
        return parsed.notes || {};
      }
    } catch (e) {
      console.error('Failed to read notes from localStorage', e);
    }
    return {
      call_1: 'Audition scene 14 prepared. Shoot in Fort Kochi.',
      loc_1: '300-year mana with 3-phase generator connection. High priority for climax.',
      loc_4: 'Kuttanad backwaters with jetty access for boat chase scene.',
    };
  });

  const [toast, setToast] = useState<{ message: string; type: 'add' | 'remove' | 'info' } | null>(null);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    try {
      const payload: FavoritesData = {
        castingCallIds: savedCastingIds,
        locationIds: savedLocationIds,
        notes,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [savedCastingIds, savedLocationIds, notes]);

  const showToast = useCallback((message: string, type: 'add' | 'remove' | 'info') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const isFavoriteCasting = useCallback((id: string) => {
    return savedCastingIds.includes(id);
  }, [savedCastingIds]);

  const toggleFavoriteCasting = useCallback((id: string, itemTitle?: string) => {
    let willBeFavorite = false;
    setSavedCastingIds(prev => {
      const exists = prev.includes(id);
      willBeFavorite = !exists;
      if (exists) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });

    const label = itemTitle ? `"${itemTitle.length > 25 ? itemTitle.slice(0, 25) + '…' : itemTitle}"` : 'Casting call';
    if (willBeFavorite) {
      showToast(`${label} saved to your personal list`, 'add');
    } else {
      showToast(`${label} removed from your personal list`, 'remove');
    }
    return willBeFavorite;
  }, [showToast]);

  const removeFavoriteCasting = useCallback((id: string) => {
    setSavedCastingIds(prev => prev.filter(item => item !== id));
    showToast('Casting call removed from your personal list', 'remove');
  }, [showToast]);

  const isFavoriteLocation = useCallback((id: string) => {
    return savedLocationIds.includes(id);
  }, [savedLocationIds]);

  const toggleFavoriteLocation = useCallback((id: string, itemTitle?: string) => {
    let willBeFavorite = false;
    setSavedLocationIds(prev => {
      const exists = prev.includes(id);
      willBeFavorite = !exists;
      if (exists) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });

    const label = itemTitle ? `"${itemTitle.length > 25 ? itemTitle.slice(0, 25) + '…' : itemTitle}"` : 'Location';
    if (willBeFavorite) {
      showToast(`${label} saved to your personal list`, 'add');
    } else {
      showToast(`${label} removed from your personal list`, 'remove');
    }
    return willBeFavorite;
  }, [showToast]);

  const removeFavoriteLocation = useCallback((id: string) => {
    setSavedLocationIds(prev => prev.filter(item => item !== id));
    showToast('Location removed from your personal list', 'remove');
  }, [showToast]);

  const setFavoriteNote = useCallback((id: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [id]: note,
    }));
  }, []);

  const clearAllFavorites = useCallback(() => {
    setSavedCastingIds([]);
    setSavedLocationIds([]);
    setNotes({});
    showToast('Cleared all saved items', 'info');
  }, [showToast]);

  const castingCount = savedCastingIds.length;
  const locationCount = savedLocationIds.length;
  const totalCount = castingCount + locationCount;

  return (
    <FavoritesContext.Provider
      value={{
        savedCastingIds,
        savedLocationIds,
        notes,
        isFavoriteCasting,
        toggleFavoriteCasting,
        isFavoriteLocation,
        toggleFavoriteLocation,
        setFavoriteNote,
        removeFavoriteCasting,
        removeFavoriteLocation,
        clearAllFavorites,
        totalCount,
        castingCount,
        locationCount,
        toast,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#141620] border border-amber-500/30 text-white text-xs font-semibold shadow-2xl backdrop-blur-md">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                toast.type === 'add' ? 'bg-amber-400 animate-ping' : toast.type === 'remove' ? 'bg-zinc-400' : 'bg-blue-400'
              }`}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
