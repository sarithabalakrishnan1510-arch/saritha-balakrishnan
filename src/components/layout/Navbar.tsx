import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Clapperboard, 
  Search, 
  Bell, 
  User, 
  Building2, 
  ShieldCheck, 
  Menu, 
  X, 
  CheckCheck,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Film,
  LogOut,
  MapPin,
  Briefcase,
  Heart,
  Users,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useApp } from '../../lib/store/appStore';
import { useFavorites } from '../../lib/store/favoritesStore';
import { UserRole } from '../../types';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { UserSwitchModal } from '../auth/UserSwitchModal';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    switchUserRole, 
    logout,
    allRegisteredUsers 
  } = useApp();
  const { totalCount: favoritesCount } = useFavorites();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userSwitchModalOpen, setUserSwitchModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0c0d10]/95 backdrop-blur-md border-b border-white/10 text-white">
      {/* Top Banner with Active User indicator and instant switcher */}
      <div className="bg-gradient-to-r from-rose-950/60 via-[#161820] to-rose-950/60 border-b border-rose-900/30 px-4 py-1 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-rose-300">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Kerala Industry Casting & Production Hub</span>
            </span>
            <span className="hidden sm:inline text-zinc-500">|</span>
            {currentUser ? (
              <span className="hidden sm:inline text-zinc-300">
                Active: <strong className="text-white">{currentUser.full_name}</strong> ({currentUser.role})
              </span>
            ) : (
              <span className="hidden sm:inline text-amber-400 font-medium">
                Guest Mode (Logged Out)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <>
                <span className="text-zinc-400 text-[11px] hidden md:inline">Switch Role:</span>
                <div className="inline-flex rounded-md p-0.5 bg-black/40 border border-white/10 text-[11px]">
                  <button
                    id="role-switch-talent"
                    onClick={() => switchUserRole('talent')}
                    className={`px-2.5 py-0.5 rounded transition-all font-medium ${
                      currentUser?.role === 'talent'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Talent
                  </button>
                  <button
                    id="role-switch-production"
                    onClick={() => switchUserRole('production')}
                    className={`px-2.5 py-0.5 rounded transition-all font-medium ${
                      currentUser?.role === 'production'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Production
                  </button>
                  <button
                    id="role-switch-admin"
                    onClick={() => switchUserRole('admin')}
                    className={`px-2.5 py-0.5 rounded transition-all font-medium ${
                      currentUser?.role === 'admin'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setUserSwitchModalOpen(true)}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-zinc-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="Switch between all 13+ Mollywood users"
                >
                  <Users className="w-3 h-3 text-rose-400" />
                  <span className="hidden xs:inline">All Users ({allRegisteredUsers.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2 py-0.5 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800/30 text-red-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="Log out of Cast Kerala"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUserSwitchModalOpen(true)}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-zinc-200 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Users className="w-3 h-3 text-rose-400" />
                  <span>Choose Persona ({allRegisteredUsers.length})</span>
                </button>
                <Link
                  to="/login"
                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Log In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center shadow-lg shadow-rose-900/30 group-hover:scale-105 transition-transform border border-rose-500/40">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight font-cinematic text-white flex items-center gap-1.5">
                CAST KERALA
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-rose-300/80 font-medium">
                Mollywood Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/casting"
              className={`px-3.5 py-2 rounded-md transition-colors ${
                isActive('/casting')
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Casting Calls
            </Link>
            <Link
              to="/talent"
              className={`px-3.5 py-2 rounded-md transition-colors ${
                isActive('/talent')
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Talent Registry
            </Link>
            <Link
              to="/services"
              className={`px-3.5 py-2 rounded-md transition-colors ${
                isActive('/services')
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Services & Crew
            </Link>
            <Link
              to="/locations"
              className={`px-3.5 py-2 rounded-md transition-colors ${
                isActive('/locations')
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Locations
            </Link>
            <Link
              to="/#industry-updates"
              className={`px-3.5 py-2 rounded-md transition-colors ${
                location.pathname === '/' && location.hash === '#industry-updates'
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Industry Wire
            </Link>
            <Link
              to="/safety"
              className={`px-3.5 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                isActive('/safety')
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Safety</span>
            </Link>
          </nav>

          {/* Global Search Component */}
          <div className="hidden md:block w-48 lg:w-60 xl:w-72">
            <GlobalSearch />
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Favorites / Saved Vault Link */}
            <Link
              id="saved-favorites-btn"
              to="/favorites"
              className="relative p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors group"
              aria-label="Saved Favorites"
              title="Saved Auditions & Shooting Locations"
            >
              <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${favoritesCount > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 px-1 min-w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {currentUser ? (
              <>
                {/* Notifications Bell & Dropdown */}
                <NotificationCenter />

                {/* Role Dashboard Link Button */}
                <Link
                  id="dashboard-main-cta"
                  to={
                    currentUser.role === 'talent'
                      ? '/talent/dashboard'
                      : currentUser.role === 'production'
                      ? '/production/dashboard'
                      : '/admin'
                  }
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
                    currentUser.role === 'talent'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : currentUser.role === 'production'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {currentUser.role === 'talent' && <User className="w-4 h-4" />}
                  {currentUser.role === 'production' && <Building2 className="w-4 h-4" />}
                  {currentUser.role === 'admin' && <ShieldCheck className="w-4 h-4" />}
                  <span>
                    {currentUser.role === 'talent'
                      ? 'Talent Hub'
                      : currentUser.role === 'production'
                      ? 'Production Portal'
                      : 'Admin Control'}
                  </span>
                </Link>

                {/* User avatar, persona switcher & logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <button
                    type="button"
                    onClick={() => setUserSwitchModalOpen(true)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors group text-left"
                    title="Switch user account"
                  >
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop'}
                      alt={currentUser.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20 group-hover:ring-rose-500/50"
                    />
                    <div className="text-left hidden lg:block">
                      <span className="block text-xs font-semibold text-white leading-tight max-w-[120px] truncate group-hover:text-rose-300 transition-colors">
                        {currentUser.full_name}
                      </span>
                      <span className="block text-[10px] text-zinc-400 capitalize">
                        {currentUser.role}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserSwitchModalOpen(true)}
                    title="Switch between all Mollywood users"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Users className="w-4 h-4 text-rose-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-0.5"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUserSwitchModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 border border-white/10"
                  title="Choose from 13+ demo users"
                >
                  <Users className="w-3.5 h-3.5 text-rose-400" />
                  <span>Demo Users</span>
                </button>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/10"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join Network</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Search Buttons */}
          <div className="md:hidden flex items-center gap-1.5">
            {currentUser && (
              <NotificationCenter 
                isMobile={true} 
                onCloseMobileMenu={() => setMobileMenuOpen(false)} 
              />
            )}
            <Link
              to="/favorites"
              className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Saved Favorites"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <button
              id="mobile-search-toggle-btn"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg transition-colors ${
                mobileSearchOpen ? 'text-rose-400 bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Toggle Global Search"
            >
              <Search className="w-5 h-5" />
            </button>
            {currentUser && (
              <Link
                to={
                  currentUser.role === 'talent'
                    ? '/talent/dashboard'
                    : currentUser.role === 'production'
                    ? '/production/dashboard'
                    : '/admin'
                }
                className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-medium"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Global Search Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-[#111218] border-b border-white/10 p-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <GlobalSearch 
            isOpenMobile={true} 
            onCloseMobile={() => setMobileSearchOpen(false)} 
          />
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111217] border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          <div className="pb-2 border-b border-white/10">
            <GlobalSearch onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <div className="space-y-1">
            <Link
              to="/casting"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Casting Calls
            </Link>
            <Link
              to="/talent"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Talent Registry
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Services & Crew Directory
            </Link>
            <Link
              to="/locations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Shooting Locations
            </Link>
            <Link
              to="/#industry-updates"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Industry Wire & Press Releases
            </Link>
            <Link
              to="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Saved Favorites</span>
              </span>
              {favoritesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Child Safety & Fraud Guidelines
            </Link>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-3">
            {currentUser ? (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop'}
                      alt={currentUser.full_name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20"
                    />
                    <div>
                      <span className="block text-xs font-bold text-white leading-tight">
                        {currentUser.full_name}
                      </span>
                      <span className="block text-[10px] text-zinc-400 capitalize">
                        {currentUser.role} Account
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-lg bg-red-950/40 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-red-800/30"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setUserSwitchModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/15"
                  >
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    <span>Switch User</span>
                  </button>

                  <Link
                    to={
                      currentUser.role === 'talent'
                        ? '/talent/dashboard'
                        : currentUser.role === 'production'
                        ? '/production/dashboard'
                        : '/admin'
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-500"
                  >
                    <span>My Dashboard</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-zinc-400">Join or Sign in to Cast Kerala</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-lg bg-white/10 text-white text-xs font-semibold text-center hover:bg-white/15"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold text-center hover:bg-rose-500"
                  >
                    Register
                  </Link>
                </div>
                <button
                  onClick={() => {
                    setUserSwitchModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-black/40 border border-white/10 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Choose from 13+ Demo Personas</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Switch & Persona Directory Modal */}
      <UserSwitchModal
        isOpen={userSwitchModalOpen}
        onClose={() => setUserSwitchModalOpen(false)}
      />
    </header>
  );
};
