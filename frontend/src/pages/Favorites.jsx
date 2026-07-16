import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchFavorites, toggleFavoriteThunk } from "../store/slices/favoritesSlice";
import { Heart, Star, Loader2 } from "lucide-react";
import { IMAGE_BASE_URL } from "../utils/api";

export default function Favorites() {
  const dispatch = useDispatch();
  const { favorites, loading, error } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleRemove = async (serviceId) => {
    await dispatch(toggleFavoriteThunk(serviceId));
    dispatch(fetchFavorites());
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-primary-800">Your Favorites</h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary-600" size={28} />
          <span className="ml-3 text-slate-500">Loading favorites...</span>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500">No favorite services yet.</p>
          <Link to="/services" className="text-primary-600 hover:underline text-sm font-semibold mt-2 inline-block">
            Browse services
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            const svc = fav.serviceId || fav;
            return (
              <div key={fav._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition group">
                <div className="relative">
                  <img
                    src={svc.serviceImage ? `${IMAGE_BASE_URL}${svc.serviceImage}` : "https://via.placeholder.com/300x200?text=Service"}
                    alt={svc.serviceTitle}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemove(svc._id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition shadow-sm"
                    title="Remove from favorites"
                  >
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 truncate">{svc.serviceTitle}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{svc.averageRating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-extrabold text-primary-700">₹{svc.price}</span>
                    <Link to={`/service/${svc._id}`} className="text-xs text-primary-600 hover:underline font-semibold py-1.5 px-3 border border-primary-200 rounded-lg hover:bg-primary-50 transition">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
