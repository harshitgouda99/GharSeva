import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead 
} from "../store/slices/notificationsSlice";
import { Bell, BellOff, ShieldAlert, CheckCircle, MailOpen, Trash2 } from "lucide-react";

export default function Notifications() {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100 mt-6">
      <div className="flex justify-between items-center pb-6 border-b border-slate-100 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notification Center</h1>
            <p className="text-xs text-slate-500">Manage and view your system updates</p>
          </div>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-2 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition"
          >
            <MailOpen className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm">Fetching notifications...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl mb-4 font-medium">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            <BellOff className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-base font-semibold text-slate-600">All caught up!</p>
          <p className="text-xs text-slate-400 mt-1">You don't have any notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && handleMarkRead(notif._id)}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                !notif.isRead 
                  ? 'bg-primary-50/10 border-primary-100 hover:bg-primary-50/20 cursor-pointer shadow-sm' 
                  : 'bg-white border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${
                !notif.isRead 
                  ? 'bg-primary-100 text-primary-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {notif.type.includes('reject') ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-bold text-slate-800 ${!notif.isRead ? 'text-primary-900' : ''}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                {!notif.isRead && (
                  <span className="inline-block text-[9px] font-bold text-primary-600 bg-primary-100/60 px-2 py-0.5 rounded-full mt-2">
                    New Action
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
