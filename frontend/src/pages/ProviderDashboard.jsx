import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProviderBookings, acceptBookingThunk, rejectBookingThunk, completeBookingThunk } from "../store/slices/bookingsSlice";
import { fetchMyServices, createServiceThunk, updateServiceThunk, deleteServiceThunk, fetchCategories } from "../store/slices/servicesSlice";
import { Briefcase, DollarSign, CheckCircle, Clock, Plus, Pencil, Trash2, Loader2, Star, X } from "lucide-react";
import api from "../utils/api";
import StarRating from "../components/StarRating";
import { fetchProviderReviews } from "../store/slices/reviewsSlice";

export default function ProviderDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const { providerServices, categories, loading: servicesLoading } = useSelector((state) => state.services);
const { reviews: providerReviews, loading: reviewsLoading } = useSelector((state) => state.reviews);

  const [earnings, setEarnings] = useState(0);
  const [activeTab, setActiveTab] = useState("bookings");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ categoryId: "", serviceTitle: "", description: "", price: "" });
  const [serviceImage, setServiceImage] = useState(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [completionOtp, setCompletionOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const fetchEarnings = () => {
    api.get("/earnings/my").then((res) => {
      if (res.data.success) {
        const total = (res.data.earnings || []).reduce((sum, e) => sum + (e.providerAmount || 0), 0);
        setEarnings(total);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    dispatch(fetchProviderBookings());
    dispatch(fetchMyServices());
    dispatch(fetchCategories());
    fetchEarnings();
    if (user && user._id) {
      dispatch(fetchProviderReviews(user._id));
    }
  }, [dispatch, user]);

  const pendingBookings = bookings.filter((b) => b.bookingStatus === "pending");
  const acceptedBookings = bookings.filter((b) => b.bookingStatus === "accepted");
  const completedCount = bookings.filter((b) => b.bookingStatus === "completed").length;

  const handleAccept = (id) => dispatch(acceptBookingThunk(id));
  const handleReject = (id) => dispatch(rejectBookingThunk(id));
  
  const initiateComplete = async (id) => {
    try {
      const res = await api.post(`/bookings/${id}/send-completion-otp`);
      if (res.data.success) {
        setCurrentBookingId(id);
        setShowOtpModal(true);
        setCompletionOtp("");
        alert("OTP sent to customer's email");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const submitCompletionOtp = async () => {
    if (completionOtp.length !== 6) return alert("OTP must be 6 digits");
    setOtpLoading(true);
    try {
      const res = await api.post(`/bookings/${currentBookingId}/verify-completion-otp`, { otp: completionOtp });
      if (res.data.success) {
        setShowOtpModal(false);
        dispatch(fetchProviderBookings());
        fetchEarnings();
        alert("Booking completed successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const resetServiceForm = () => {
    setServiceForm({ categoryId: "", serviceTitle: "", description: "", price: "" });
    setServiceImage(null);
    setEditingService(null);
    setShowServiceForm(false);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("categoryId", serviceForm.categoryId);
    formData.append("serviceTitle", serviceForm.serviceTitle);
    formData.append("description", serviceForm.description);
    formData.append("price", serviceForm.price);
    if (serviceImage) formData.append("serviceImage", serviceImage);

    try {
      if (editingService) {
        await dispatch(updateServiceThunk({ id: editingService._id, formData })).unwrap();
      } else {
        await dispatch(createServiceThunk(formData)).unwrap();
      }
      resetServiceForm();
    } catch (err) {
      console.error("Service save failed", err);
    }
  };

  const handleEditService = (svc) => {
    setEditingService(svc);
    setServiceForm({
      categoryId: svc.categoryId?._id || svc.categoryId || "",
      serviceTitle: svc.serviceTitle || "",
      description: svc.description || "",
      price: svc.price || ""
    });
    setShowServiceForm(true);
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Delete this service?")) {
      dispatch(deleteServiceThunk(id));
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700",
      accepted: "bg-blue-50 text-blue-700",
      completed: "bg-green-50 text-green-700",
      rejected: "bg-red-50 text-red-700",
    };
    return `px-2.5 py-1 text-[10px] font-bold rounded-full ${styles[status] || "bg-slate-50 text-slate-600"}`;
  };

  const statCards = [
    { label: "My Services", value: providerServices.length, icon: Briefcase, color: "primary" },
    { label: "Pending Requests", value: pendingBookings.length, icon: Clock, color: "amber" },
    { label: "Completed Jobs", value: completedCount, icon: CheckCircle, color: "green" },
    { label: "Total Earnings", value: `₹${earnings}`, icon: DollarSign, color: "emerald" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-800">Provider Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome, {user?.fullName || "Provider"}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <card.icon size={18} className="text-primary-600 mb-2" />
            <p className="text-2xl font-extrabold text-slate-800">{card.value}</p>
            <p className="text-[11px] text-slate-500 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["bookings", "services", "reviews"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition capitalize ${activeTab === tab ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Pending */}
          {pendingBookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-5 py-3 border-b border-slate-50">
                <h3 className="font-bold text-amber-700 text-sm">⏳ Pending Requests ({pendingBookings.length})</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {pendingBookings.map((b) => (
                  <div key={b._id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{b.serviceId?.serviceTitle || "Service"}</p>
                      <p className="text-[12px] font-medium text-slate-600 mt-1">Customer: {b.customerId?.fullName || "N/A"}</p>
                      {b.customerId?.phone && <p className="text-[11px] text-slate-500">📞 {b.customerId.phone}</p>}
                      {b.addressId && (
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                          📍 {b.addressId.houseNo}, {b.addressId.area}, {b.addressId.city}, {b.addressId.pincode}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">Date: {new Date(b.bookingDate || b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 sm:self-center self-start">
                      <button onClick={() => handleAccept(b._id)} className="px-4 py-2 bg-green-600 text-white text-xs rounded-lg font-semibold hover:bg-green-700 transition">Accept</button>
                      <button onClick={() => handleReject(b._id)} className="px-4 py-2 bg-red-100 text-red-700 text-xs rounded-lg font-semibold hover:bg-red-200 transition">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted (In Progress) */}
          {acceptedBookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="px-5 py-3 border-b border-slate-50">
                <h3 className="font-bold text-blue-700 text-sm">🔧 In Progress ({acceptedBookings.length})</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {acceptedBookings.map((b) => (
                  <div key={b._id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{b.serviceId?.serviceTitle || "Service"}</p>
                      <p className="text-[12px] font-medium text-slate-600 mt-1">Customer: {b.customerId?.fullName || "N/A"}</p>
                      {b.customerId?.phone && <p className="text-[11px] text-slate-500">📞 {b.customerId.phone}</p>}
                      {b.addressId && (
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm">
                          📍 {b.addressId.houseNo}, {b.addressId.area}, {b.addressId.city}, {b.addressId.pincode}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">Date: {new Date(b.bookingDate || b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => initiateComplete(b._id)} className="px-4 py-2 bg-primary-600 text-white text-xs rounded-lg font-semibold hover:bg-primary-700 transition sm:self-center self-start">Mark Complete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="px-5 py-3 border-b border-slate-50">
              <h3 className="font-bold text-slate-700 text-sm">All Bookings ({bookings.length})</h3>
            </div>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-primary-600" size={24} /></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No bookings yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {bookings.slice(0, 10).map((b) => (
                  <div key={b._id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{b.serviceId?.serviceTitle || "Service"}</p>
                      <p className="text-[11px] text-slate-400">{b.customerId?.fullName || "Customer"} • {new Date(b.bookingDate || b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={statusBadge(b.bookingStatus)}>{b.bookingStatus}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { resetServiceForm(); setShowServiceForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition">
              <Plus size={16} /> Add Service
            </button>
          </div>

          {/* Service Form */}
          {showServiceForm && (
            <form onSubmit={handleServiceSubmit} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-4 max-w-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{editingService ? "Edit Service" : "Create Service"}</h3>
                <button type="button" onClick={resetServiceForm} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select value={serviceForm.categoryId} onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none">
                  <option value="">Select category</option>
                  {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Service Title</label>
                <input type="text" value={serviceForm.serviceTitle} onChange={(e) => setServiceForm({ ...serviceForm, serviceTitle: e.target.value })} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} rows={3} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹)</label>
                  <input type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} required min="1" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setServiceImage(e.target.files[0])} className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700" />
                </div>
              </div>
              <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition">
                {editingService ? "Update" : "Create"} Service
              </button>
            </form>
          )}

          {/* Services List */}
          {servicesLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-primary-600" size={24} /></div>
          ) : providerServices.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">You haven't added any services yet.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providerServices.map((svc) => (
                <div key={svc._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <img src={svc.serviceImage ? `http://localhost:5001${svc.serviceImage}` : "https://via.placeholder.com/300x150?text=Service"} alt={svc.serviceTitle} className="w-full h-36 object-cover" />
                  <div className="p-4">
                    <h4 className="font-bold text-slate-800 truncate">{svc.serviceTitle}</h4>
                    <p className="text-xs text-slate-500 mt-1">{svc.categoryId?.name || "Category"}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-slate-600">{svc.averageRating?.toFixed(1) || "0.0"} ({svc.totalReviews || 0})</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-extrabold text-primary-700">₹{svc.price}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditService(svc)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteService(svc._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Customer Reviews</h2>
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="animate-spin text-primary-600" size={20} />
            </div>
          ) : providerReviews.length === 0 ? (
            <p className="text-slate-400 text-center py-6">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {providerReviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {review.customerId?.profileImage ? (
                      <img src={`http://localhost:5001${review.customerId.profileImage}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs">
                        {review.customerId?.fullName?.[0] || "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{review.customerId?.fullName || "User"}</p>
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={review.rating} size={12} />
                        <span className="text-[11px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {review.reviewText && <p className="text-sm text-slate-600 mt-2 ml-11">{review.reviewText}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
            <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Complete Service</h3>
            <p className="text-sm text-slate-600 mb-6">
              Ask the customer for the 6-digit OTP sent to their email to confirm completion.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">Enter OTP</label>
              <input 
                type="text" 
                maxLength="6"
                className="w-full border rounded-lg px-3 py-3 text-center text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                value={completionOtp}
                onChange={(e) => setCompletionOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>
            <button 
              onClick={submitCompletionOtp}
              disabled={otpLoading || completionOtp.length !== 6}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex justify-center items-center"
            >
              {otpLoading ? <Loader2 className="animate-spin" size={18} /> : "Verify & Complete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
