import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { changePasswordUser, clearAuthError } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

export default function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMsg } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await dispatch(changePasswordUser({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })).unwrap();
      reset();
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error('Password change failed', err);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <button onClick={() => navigate('/profile')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-4 transition">
        <ArrowLeft size={16} /> Back to Profile
      </button>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-primary-50 rounded-xl">
            <Lock size={20} className="text-primary-600" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800">Change Password</h1>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-4">{error}</div>}
        {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm mb-4">{successMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
            <input
              type="password"
              {...register('currentPassword', { required: 'Current password is required' })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none"
            />
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
            <input
              type="password"
              {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none"
            />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === watch('newPassword') || 'Passwords do not match'
              })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 mt-2">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
