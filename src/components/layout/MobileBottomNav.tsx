import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Clapperboard, Users, LogIn, User } from 'lucide-react';
import { useApp } from '../../lib/store/appStore';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useApp();

  const navItems = [
    {
      id: 'mobile-nav-home',
      name: 'Home',
      path: '/',
      icon: Home,
      exact: true,
    },
    {
      id: 'mobile-nav-casting',
      name: 'Casting',
      path: '/casting',
      icon: Clapperboard,
      exact: false,
    },
    {
      id: 'mobile-nav-talent',
      name: 'Talent',
      path: '/talent',
      icon: Users,
      exact: false,
    },
    {
      id: 'mobile-nav-login',
      name: currentUser ? (currentUser.role === 'production' ? 'Studio' : currentUser.role === 'admin' ? 'Admin' : 'Profile') : 'Login',
      path: '/login',
      icon: currentUser ? User : LogIn,
      exact: false,
    },
  ];

  return (
    <nav 
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 block md:hidden bg-[#07080a]/95 backdrop-blur-xl border-t border-amber-500/25 shadow-[0_-4px_25px_rgba(0,0,0,0.85)] px-2 py-1.5"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-4 items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);

          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.id}
              id={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-zinc-400 hover:text-amber-200/90 active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.4] text-amber-400 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
                )}
              </div>
              <span className={`text-[11px] tracking-tight mt-1 truncate max-w-[70px] ${isActive ? 'text-amber-400 font-semibold' : 'text-zinc-400'}`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
