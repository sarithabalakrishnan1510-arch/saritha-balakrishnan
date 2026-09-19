import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Building2, 
  User, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  LogOut,
  Mail,
  Key,
  MapPin,
  Phone,
  Film,
  CheckCircle2,
  Users,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { UserRole, KeralaDistrict } from '../types';

const KERALA_DISTRICTS: KeralaDistrict[] = [
  'Ernakulam',
  'Thiruvananthapuram',
  'Kozhikode',
  'Thrissur',
  'Palakkad',
  'Alappuzha',
  'Kottayam',
  'Kannur',
  'Malappuram',
  'Idukki',
  'Pathanamthitta',
  'Kollam',
  'Wayanad',
  'Kasaragod'
];

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, loginAs, loginUserById, registerUser, logout, allRegisteredUsers } = useApp();

  const queryMode = searchParams.get('mode');
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'directory'>(
    queryMode === 'signup' || initialMode === 'signup' ? 'signup' : 'login'
  );

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('devika.mohan@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginRole, setLoginRole] = useState<UserRole>('talent');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Sign Up Form State
  const [regRole, setRegRole] = useState<UserRole>('talent');
  const [regFullName, setRegFullName] = useState('');
  const [regStageOrCompany, setRegStageOrCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState<KeralaDistrict>('Ernakulam');
  const [regCity, setRegCity] = useState('Kochi');
  const [regCategory, setRegCategory] = useState('Lead Actress / Actor');
  const [regBio, setRegBio] = useState('');
  const [regAgreeGuidelines, setRegAgreeGuidelines] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  // Directory Search State
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | UserRole>('all');

  // Handle Preset Selection for fast testing
  const handleSelectPresetRole = (role: UserRole) => {
    setLoginRole(role);
    setLoginError(null);
    if (role === 'talent') {
      setLoginEmail('devika.mohan@gmail.com');
    } else if (role === 'production') {
      setLoginEmail('anwar@anwarrasheed.com');
    } else if (role === 'admin') {
      setLoginEmail('admin@castkerala.org');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim()) {
      setLoginError('Please enter your registered email address.');
      return;
    }

    const ok = loginAs(loginEmail.trim(), loginRole);
    if (ok) {
      setLoginSuccess(`Welcome back! Logged in as ${loginRole.toUpperCase()}`);
      setTimeout(() => {
        if (loginRole === 'talent') navigate('/talent/dashboard');
        else if (loginRole === 'production') navigate('/production/dashboard');
        else navigate('/admin');
      }, 500);
    } else {
      setLoginError('Account not found with this email. Try selecting one of the demo accounts below or create a new account.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regFullName.trim()) {
      setRegError('Full Name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email is required.');
      return;
    }
    if (!regAgreeGuidelines) {
      setRegError('You must agree to the FEFKA & Film Chamber Safe Filming guidelines to proceed.');
      return;
    }

    const res = registerUser({
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || '+91 98470 12345',
      role: regRole,
      district: regDistrict,
      city: regCity.trim() || 'Kochi',
      stage_name: regStageOrCompany.trim() || undefined,
      company_name: regStageOrCompany.trim() || undefined,
      primary_category: regCategory,
      bio: regBio.trim() || undefined,
    });

    if (res.success) {
      setLoginSuccess(`Account created! Welcome to Cast Kerala, ${res.user.full_name}`);
      setTimeout(() => {
        if (regRole === 'talent') navigate('/talent/dashboard');
        else if (regRole === 'production') navigate('/production/dashboard');
        else navigate('/admin');
      }, 600);
    } else {
      setRegError(res.error || 'Failed to create account.');
    }
  };

  const handleDirectUserLogin = (userId: string, userName: string, role: UserRole) => {
    loginUserById(userId);
    setLoginSuccess(`Signed in as ${userName} (${role})`);
    setTimeout(() => {
      if (role === 'talent') navigate('/talent/dashboard');
      else if (role === 'production') navigate('/production/dashboard');
      else navigate('/admin');
    }, 400);
  };

  const filteredDirectoryUsers = allRegisteredUsers.filter(u => {
    if (directoryFilter !== 'all' && u.role !== directoryFilter) return false;
    if (directorySearch.trim()) {
      const q = directorySearch.toLowerCase();
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kerala Film Chamber & FEFKA Authorized Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-cinematic tracking-tight">
          Cast Kerala Authentication Desk
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto">
          Log in to access your Malayalam cinema casting calls, talent registry, audition tapes, and production shift controllers.
        </p>
      </div>

      {/* Active Session Notification (if logged in) */}
      {currentUser && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141724] to-[#1a121c] border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop'}
              alt={currentUser.full_name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{currentUser.full_name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  currentUser.role === 'talent'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : currentUser.role === 'production'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {currentUser.role}
                </span>
                <span className="text-emerald-400 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Session
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {currentUser.email_private} • {currentUser.city}, {currentUser.district}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={
                currentUser.role === 'talent'
                  ? '/talent/dashboard'
                  : currentUser.role === 'production'
                  ? '/production/dashboard'
                  : '/admin'
              }
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => {
                logout();
                setLoginSuccess('You have been signed out.');
                setTimeout(() => setLoginSuccess(null), 2000);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Success / Error Alerts */}
      {loginSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{loginSuccess}</span>
        </div>
      )}

      {loginError && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{loginError}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#11131c] border border-white/10 max-w-xl mx-auto">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'login'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Log In</span>
        </button>

        <button
          onClick={() => setActiveTab('signup')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'signup'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Create Account</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'directory'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>1-Click Directory ({allRegisteredUsers.length})</span>
        </button>
      </div>

      {/* TAB 1: LOG IN */}
      {activeTab === 'login' && (
        <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-150">
          {/* Preset Demo Switcher */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-zinc-400">Quick 1-Click Persona Pre-fill:</span>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#11131c] border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => handleSelectPresetRole('talent')}
                className={`py-2 px-1 rounded-xl font-semibold flex flex-col items-center gap-1 transition-all ${
                  loginRole === 'talent'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Devika (Actor)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPresetRole('production')}
                className={`py-2 px-1 rounded-xl font-semibold flex flex-col items-center gap-1 transition-all ${
                  loginRole === 'production'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Anwar (Producer)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPresetRole('admin')}
                className={`py-2 px-1 rounded-xl font-semibold flex flex-col items-center gap-1 transition-all ${
                  loginRole === 'admin'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Desk</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 rounded-2xl bg-[#131520] border border-white/10 space-y-4 shadow-xl">
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Any registered Mollywood user</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="name@castkerala.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Demo: password123</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>Sign In as {loginRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center border-t border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors inline-flex items-center gap-1 font-medium"
              >
                <span>Browse all 13+ actors & production houses in directory</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTER / SIGN UP */}
      {activeTab === 'signup' && (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-[#131520] border border-white/10 space-y-5 shadow-xl">
            <div>
              <h2 className="text-base font-bold text-white">Create New Mollywood Account</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Join Kerala's verified directory of artists, casting directors, and film technicians.
              </p>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {/* Role Selection */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1.5">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('talent');
                      setRegCategory('Lead Actor / Actress');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      regRole === 'talent'
                        ? 'bg-rose-600/15 border-rose-500 text-white ring-1 ring-rose-500/30'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <User className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold text-xs">Actor / Talent</span>
                      <span className="text-[10px] text-zinc-400">Performers, dancers, voice artists, child artists</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('production');
                      setRegCategory('Producer / Casting Director');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      regRole === 'production'
                        ? 'bg-amber-600/15 border-amber-500 text-white ring-1 ring-amber-500/30'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-bold text-xs">Production House</span>
                      <span className="text-[10px] text-zinc-400">Banners, casting directors, line producers</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    placeholder="e.g. Anandha Krishnan"
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    {regRole === 'talent' ? 'Stage Name (Optional)' : 'Production Banner Name *'}
                  </label>
                  <input
                    type="text"
                    value={regStageOrCompany}
                    onChange={e => setRegStageOrCompany(e.target.value)}
                    placeholder={regRole === 'talent' ? 'Screen name' : 'e.g. Malabar Motion Pictures'}
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="you@mollywood.com"
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Phone Number (Private)</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+91 94470 12345"
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Location & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Kerala District *</label>
                  <select
                    value={regDistrict}
                    onChange={e => setRegDistrict(e.target.value as KeralaDistrict)}
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    {KERALA_DISTRICTS.map(dist => (
                      <option key={dist} value={dist} className="bg-[#111218] text-white">
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">City / Town Base</label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={e => setRegCity(e.target.value)}
                    placeholder="e.g. Fort Kochi, Panampilly Nagar"
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Category & Bio */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Primary Specialization</label>
                <input
                  type="text"
                  value={regCategory}
                  onChange={e => setRegCategory(e.target.value)}
                  placeholder="e.g. Character Artist, Classical Dancer, Line Producer"
                  className="w-full px-3 py-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Experience & Bio Highlights</label>
                <textarea
                  rows={3}
                  value={regBio}
                  onChange={e => setRegBio(e.target.value)}
                  placeholder="Tell casting directors about your past theatre, short film, or feature film projects..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Safety Compliance Check */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="agree-guidelines"
                  checked={regAgreeGuidelines}
                  onChange={e => setRegAgreeGuidelines(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="agree-guidelines" className="text-[11px] text-zinc-300 leading-tight">
                  I agree to abide by the Kerala Film Chamber and FEFKA safety guidelines, including strict anti-fraud rules and ethical audition protocols.
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>Create Account & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: 1-CLICK DIRECTORY OF ALL MOLLYWOOD USERS */}
      {activeTab === 'directory' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filter and search bar */}
          <div className="p-4 rounded-2xl bg-[#131520] border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={directorySearch}
                onChange={e => setDirectorySearch(e.target.value)}
                placeholder="Search by actor name, director, studio, district, or email..."
                className="w-full pl-9 pr-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDirectoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  directoryFilter === 'all'
                    ? 'bg-white text-black font-bold'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                All ({allRegisteredUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setDirectoryFilter('talent')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  directoryFilter === 'talent'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                Actors ({allRegisteredUsers.filter(u => u.role === 'talent').length})
              </button>
              <button
                type="button"
                onClick={() => setDirectoryFilter('production')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  directoryFilter === 'production'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                Studios ({allRegisteredUsers.filter(u => u.role === 'production').length})
              </button>
              <button
                type="button"
                onClick={() => setDirectoryFilter('admin')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  directoryFilter === 'admin'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                Admin Desk
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDirectoryUsers.map(user => {
              const isCurrent = currentUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isCurrent
                      ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/25'
                      : 'bg-[#141722] hover:bg-[#181b28] border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop'}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                      />
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#141722] ${
                        user.role === 'talent'
                          ? 'bg-rose-500'
                          : user.role === 'production'
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                      }`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{user.name}</span>
                        {user.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'talent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : user.role === 'production'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {user.subtitle}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span>{user.district}</span>
                        </span>
                        <span>•</span>
                        <span className="text-zinc-400 font-mono text-[10px] truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    {isCurrent ? (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Active User
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500">Ready to simulate</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDirectUserLogin(user.id, user.name, user.role)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-white/10 text-zinc-300 hover:bg-white/20'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                      }`}
                    >
                      <span>{isCurrent ? 'Continue' : 'Log In as User'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
