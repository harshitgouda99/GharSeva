import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCustomerBookings } from "../store/slices/bookingsSlice";
import { fetchFavorites } from "../store/slices/favoritesSlice";
import { CalendarDays, Heart, Clock, CheckCircle, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { IMAGE_BASE_URL } from "../utils/api";

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading } = useSelector((state) => state.bookings);
  const { favorites } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchCustomerBookings());
    dispatch(fetchFavorites());
  }, [dispatch]);

  const pendingCount = bookings.filter((b) => b.bookingStatus === "pending").length;
  const completedCount = bookings.filter((b) => b.bookingStatus === "completed").length;
  const acceptedCount = bookings.filter((b) => b.bookingStatus === "accepted").length;

  const statCards = [
    { label: "Total Bookings", value: bookings.length, icon: CalendarDays, color: "primary" },
    { label: "Pending", value: pendingCount, icon: Clock, color: "amber" },
    { label: "In Progress", value: acceptedCount, icon: CalendarDays, color: "blue" },
    { label: "Completed", value: completedCount, icon: CheckCircle, color: "green" },
    { label: "Favorites", value: favorites.length, icon: Heart, color: "pink" },
  ];

  const recentBookings = bookings.slice(0, 5);

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700",
      accepted: "bg-blue-50 text-blue-700",
      completed: "bg-green-50 text-green-700",
      rejected: "bg-red-50 text-red-700",
    };
    return `px-2.5 py-1 text-[10px] font-bold rounded-full ${styles[status] || "bg-slate-50 text-slate-600"}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-800">
          Welcome back, {user?.fullName || user?.name || "Customer"}! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here's your activity overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className={`p-2 bg-${card.color}-50 rounded-lg w-fit mb-2`}>
              <card.icon size={18} className={`text-${card.color}-600`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-800">{loading ? "—" : card.value}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Browse Services", to: "/services", icon: "🔍" },
          { label: "My Bookings", to: "/my-bookings", icon: "📅" },
          { label: "Favorites", to: "/favorites", icon: "❤️" },
          { label: "My Addresses", to: "/addresses", icon: "📍" },
        ].map((action) => (
          <Link key={action.to} to={action.to} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-200 transition flex items-center gap-3 group">
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary-700 transition">{action.label}</span>
            <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-primary-500 transition" />
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recent Bookings</h2>
          <Link to="/my-bookings" className="text-xs text-primary-600 hover:underline font-semibold">View All</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-primary-600" size={24} />
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No bookings yet. <Link to="/services" className="text-primary-600 hover:underline">Browse services</Link></div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentBookings.map((b) => (
              <div key={b._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition">
                <div className="flex items-center gap-3">
                  {b.serviceId?.serviceImage ? (
                    <img src={`${IMAGE_BASE_URL}${b.serviceId.serviceImage}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">SVC</div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{b.serviceId?.serviceTitle || "Service"}</p>
                    <p className="text-[11px] text-slate-400">{new Date(b.bookingDate || b.createdAt).toLocaleDateString()} • {b.providerId?.fullName || "Provider"}</p>
                  </div>
                </div>
                <span className={statusBadge(b.bookingStatus)}>{b.bookingStatus}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
