import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, ShieldAlert, CheckCircle, Menu } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { fetchNotifications, markNotificationRead } from '../store/slices/notificationsSlice';
import { IMAGE_BASE_URL } from '../utils/api';


const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notifications);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (token) {
      dispatch(fetchNotifications());
      // Poll notifications every 30 seconds for real-time feel
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, token]);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNotificationClick = (id) => {
    dispatch(markNotificationRead(id));
    setShowNotifications(false);
    // Navigate based on type
    if (user?.role === 'customer') {
      navigate('/my-bookings');
    } else if (user?.role === 'provider') {
      navigate('/my-bookings');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {token && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="GharSeva Logo" className="h-8 object-contain drop-shadow-sm" />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight">
            GharSeva
          </span>
          <span className="bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full font-semibold hidden sm:inline-block">
            Marketplace
          </span>
        </Link>
      </div>

      {/* Nav Controls */}
      <div className="flex items-center gap-4">
        {token ? (
          <>
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-full transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-2 custom-scrollbar max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <Link to="/notifications" className="text-xs text-primary-600 hover:underline font-medium" onClick={() => setShowNotifications(false)}>
                        View All
                      </Link>
                    )}
                  </div>
                  <div className="divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif._id)}
                          className={`p-3.5 cursor-pointer transition-all flex items-start gap-2.5 hover:bg-slate-50 ${!notif.isRead ? 'bg-primary-50/20' : ''}`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${!notif.isRead ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                            {notif.type.includes('reject') ? <ShieldAlert size={14} /> : <CheckCircle size={14} />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-700">{notif.title}</div>
                            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{notif.message}</div>
                            <div className="text-[9px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-slate-50 text-center py-2">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-slate-500 hover:text-primary-600 font-semibold"
                    >
                      Open Notifications Center
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-full transition-all focus:outline-none"
              >
                {user?.profileImage ? (
                  <img
                    src={`${IMAGE_BASE_URL}${user.profileImage}`}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                    {getUserInitials(user?.fullName)}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700 hidden sm:inline-block max-w-[100px] truncate">
                  {user?.fullName}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1">
                  <div className="px-4 py-2.5 border-b border-slate-50">
                    <div className="text-xs font-bold text-slate-700 truncate">{user?.fullName}</div>
                    <div className="text-[10px] text-slate-400 capitalize truncate mt-0.5">{user?.role} Portal</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <User size={14} /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-all text-left"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-primary-600 py-2 px-4 transition-all">
              Login
            </Link>
            <Link to="/register" className="text-xs font-extrabold text-white bg-primary-600 hover:bg-primary-700 py-2 px-4 rounded-xl transition-all shadow-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
