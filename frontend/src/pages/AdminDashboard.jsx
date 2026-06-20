import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats, fetchAllUsers, toggleUserStatus,
  fetchProviderApplications, approveApplication, rejectApplication,
  fetchActivityLogs, broadcastNotification, clearAdminMessages
} from "../store/slices/adminSlice";
import { fetchComplaints, resolveComplaintThunk } from "../store/slices/complaintsSlice";
import { Users, Briefcase, CalendarDays, DollarSign, Clock, CheckCircle, Loader2, ShieldCheck, ShieldX, Megaphone, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats, analytics, users, applications, logs, loading, successMsg, error } = useSelector((state) => state.admin);
  const { complaints } = useSelector((state) => state.complaints);

  const [activeTab, setActiveTab] = useState("overview");
  const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "" });

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllUsers());
    dispatch(fetchProviderApplications());
    dispatch(fetchComplaints());
    dispatch(fetchActivityLogs());
  }, [dispatch]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => dispatch(clearAdminMessages()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, dispatch]);

  const handleToggleUser = (id) => dispatch(toggleUserStatus(id));
  const handleApprove = (id) => dispatch(approveApplication(id));
  const handleReject = (id) => dispatch(rejectApplication(id));
  const handleResolve = (id) => dispatch(resolveComplaintThunk(id));

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    dispatch(broadcastNotification(broadcastForm));
    setBroadcastForm({ title: "", message: "" });
  };

  const tabs = ["overview", "users", "applications", "complaints", "broadcast", "logs"];

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Providers", value: stats.totalProviders, icon: Briefcase },
    { label: "Services", value: stats.totalServices, icon: Briefcase },
    { label: "Bookings", value: stats.totalBookings, icon: CalendarDays },
    { label: "Completed", value: stats.completedBookings, icon: CheckCircle },
    { label: "Pending Apps", value: stats.pendingRequests, icon: Clock },
    { label: "Admin Earnings", value: `₹${stats.totalRevenue}`, icon: DollarSign },
    { label: "Provider Earnings", value: `₹${stats.totalProvider}`, icon: DollarSign }
  ] : [];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={32} />
        <span className="ml-3 text-slate-500 font-medium">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-primary-800">Admin Dashboard</h1>

      {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium">{successMsg}</div>}
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium">{error}</div>}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100">
            <card.icon size={16} className="text-primary-600 mb-1.5" />
            <p className="text-xl font-extrabold text-slate-800">{card.value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition capitalize whitespace-nowrap ${activeTab === tab ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab - Charts */}
      {activeTab === "overview" && analytics && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 text-sm">Monthly Bookings</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.monthlyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 text-sm">Service Categories</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={analytics.categoryDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {analytics.categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{u.fullName}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
                    <td className="px-4 py-3"><span className="text-[10px] font-bold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full capitalize">{u.role}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.isActive !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {u.isActive !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleUser(u._id)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${u.isActive !== false ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                        {u.isActive !== false ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No provider applications.</div>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{app.fullName} — {app.email}</p>
                  <p className="text-[11px] text-slate-400">Phone: {app.phone} • Applied as: {app.role}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${app.approvalStatus === "pending" ? "bg-amber-50 text-amber-700" : app.approvalStatus === "approved" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{app.approvalStatus}</span>
                </div>
                {app.approvalStatus === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleApprove(app._id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-semibold hover:bg-green-700 transition"><ShieldCheck size={12} /> Approve</button>
                    <button onClick={() => handleReject(app._id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg font-semibold hover:bg-red-200 transition"><ShieldX size={12} /> Reject</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Complaints Tab */}
      {activeTab === "complaints" && (
        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No complaints filed.</div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.subject || "Complaint"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1">By: {c.userId?.fullName || "User"} • {new Date(c.createdAt).toLocaleDateString()}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${c.status === "resolved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{c.status}</span>
                </div>
                {c.status !== "resolved" && (
                  <button onClick={() => handleResolve(c._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-semibold hover:bg-green-700 transition shrink-0">Resolve</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Broadcast Tab */}
      {activeTab === "broadcast" && (
        <form onSubmit={handleBroadcast} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4 max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone size={18} className="text-primary-600" />
            <h3 className="font-bold text-slate-800">Broadcast Notification</h3>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
            <input type="text" value={broadcastForm.title} onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
            <textarea value={broadcastForm.message} onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })} rows={3} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none resize-none" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition">Send to All Users</button>
        </form>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="sticky top-0">
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase">Time</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase">User</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase">Action</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-[11px] text-slate-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-700">{log.userId?.fullName || "System"}</td>
                    <td className="px-4 py-2.5"><span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{log.action}</span></td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
