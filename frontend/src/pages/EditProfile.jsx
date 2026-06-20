import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileUser, clearAuthError } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, successMsg } = useSelector((state) => state.auth);
  const [imagePreview, setImagePreview] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      phone: ''
    }
  });

  // Watch profileImage file selection to generate dynamic preview
  const fileVal = watch('profileImage');

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
      if (user.profileImage) {
        setImagePreview(user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5001${user.profileImage}`);
      }
    }
  }, [user, reset]);

  useEffect(() => {
    if (fileVal && fileVal[0]) {
      const file = fileVal[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [fileVal]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('phone', data.phone || '');
    if (data.profileImage && data.profileImage[0]) {
      formData.append('profileImage', data.profileImage[0]);
    }

    try {
      await dispatch(updateProfileUser(formData)).unwrap();
      navigate('/profile');
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h1 className="text-3xl font-extrabold text-primary-800 mb-6">Edit Profile</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center space-y-3 mb-6">
          <img
            src={imagePreview || "https://via.placeholder.com/150"}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover shadow-md border-2 border-primary-500"
          />
          <label className="cursor-pointer bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold py-2 px-4 rounded-full transition border border-primary-200">
            Upload New Photo
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              {...register('profileImage')}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            {...register('fullName', { required: 'Full name is required' })}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
          {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="text"
            placeholder="123-456-7890"
            {...register('phone')}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition disabled:opacity-50 shadow-md shadow-primary-500/20"
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="py-3 px-6 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
