import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { IMAGE_BASE_URL } from "../utils/api";
import { 
  Home, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Search, 
  Calendar, 
  Heart, 
  MapPin, 
  User, 
  LogOut,
  Sparkles
} from "lucide-react";

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Define links based on user authentication state and role
  const getNavLinks = () => {
    if (!token || !user) {
      return [
        { to: "/", label: "Home", icon: Home },
        { to: "/login", label: "Login", icon: LogIn },
        { to: "/register", label: "Register", icon: UserPlus },
      ];
    }

    const role = user.role;
    const commonLinks = [
      { to: "/profile", label: "My Profile", icon: User },
    ];

    if (role === "admin") {
      return [
        { to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
        ...commonLinks,
      ];
    }

    if (role === "provider") {
      return [
        { to: "/provider", label: "Provider Dashboard", icon: LayoutDashboard },
        { to: "/services", label: "Browse Services", icon: Search },
        { to: "/my-bookings", label: "My Bookings", icon: Calendar },
        ...commonLinks,
      ];
    }

    // Default to Customer
    return [
      { to: "/customer", label: "Dashboard", icon: LayoutDashboard },
      { to: "/services", label: "Browse Services", icon: Search },
      { to: "/my-bookings", label: "My Bookings", icon: Calendar },
      { to: "/favorites", label: "Favorites", icon: Heart },
      { to: "/addresses", label: "My Addresses", icon: MapPin },
      ...commonLinks,
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6 shadow-2xl border-r border-slate-800">
      {/* Brand Header */}
      <div>
        <div className="flex items-center space-x-3 mb-8 px-2">
          <img src="/logo.png" alt="GharSeva Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-lg shadow-primary-500/20" />
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-400 to-indigo-300 bg-clip-text text-transparent">
              GharSeva
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {token && user ? `${user.role} Portal` : "Welcome Guest"}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/20 scale-[1.02]"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      {token && user && (
        <div className="pt-6 border-t border-slate-800/80">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <img
              src={user.profileImage ? (user.profileImage.startsWith("http") ? user.profileImage : `${IMAGE_BASE_URL}${user.profileImage}`) : "https://via.placeholder.com/150"}
              alt={user.fullName || "User Avatar"}
              className="w-10 h-10 rounded-full object-cover border border-slate-700"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}
