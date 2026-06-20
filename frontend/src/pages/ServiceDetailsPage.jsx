import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchServiceById, clearServiceDetails } from "../store/slices/servicesSlice";
import { fetchServiceReviews } from "../store/slices/reviewsSlice";
import { createBookingThunk } from "../store/slices/bookingsSlice";
import { toggleFavoriteThunk, fetchFavorites } from "../store/slices/favoritesSlice";
import { fetchAddresses } from "../store/slices/addressesSlice";
import StarRating from "../components/StarRating";
import { ArrowLeft, Heart, Star, User, Calendar, MapPin, Loader2 } from "lucide-react";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentService: service, loading: serviceLoading, error: serviceError } = useSelector((state) => state.services);
  const { reviews, loading: reviewsLoading } = useSelector((state) => state.reviews);
  const { user } = useSelector((state) => state.auth);
  const { favorites } = useSelector((state) => state.favorites);
  const { addresses } = useSelector((state) => state.addresses);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingAddressId, setBookingAddressId] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    dispatch(fetchServiceById(id));
    dispatch(fetchServiceReviews(id));
    dispatch(fetchFavorites());
    dispatch(fetchAddresses());
    return () => { dispatch(clearServiceDetails()); };
  }, [dispatch, id]);

  useEffect(() => {
    if (showBooking && addresses.length > 0 && !bookingAddressId) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      setBookingAddressId(defaultAddress ? defaultAddress._id : "");
    }
  }, [showBooking, addresses, bookingAddressId]);

  const isFavorited = favorites.some((f) => (f.serviceId?._id || f.serviceId) === id);

  const handleToggleFavorite = () => {
    dispatch(toggleFavoriteThunk(id)).then(() => dispatch(fetchFavorites()));
  };

  const handleBook = async () => {
    if (!bookingDate) { setBookingMsg("Please select a date"); return; }
    if (!bookingAddressId) { setBookingMsg("Please select or add an address first"); return; }
    try {
      await dispatch(createBookingThunk({ serviceId: id, bookingDate, addressId: bookingAddressId })).unwrap();
      setBookingMsg("Booking created successfully!");
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (err) {
      setBookingMsg(err || "Booking failed");
    }
  };

  if (serviceLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={32} />
        <span className="ml-3 text-slate-500">Loading service details...</span>
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-3">{serviceError || "Service not found"}</p>
        <Link to="/services" className="text-primary-600 hover:underline font-semibold text-sm">← Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/services" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition">
        <ArrowLeft size={16} /> Back to Services
      </Link>

      {/* Service Detail Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <img
            src={service.serviceImage ? `http://localhost:5001${service.serviceImage}` : "https://via.placeholder.com/500x400?text=Service"}
            alt={service.serviceTitle}
            className="w-full h-64 md:h-full object-cover"
          />
          <div className="p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                {service.categoryId && (
                  <span className="text-[10px] font-bold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">{service.categoryId.name}</span>
                )}
                <h1 className="text-2xl font-extrabold text-slate-800 mt-2">{service.serviceTitle}</h1>
              </div>
              {user && (
                <button onClick={handleToggleFavorite} className="p-2 hover:bg-slate-50 rounded-full transition">
                  <Heart size={20} className={isFavorited ? "fill-red-500 text-red-500" : "text-slate-300"} />
                </button>
              )}
            </div>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{service.description}</p>

            {/* Provider Info */}
            {service.providerId && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-slate-50 rounded-xl">
                {service.providerId.profileImage ? (
                  <img src={`http://localhost:5001${service.providerId.profileImage}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                    <User size={18} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{service.providerId.fullName}</p>
                  <p className="text-[11px] text-slate-400">{service.providerId.email}</p>
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mt-4">
              <StarRating rating={Math.round(service.averageRating || 0)} size={18} />
              <span className="text-sm font-bold text-slate-700">{service.averageRating?.toFixed(1) || "0.0"}</span>
              <span className="text-xs text-slate-400">({service.totalReviews || 0} reviews)</span>
            </div>

            {/* Price & Book */}
            <div className="mt-auto pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-primary-700">₹{service.price}</span>
                {user?.role === "customer" && (
                  <button onClick={() => setShowBooking(!showBooking)} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition">
                    {showBooking ? "Close" : "Book Now"}
                  </button>
                )}
              </div>

              {showBooking && (
                <div className="mt-4 p-4 bg-primary-50 rounded-xl space-y-4">
                  {addresses.length === 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-amber-600 bg-amber-50/50 p-3 rounded-lg font-medium">
                        You must add an address in Address Management before booking a service.
                      </p>
                      <Link
                        to="/addresses"
                        className="block text-center bg-primary-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
                      >
                        Manage Addresses
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar size={15} className="text-primary-600" />
                            <label className="text-xs font-semibold text-slate-700">Select Date & Time</label>
                          </div>
                          <input
                            type="datetime-local"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-primary-600" />
                            <label className="text-xs font-semibold text-slate-700">Select Address</label>
                          </div>
                          <select
                            value={bookingAddressId}
                            onChange={(e) => setBookingAddressId(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                          >
                            {addresses.map((addr) => (
                              <option key={addr._id} value={addr._id}>
                                {addr.houseNo}, {addr.area}, {addr.city} ({addr.isDefault ? "Default" : "Other"})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {bookingMsg && <p className={`text-xs font-medium ${bookingMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>{bookingMsg}</p>}
                      <button onClick={handleBook} disabled={!bookingDate || !bookingAddressId} className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50">
                        Confirm Booking
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Reviews ({reviews.length})</h2>
        {reviewsLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="animate-spin text-primary-600" size={20} />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No reviews yet. Be the first to review after booking!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
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
                {review.reviewText && (
                  <p className="text-sm text-slate-600 mt-2 ml-11">{review.reviewText}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
