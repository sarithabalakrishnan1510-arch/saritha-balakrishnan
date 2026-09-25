import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Clapperboard, 
  MapPin, 
  Building2, 
  CheckCheck, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  PlusCircle, 
  X,
  FileText,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../lib/store/appStore';
import { Notification } from '../../types';

interface NotificationCenterProps {
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  isMobile = false,
  onCloseMobileMenu
}) => {
  const { 
    currentUser, 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    triggerNewCastingMatchAlert,
    triggerNewLocationBookingAlert
  } = useApp();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'matches' | 'locations'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter notifications for current user (or fallback to talent_1 if logged in)
  const currentUserId = currentUser?.id || 'user_talent_1';
  const userNotifications = notifications.filter(n => n.user_id === currentUserId);

  // Categorize
  const castingMatchNotifications = userNotifications.filter(n => 
    n.type === 'casting_exact_match' || 
    n.type === 'casting_strong_match' || 
    n.type === 'casting_match' || 
    n.entity_type === 'casting_role' ||
    n.entity_type === 'casting_call'
  );

  const locationBookingNotifications = userNotifications.filter(n => 
    n.type === 'location_booking_update' || 
    n.type === 'location_booking_confirmed' || 
    n.type === 'location_saved_update' || 
    n.entity_type === 'location' ||
    n.entity_type === 'location_booking'
  );

  const unreadMatchesCount = castingMatchNotifications.filter(n => !n.is_read).length;
  const unreadLocationsCount = locationBookingNotifications.filter(n => !n.is_read).length;
  const currentUnreadCount = userNotifications.filter(n => !n.is_read).length;

  // Items to display based on active tab
  const displayedNotifications = activeTab === 'matches'
    ? castingMatchNotifications
    : activeTab === 'locations'
    ? locationBookingNotifications
    : userNotifications;

  const handleNotificationClick = (notif: Notification) => {
    markNotificationAsRead(notif.id);
    if (notif.action_url) {
      setIsOpen(false);
      if (onCloseMobileMenu) onCloseMobileMenu();
      navigate(notif.action_url);
    } else if (notif.entity_type === 'location' || notif.entity_type === 'location_booking') {
      setIsOpen(false);
      if (onCloseMobileMenu) onCloseMobileMenu();
      navigate('/locations');
    } else if (notif.entity_type === 'casting_role' || notif.entity_type === 'casting_call') {
      setIsOpen(false);
      if (onCloseMobileMenu) onCloseMobileMenu();
      navigate('/casting');
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Notification Trigger Button with Badge */}
      <button
        id={isMobile ? 'mobile-notifications-bell-btn' : 'notifications-bell-btn'}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 group ${
          isOpen 
            ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40' 
            : 'text-zinc-300 hover:text-amber-200 hover:bg-white/10'
        }`}
        aria-label="Notifications"
        aria-expanded={isOpen}
        title={
          currentUnreadCount > 0 
            ? `${currentUnreadCount} unread alerts (${unreadMatchesCount} casting matches, ${unreadLocationsCount} location updates)` 
            : 'Notifications'
        }
      >
        <Bell className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentUnreadCount > 0 ? 'text-amber-400' : 'text-zinc-400'}`} />

        {/* Dynamic Badge with Unread Counter */}
        {currentUnreadCount > 0 && (
          <span 
            id="navbar-notification-badge"
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-[10px] font-extrabold shadow-lg shadow-amber-950/60 ring-2 ring-[#0c0d10] animate-in zoom-in-50 duration-200"
          >
            {currentUnreadCount > 9 ? '9+' : currentUnreadCount}
            <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div
          id="notification-dropdown-panel"
          className={`absolute ${
            isMobile ? 'right-0 w-[calc(100vw-2rem)] max-w-sm' : 'right-0 w-96 sm:w-[420px]'
          } mt-2 rounded-2xl bg-[#0d0e14]/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl z-[100] overflow-hidden text-white animate-in fade-in slide-in-from-top-2 duration-150`}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#151720] via-black to-[#0d0e14] border-b border-amber-500/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Alerts & Notifications</h3>
                  {currentUnreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      {currentUnreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">Casting matches & location booking updates</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {currentUnreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={markAllNotificationsAsRead}
                  className="px-2 py-1 rounded-md text-[11px] text-amber-300 hover:text-white hover:bg-amber-500/20 transition-colors flex items-center gap-1 font-semibold"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter Category Tabs */}
          <div className="px-3 pt-2.5 pb-2 bg-[#090a0f] border-b border-amber-500/15 flex items-center gap-1.5 text-xs">
            <button
              id="filter-all-notifs-btn"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <span>All</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'all' ? 'bg-amber-500/30 text-amber-200' : 'bg-white/5 text-zinc-400'
              }`}>
                {userNotifications.length}
              </span>
            </button>

            <button
              id="filter-casting-matches-btn"
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'matches'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Casting Matches</span>
              {unreadMatchesCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-extrabold">
                  {unreadMatchesCount}
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 text-zinc-400">
                  {castingMatchNotifications.length}
                </span>
              )}
            </button>

            <button
              id="filter-location-bookings-btn"
              onClick={() => setActiveTab('locations')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'locations'
                  ? 'bg-yellow-600/30 text-yellow-200 border border-yellow-500/40 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-yellow-400" />
              <span>Bookings</span>
              {unreadLocationsCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-yellow-500 text-zinc-950 font-bold">
                  {unreadLocationsCount}
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 text-zinc-400">
                  {locationBookingNotifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Summary Pill Bar when there are active matches or updates */}
          {(unreadMatchesCount > 0 || unreadLocationsCount > 0) && (
            <div className="px-3 py-1.5 bg-amber-950/20 border-b border-amber-900/30 flex items-center justify-between text-[11px] text-amber-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>
                  {unreadMatchesCount > 0 && `${unreadMatchesCount} new casting match${unreadMatchesCount > 1 ? 'es' : ''}`}
                  {unreadMatchesCount > 0 && unreadLocationsCount > 0 && ' • '}
                  {unreadLocationsCount > 0 && `${unreadLocationsCount} location booking update${unreadLocationsCount > 1 ? 's' : ''}`}
                </span>
              </span>
              <span className="text-[10px] text-zinc-400">Tap to inspect</span>
            </div>
          )}

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-amber-500/40">
                  {activeTab === 'matches' ? (
                    <Clapperboard className="w-6 h-6" />
                  ) : activeTab === 'locations' ? (
                    <MapPin className="w-6 h-6" />
                  ) : (
                    <Bell className="w-6 h-6" />
                  )}
                </div>
                <p className="text-xs font-medium text-zinc-300">
                  {activeTab === 'matches'
                    ? 'No casting call matches yet'
                    : activeTab === 'locations'
                    ? 'No location booking updates yet'
                    : 'All caught up! No notifications'}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                  {activeTab === 'matches'
                    ? 'Update your talent profile and playing age to unlock automated match alerts.'
                    : activeTab === 'locations'
                    ? 'Save shooting locations to your favorites to receive caretaker and permit clearances.'
                    : 'We will notify you about new roles and shooting property approvals.'}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={triggerNewCastingMatchAlert}
                    className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-semibold border border-amber-500/30"
                  >
                    + Test Match
                  </button>
                  <button
                    onClick={triggerNewLocationBookingAlert}
                    className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 text-[11px] font-semibold border border-yellow-500/30"
                  >
                    + Test Booking
                  </button>
                </div>
              </div>
            ) : (
              displayedNotifications.map(notif => {
                const isMatch = notif.type === 'casting_exact_match' || notif.type === 'casting_strong_match' || notif.type === 'casting_match';
                const isLocation = notif.type === 'location_booking_update' || notif.type === 'location_booking_confirmed' || notif.type === 'location_saved_update' || notif.entity_type === 'location' || notif.entity_type === 'location_booking';

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors group relative ${
                      !notif.is_read
                        ? 'bg-amber-500/[0.06] border-l-2 border-l-amber-500 hover:bg-amber-500/[0.1]'
                        : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon Avatar */}
                      <div className="shrink-0 mt-0.5">
                        {isMatch ? (
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                            <Clapperboard className="w-4 h-4" />
                          </div>
                        ) : isLocation ? (
                          notif.location_image ? (
                            <img
                              src={notif.location_image}
                              alt={notif.location_name || 'Location'}
                              className="w-9 h-9 rounded-lg object-cover border border-white/10 ring-1 ring-amber-500/30"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-yellow-600/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shadow-sm">
                              <Building2 className="w-4 h-4" />
                            </div>
                          )
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
                            <Bell className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0">
                        {/* Header Badges & Time */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isMatch && (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                (notif.match_score || 0) >= 90 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>{notif.match_score ? `${notif.match_score}% Match` : 'Casting Match'}</span>
                              </span>
                            )}

                            {isLocation && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>
                                  {notif.booking_status === 'caretaker_approved' 
                                    ? 'Caretaker Approved' 
                                    : notif.booking_status === 'permit_cleared' 
                                    ? 'Permit Cleared' 
                                    : 'Booking Update'}
                                </span>
                              </span>
                            )}

                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                            )}
                          </div>

                          <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                            {formatRelativeTime(notif.created_at)}
                          </span>
                        </div>

                        {/* Title & Body */}
                        <h4 
                          onClick={() => handleNotificationClick(notif)}
                          className="text-xs font-semibold text-white hover:text-amber-300 cursor-pointer transition-colors line-clamp-1"
                        >
                          {notif.title}
                        </h4>

                        <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed line-clamp-2">
                          {notif.body}
                        </p>

                        {/* Specific Match Details Pill Strip */}
                        {isMatch && notif.match_reasons && notif.match_reasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {notif.match_reasons.slice(0, 2).map((reason, idx) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                                • {reason}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Specific Location Booking Pill Strip */}
                        {isLocation && (notif.booking_ref || notif.shift_dates) && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
                            {notif.booking_ref && (
                              <span className="font-mono text-zinc-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                {notif.booking_ref}
                              </span>
                            )}
                            {notif.shift_dates && (
                              <span className="flex items-center gap-1 text-zinc-400">
                                <Calendar className="w-3 h-3 text-amber-400" />
                                {notif.shift_dates}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions Row */}
                        <div className="mt-2.5 flex items-center justify-between gap-2 pt-1.5 border-t border-white/5">
                          <button
                            onClick={() => handleNotificationClick(notif)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <span>
                              {isMatch ? 'Inspect Match' : isLocation ? 'View Location Details' : 'View Details'}
                            </span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {!notif.is_read ? (
                              <button
                                onClick={() => markNotificationAsRead(notif.id)}
                                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-amber-200 text-[10px]"
                                title="Mark as read"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 text-[10px]"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Real-time simulation bar to test badge increments directly */}
          <div className="p-2.5 bg-black/60 border-t border-amber-500/20 flex items-center justify-between gap-2">
            <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">
              Simulate Live Alerts:
            </span>
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                id="simulate-casting-match-alert-btn"
                onClick={triggerNewCastingMatchAlert}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1 shadow-sm"
                title="Simulate a new casting call match notification and increment the Navbar badge"
              >
                <PlusCircle className="w-3 h-3 text-amber-400" />
                <span>+ Match Alert</span>
              </button>
              <button
                id="simulate-location-booking-alert-btn"
                onClick={triggerNewLocationBookingAlert}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 transition-all flex items-center gap-1 shadow-sm"
                title="Simulate an update to saved location bookings and increment the Navbar badge"
              >
                <PlusCircle className="w-3 h-3 text-yellow-400" />
                <span>+ Booking Alert</span>
              </button>
            </div>
          </div>

          {/* Footer Destination Links */}
          <div className="p-2.5 bg-[#090a0f] border-t border-amber-500/15 flex items-center justify-between text-xs font-medium">
            <Link
              to="/favorites"
              onClick={() => {
                setIsOpen(false);
                if (onCloseMobileMenu) onCloseMobileMenu();
              }}
              className="text-zinc-400 hover:text-amber-200 flex items-center gap-1 text-[11px]"
            >
              <span>Saved Locations Vault</span>
              <ChevronRight className="w-3 h-3" />
            </Link>

            <Link
              to={
                currentUser?.role === 'talent'
                  ? '/talent/dashboard'
                  : currentUser?.role === 'production'
                  ? '/production/dashboard'
                  : '/admin'
              }
              onClick={() => {
                setIsOpen(false);
                if (onCloseMobileMenu) onCloseMobileMenu();
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <span>Full Dashboard</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
