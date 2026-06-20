import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/send-forgot-password-otp", { email });
      if (res.data.success) {
        setMessage("OTP sent to your email.");
        setStep(2);
        setCountdown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/verify-forgot-password-otp", { email, otp });
      if (res.data.success) {
        setMessage("OTP verified. You can now reset your password.");
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/reset-password", { email, password });
      if (res.data.success) {
        alert("Password reset successfully. You can now log in.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input 
              type="email" 
              required 
              className="w-full border rounded px-3 py-2 mt-1" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition">
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-slate-600 text-center mb-4">
            Enter the 6-digit OTP sent to <strong>{email}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-center">OTP</label>
            <input 
              type="text" 
              required 
              maxLength="6"
              className="w-full border rounded px-3 py-3 mt-1 text-center text-2xl tracking-[0.5em] font-bold" 
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition disabled:opacity-50">
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
          
          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-sm text-slate-500">Resend OTP in {countdown}s</p>
            ) : (
              <button 
                type="button" 
                onClick={handleSendOtp} 
                className="text-sm text-primary-600 font-semibold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input 
              type="password" 
              required 
              className="w-full border rounded px-3 py-2 mt-1" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm New Password</label>
            <input 
              type="password" 
              required 
              className="w-full border rounded px-3 py-2 mt-1" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition">
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
