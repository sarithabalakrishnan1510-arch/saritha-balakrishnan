import React, { useState } from 'react';
import { 
  X, 
  Search, 
  User, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  UserPlus, 
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';
import { useApp } from '../../lib/store/appStore';
import { UserRole } from '../../types';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({ isOpen, onClose, onSelectUser }) => {
  const { allRegisteredUsers, currentUser, loginUserById, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | UserRole>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredUsers = allRegisteredUsers.filter(u => {
    if (activeFilter !== 'all' && u.role !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.subtitle.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUserSelect = (userId: string, userName: string) => {
    loginUserById(userId);
    setStatusMessage(`Logged in as ${userName}`);
    if (onSelectUser) onSelectUser(userId);
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 600);
  };

  const handleLogout = () => {
    logout();
    setStatusMessage('Logged out successfully');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0d0e14] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-[#10121a] to-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </span>
              <h3 className="text-lg font-bold text-white font-cinematic">
                Switch Mollywood Account
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Select any verified Malayalam cinema artist, production house, or regulatory admin to test the platform.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="p-4 border-b border-amber-500/15 bg-[#0a0b0f] space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by artist name, banner, district, or role..."
              className="w-full pl-10 pr-4 py-2 bg-black/60 border border-amber-500/25 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/70"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              All Users ({allRegisteredUsers.length})
            </button>
            <button
              onClick={() => setActiveFilter('talent')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'talent'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 font-bold'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Actors & Artists ({allRegisteredUsers.filter(u => u.role === 'talent').length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('production')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'production'
                  ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-500/50 font-bold'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Production Houses ({allRegisteredUsers.filter(u => u.role === 'production').length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('admin')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'admin'
                  ? 'bg-purple-600/40 text-purple-200 border border-purple-500/50 font-bold'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Desk ({allRegisteredUsers.filter(u => u.role === 'admin').length})</span>
            </button>
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[420px]">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-zinc-300">No users found</p>
              <p className="text-xs text-zinc-500">Try changing your search keywords or filter tab.</p>
            </div>
          ) : (
            filteredUsers.map(user => {
              const isCurrent = currentUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user.id, user.name)}
                  className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-[#12141c]/60 hover:bg-[#161822] border-white/5 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop'}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-amber-400/50 transition-all"
                      />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#10121a] ${
                        user.role === 'talent' 
                          ? 'bg-amber-400' 
                          : user.role === 'production' 
                          ? 'bg-yellow-500' 
                          : 'bg-purple-500'
                      }`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {user.name}
                        </span>
                        {user.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'talent'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : user.role === 'production'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {user.role}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            Current Session
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {user.subtitle}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400/70" />
                          <span>{user.district}</span>
                        </span>
                        <span>•</span>
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 shadow-md active:scale-95'
                      }`}
                    >
                      <span>{isCurrent ? 'Active' : 'Log In'}</span>
                      {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Logout & Current Session */}
        <div className="p-4 border-t border-white/10 bg-[#0c0e14] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Signed in as:</span>
                <span className="font-semibold text-white">{currentUser.full_name}</span>
                <span className="text-zinc-500">({currentUser.role})</span>
              </div>
            ) : (
              <span className="text-amber-400 font-medium">Guest mode: Currently logged out</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
