import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerBookings, fetchProviderBookings, cancelBookingThunk, acceptBookingThunk, rejectBookingThunk, completeBookingThunk } from "../store/slices/bookingsSlice";
import { addReviewThunk } from "../store/slices/reviewsSlice";
import StarRating from "../components/StarRating";
import { Loader2, X, MessageSquare } from "lucide-react";

export default function MyBookings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading, error } = useSelector((state) => state.bookings);

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [filter, setFilter] = useState("all");

  const isProvider = user?.role === "provider";

  useEffect(() => {
    if (isProvider) {
      dispatch(fetchProviderBookings());
    } else {
      dispatch(fetchCustomerBookings());
    }
  }, [dispatch, isProvider]);

  const handleCancel = (id) => {
    if (window.confirm("Cancel this booking?")) {
      dispatch(cancelBookingThunk(id));
    }
  };

  const handleAccept = (id) => dispatch(acceptBookingThunk(id));
  const handleReject = (id) => dispatch(rejectBookingThunk(id));
  const handleComplete = (id) => dispatch(completeBookingThunk(id));

  const openReview = (booking) => {
    setReviewModal(booking);
    setReviewRating(0);
    setReviewText("");
    setReviewError("");
  };

  const submitReview = async () => {
    if (reviewRating === 0) { setReviewError("Please select a rating"); return; }
    try {
      await dispatch(addReviewThunk({ bookingId: reviewModal._id, rating: reviewRating, reviewText })).unwrap();
      setReviewModal(null);
    } catch (err) {
      setReviewError(err || "Failed to submit review");
    }
  };

  const filteredBookings = filter === "all" ? bookings : bookings.filter((b) => b.bookingStatus === filter);

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
      <h1 className="text-3xl font-extrabold text-primary-800">My Bookings</h1>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["all", "pending", "accepted", "completed", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition capitalize ${filter === f ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {f} {f !== "all" && `(${bookings.filter((b) => b.bookingStatus === f).length})`}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary-600" size={28} />
          <span className="ml-3 text-slate-500">Loading bookings...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <CalendarEmpty />
          <p className="mt-2">No {filter === "all" ? "" : filter} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                {b.serviceId?.serviceImage ? (
                  <img src={`http://localhost:5001${b.serviceId.serviceImage}`} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">SVC</div>
                )}
                <div>
                  <p className="font-bold text-slate-800">{b.serviceId?.serviceTitle || "Service"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isProvider ? `Customer: ${b.customerId?.fullName || "N/A"}` : `Provider: ${b.providerId?.fullName || "N/A"}`}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(b.bookingDate || b.createdAt).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    {b.serviceId?.price && ` • ₹${b.serviceId.price}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={statusBadge(b.bookingStatus)}>{b.bookingStatus}</span>

                {/* Customer Actions */}
                {!isProvider && b.bookingStatus === "pending" && (
                  <button onClick={() => handleCancel(b._id)} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg font-semibold hover:bg-red-200 transition">Cancel</button>
                )}
                {!isProvider && b.bookingStatus === "accepted" && (
                  <button onClick={() => handleCancel(b._id)} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg font-semibold hover:bg-red-200 transition">Cancel</button>
                )}
                {!isProvider && b.bookingStatus === "completed" && (
                  <button onClick={() => openReview(b)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 text-xs rounded-lg font-semibold hover:bg-primary-200 transition">
                    <MessageSquare size={12} /> Review
                  </button>
                )}

                {/* Provider Actions */}
                {isProvider && b.bookingStatus === "pending" && (
                  <>
                    <button onClick={() => handleAccept(b._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-semibold hover:bg-green-700 transition">Accept</button>
                    <button onClick={() => handleReject(b._id)} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg font-semibold hover:bg-red-200 transition">Reject</button>
                  </>
                )}
                {isProvider && b.bookingStatus === "accepted" && (
                  <button onClick={() => handleComplete(b._id)} className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg font-semibold hover:bg-primary-700 transition">Complete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setReviewModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Write a Review</h3>
              <button onClick={() => setReviewModal(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-600 mb-3">Rate your experience with "{reviewModal.serviceId?.serviceTitle}"</p>
            <div className="flex justify-center mb-4">
              <StarRating rating={reviewRating} onRatingChange={setReviewRating} size={28} />
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none resize-none"
            />
            {reviewError && <p className="text-red-500 text-xs mt-2">{reviewError}</p>}
            <button onClick={submitReview} className="w-full mt-4 bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition">
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarEmpty() {
  return (
    <svg className="w-16 h-16 mx-auto text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
