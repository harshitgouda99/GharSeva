import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../store/slices/authSlice";
import { IMAGE_BASE_URL } from "../utils/api";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  const handleEdit = () => navigate("/edit-profile");
  const handleChangePassword = () => navigate("/change-password");

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-slate-600">User not logged in.</p>
      </div>
    );
  }

  const getAvatarUrl = (img) => {
    if (!img) return "https://via.placeholder.com/150";
    if (img.startsWith("http")) return img;
    // Base server path
    return `${IMAGE_BASE_URL}${img}`;
  };

  return (
    <div className="p-6 flex flex-col items-center space-y-6">
      <img
        src={getAvatarUrl(user.profileImage)}
        alt={user.fullName || "User Avatar"}
        className="w-32 h-32 rounded-full shadow-lg object-cover"
      />
      <h1 className="text-4xl font-extrabold text-primary-800">{user.fullName || "User name"}</h1>
      <p className="text-lg text-slate-600">{user.email}</p>
      <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">{user.role}</span>
      <div className="flex gap-4">
        <button onClick={handleEdit} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition">Edit Profile</button>
        <button onClick={handleChangePassword} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">Change Password</button>
      </div>
    </div>
  );
}
