import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Newspaper, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  Filter, 
  ExternalLink, 
  ChevronRight, 
  Sparkles,
  Award,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { IndustryUpdate, IndustryUpdateCategory } from '../../types';
import { fetchIndustryUpdates, getLastFetchedTime } from '../../lib/services/industryUpdatesService';
import { IndustryUpdateModal } from './IndustryUpdateModal';
import { ShareButton } from '../common/ShareButton';

export const IndustryUpdatesSection: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [updates, setUpdates] = useState<IndustryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IndustryUpdateCategory | 'all'>('all');
  const [selectedUpdate, setSelectedUpdate] = useState<IndustryUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const loadUpdates = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await fetchIndustryUpdates({
        category: activeCategory,
        searchQuery: searchQuery
      });
      setUpdates(result.updates);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load industry updates', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  // Check URL params for deep-linked update (e.g., ?update=update-mollywood-001)
  useEffect(() => {
    const updateId = searchParams.get('update');
    if (updateId && updates.length > 0) {
      const found = updates.find(u => u.id === updateId);
      if (found) {
        setSelectedUpdate(found);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, updates]);

  const handleOpenUpdate = (update: IndustryUpdate) => {
    setSelectedUpdate(update);
    setIsModalOpen(true);
    setSearchParams(prev => {
      prev.set('update', update.id);
      return prev;
    }, { replace: true });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUpdate(null);
    setSearchParams(prev => {
      prev.delete('update');
      return prev;
    }, { replace: true });
  };

  const categories: { id: IndustryUpdateCategory | 'all'; label: string; count?: number }[] = [
    { id: 'all', label: 'All Dispatches' },
    { id: 'press_release', label: 'Press Releases' },
    { id: 'guild_directive', label: 'FEFKA & AMMA Directives' },
    { id: 'government_subsidy', label: 'Govt & Single Window' },
    { id: 'trade_boxoffice', label: 'Trade & Box Office' },
    { id: 'festival_awards', label: 'Chalachitra Academy / IFFK' },
  ];

  // Urgent / featured update
  const featuredUpdate = useMemo(() => {
    return updates.find(u => u.urgent) || updates[0] || null;
  }, [updates]);

  const regularUpdates = useMemo(() => {
    return updates.filter(u => u.id !== featuredUpdate?.id);
  }, [updates, featuredUpdate]);

  const getCategoryColor = (cat: IndustryUpdateCategory) => {
    switch (cat) {
      case 'press_release':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'guild_directive':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'government_subsidy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'trade_boxoffice':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'festival_awards':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-zinc-300 bg-white/5 border-white/10';
    }
  };

  return (
    <section id="industry-updates" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-500/15 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
              <Newspaper className="w-3 h-3 text-amber-400" />
              Mollywood Trade Wire & Guild Circulars
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Wire</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-cinematic tracking-tight">
            Industry Updates & Press Releases
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Verified statutory circulars from FEFKA, Kerala Film Chamber, Chalachitra Academy, and Single-Window District Filming authorities across Kerala.
          </p>
        </div>

        {/* Refresh & Live Sync Status */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-zinc-500 hidden sm:inline font-mono">
            Synced {lastSyncTime}
          </span>
          <button
            type="button"
            onClick={() => loadUpdates(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-amber-500/25 text-amber-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            title="Fetch latest press releases and wire dispatches"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Fetching Wire...' : 'Refresh Wire'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none text-xs">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 shadow-lg shadow-amber-500/20 border border-amber-400'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search within Updates */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-amber-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search circulars, FEFKA, permits..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/25 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && updates.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 rounded-2xl bg-white/5 border border-white/5 p-6 space-y-4">
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-6 bg-white/10 rounded w-3/4" />
              <div className="h-16 bg-white/10 rounded w-full" />
              <div className="h-8 bg-white/10 rounded w-1/2 mt-4" />
            </div>
          ))}
        </div>
      ) : updates.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-[#0e0f14] border border-amber-500/20 space-y-3">
          <Newspaper className="w-8 h-8 text-amber-500/40 mx-auto" />
          <h4 className="text-base font-bold text-white">No industry updates found</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            No circulars match your current filter query "{searchQuery}". Try selecting another category or clear the search.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured / Statutory Bulletin Card in Black and Gold */}
          {featuredUpdate && !searchQuery && activeCategory === 'all' && (
            <div className="rounded-2xl bg-gradient-to-r from-amber-950/20 via-[#111219] to-[#0c0d12] border border-amber-500/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      Statutory Bulletin
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      REF: {featuredUpdate.official_reference_no}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-[11px] text-zinc-400">
                      {featuredUpdate.source_organization_short}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white font-cinematic hover:text-amber-300 transition-colors cursor-pointer leading-snug"
                    onClick={() => handleOpenUpdate(featuredUpdate)}
                  >
                    {featuredUpdate.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2">
                    {featuredUpdate.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenUpdate(featuredUpdate)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                      <span>Read Full Communiqué</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <ShareButton
                      title={featuredUpdate.title}
                      url={`/?update=${featuredUpdate.id}`}
                      description={featuredUpdate.summary}
                      type="generic"
                      variant="card-action"
                      label="Share Circular"
                      className="px-3 py-2 text-xs"
                    />

                    <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Published {featuredUpdate.published_relative}
                    </span>
                  </div>
                </div>

                {/* Right side banner visual */}
                {featuredUpdate.image_url && (
                  <div 
                    className="relative h-44 rounded-xl overflow-hidden border border-amber-500/20 group cursor-pointer shadow-lg"
                    onClick={() => handleOpenUpdate(featuredUpdate)}
                  >
                    <img 
                      src={featuredUpdate.image_url} 
                      alt={featuredUpdate.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                      <span className="font-semibold bg-black/60 px-2 py-0.5 rounded backdrop-blur-md border border-amber-500/20">
                        {featuredUpdate.source_organization}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grid of Industry Updates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(searchQuery || activeCategory !== 'all' ? updates : regularUpdates).map(item => {
              const catColor = getCategoryColor(item.category);

              return (
                <article
                  key={item.id}
                  className="rounded-2xl bg-[#0c0d12] border border-amber-500/20 hover:border-amber-400/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all p-5 flex flex-col justify-between space-y-4 shadow-xl group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Source */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${catColor}`}>
                        {item.source_organization_short}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {item.published_relative}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 
                      onClick={() => handleOpenUpdate(item)}
                      className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors cursor-pointer leading-snug line-clamp-2"
                    >
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>

                    {/* Takeaway pill preview */}
                    {item.key_takeaways && item.key_takeaways[0] && (
                      <div className="p-2 rounded-lg bg-black/60 border border-amber-500/15 flex items-start gap-1.5 text-[11px] text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item.key_takeaways[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom / Footer Actions */}
                  <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenUpdate(item)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Read Circular</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <ShareButton
                        title={item.title}
                        url={`/?update=${item.id}`}
                        description={item.summary}
                        type="generic"
                        variant="icon"
                        size="sm"
                        className="p-1 rounded-lg bg-white/5 hover:bg-amber-500/10 text-zinc-400 hover:text-amber-300 border border-white/5 hover:border-amber-500/30"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Update Details Modal */}
      <IndustryUpdateModal
        update={selectedUpdate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};
