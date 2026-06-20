import React from "react";
import { useNavigate, Link } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { useEffect } from 'react';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading, error, user } = useSelector(state => state.auth);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'provider') {
        navigate('/provider');
      } else {
        navigate('/customer');
      }
    }
  }, [token, user, navigate]);

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" name="email" id="email" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" name="password" id="password" required className="w-full border rounded px-3 py-2" />
          <div className="text-right text-sm mt-1">
            <Link to="/forgot-password" className="text-primary-600 hover:underline">Forgot Password?</Link>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition flex items-center justify-center">
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
