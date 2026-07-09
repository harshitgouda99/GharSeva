import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchServices, fetchCategories } from "../store/slices/servicesSlice";
import { createBookingThunk } from "../store/slices/bookingsSlice";
import { toggleFavoriteThunk, fetchFavorites } from "../store/slices/favoritesSlice";
import { fetchAddresses } from "../store/slices/addressesSlice";
import { Heart, Search, SlidersHorizontal, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function ServicesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { services, categories, loading, error, pagination } = useSelector((state) => state.services);
  const { user } = useSelector((state) => state.auth);
  const { favorites } = useSelector((state) => state.favorites);
  const { addresses } = useSelector((state) => state.addresses);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingAddressId, setBookingAddressId] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const page = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFavorites());
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    params.page = page;
    params.limit = 12;
    dispatch(fetchServices(params));
  }, [dispatch, keyword, category, minPrice, maxPrice, sort, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleBook = (serviceId) => {
    setBookingServiceId(serviceId);
    setBookingDate("");
    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
    setBookingAddressId(defaultAddress ? defaultAddress._id : "");
  };

  const confirmBooking = async () => {
    if (!bookingDate || !bookingAddressId || bookingLoading) return;
    setBookingLoading(true);
    try {
      await dispatch(createBookingThunk({ serviceId: bookingServiceId, bookingDate, addressId: bookingAddressId })).unwrap();
      setBookingServiceId(null);
      setBookingLoading(false);
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking failed", err);
      setBookingLoading(false);
    }
  };

  const isFavorited = (serviceId) => {
    return favorites.some((f) => (f.serviceId?._id || f.serviceId) === serviceId);
  };

  const handleToggleFavorite = (serviceId) => {
    dispatch(toggleFavoriteThunk(serviceId)).then(() => dispatch(fetchFavorites()));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-primary-800">Explore Services</h1>
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search services, providers..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-semibold">
            Search
          </button>
          <button type="button" onClick={() => setShowFilters(!showFilters)} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
            <SlidersHorizontal size={18} className="text-slate-500" />
          </button>
        </form>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none">
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Min Price</label>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="₹0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Price</label>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="₹10000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sort By</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none">
              <option value="">Newest First</option>
              <option value="priceLow">Price: Low → High</option>
              <option value="priceHigh">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary-600" size={32} />
          <span className="ml-3 text-slate-500 font-medium">Loading services...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium">{error}</div>
      )}

      {/* Services Grid */}
      {!loading && !error && (
        <>
          {services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No services found matching your criteria.</p>
              <button onClick={() => { setKeyword(""); setCategory(""); setMinPrice(""); setMaxPrice(""); setSort(""); setSearchParams({}); }} className="mt-4 text-primary-600 hover:underline font-semibold text-sm">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((svc) => (
                <div key={svc._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
                  <div className="relative">
                    <img
                      src={svc.serviceImage ? `http://localhost:5001${svc.serviceImage}` : "https://via.placeholder.com/300x200?text=Service"}
                      alt={svc.serviceTitle}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {user && (
                      <button onClick={() => handleToggleFavorite(svc._id)} className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition shadow-sm">
                        <Heart size={16} className={isFavorited(svc._id) ? "fill-red-500 text-red-500" : "text-slate-400"} />
                      </button>
                    )}
                    {svc.categoryId && (
                      <span className="absolute bottom-3 left-3 bg-primary-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {svc.categoryId.name}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 truncate">{svc.serviceTitle}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                    {svc.providerId && (
                      <p className="text-[11px] text-slate-400 mt-1.5">by {svc.providerId.fullName}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{svc.averageRating?.toFixed(1) || "0.0"}</span>
                      <span className="text-[10px] text-slate-400">({svc.totalReviews || 0})</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-extrabold text-primary-700">₹{svc.price}</span>
                      <div className="flex gap-2">
                        <Link to={`/service/${svc._id}`} className="text-xs text-primary-600 hover:underline font-semibold py-1.5 px-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition">
                          Details
                        </Link>
                        {user?.role === "customer" && (
                          <button onClick={() => handleBook(svc._id)} className="text-xs text-white bg-primary-600 hover:bg-primary-700 font-semibold py-1.5 px-3 rounded-lg transition">
                            Book
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => handlePageChange(p)} className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${p === page ? "bg-primary-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= pagination.pages} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Booking Modal */}
      {bookingServiceId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setBookingServiceId(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Book Service</h3>
            
            {addresses.length === 0 ? (
              <div className="space-y-4 my-2">
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl font-medium">
                  You must add an address in Address Management before booking a service.
                </p>
                <div className="flex gap-3 mt-4">
                  <Link
                    to="/addresses"
                    className="flex-1 bg-primary-600 text-white text-center py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition"
                  >
                    Add Address
                  </Link>
                  <button onClick={() => setBookingServiceId(null)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Select Date & Time</label>
                    <input
                      type="datetime-local"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Select Address</label>
                    <select
                      value={bookingAddressId}
                      onChange={(e) => setBookingAddressId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      {addresses.map((addr) => (
                        <option key={addr._id} value={addr._id}>
                          {addr.houseNo}, {addr.area}, {addr.city} ({addr.isDefault ? "Default" : "Other"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={confirmBooking} disabled={!bookingDate || !bookingAddressId || bookingLoading} className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {bookingLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Confirming...</>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                  <button onClick={() => setBookingServiceId(null)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-200 transition">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
