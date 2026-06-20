import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

const schema = yup.object().shape({
  fullName: yup.string().required("Full name required"),
  email: yup.string().email("Invalid email").required("Email required"),
  phone: yup.string().required("Phone required"),
  password: yup
    .string()
    .min(6, "At least 6 characters")
    .required("Password required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password required"),
  role: yup.string().oneOf(["customer", "provider", "admin"]).default("customer"),
});

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: authLoading, error: authError } = useSelector(state => state.auth);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onFormSubmit = async (data) => {
    setFormData(data);
    await handleSendOtp(data.email);
  };

  const handleSendOtp = async (emailToUse) => {
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await api.post("/auth/send-registration-otp", { email: emailToUse });
      if (res.data.success) {
        setStep(2);
        setCountdown(60);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await api.post("/auth/verify-registration-otp", { email: formData.email, otp });
      if (res.data.success) {
        // Proceed with registration
        await handleRegister(formData);
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid or expired OTP");
      setOtpLoading(false);
    }
  };

  const handleRegister = async (data) => {
    try {
      const res = await dispatch(registerUser(data)).unwrap();
      if (res.user) {
        if (res.user.role === 'provider') {
          alert('Registration successful! Your account is pending admin approval. You will be able to log in once approved.');
          navigate('/login');
        } else if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/customer');
        }
      }
    } catch (err) {
      console.error('Registration failed', err);
      setOtpError(authError || "Registration failed. Please try again.");
      setOtpLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Create an account</h2>
      
      {step === 1 && (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              {...register("fullName")}
              placeholder="John Doe"
            />
            {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 mt-1"
              {...register("email")}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mt-1"
              {...register("phone")}
              placeholder="123-456-7890"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 mt-1"
              {...register("password")}
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 mt-1"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">I want to join as a</label>
            <select
              className="w-full border rounded px-3 py-2 bg-white mt-1"
              {...register("role")}
            >
              <option value="customer">Customer</option>
              <option value="provider">Service Provider</option>
            </select>
            {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>}
          </div>

          {otpError && <p className="text-red-600 text-sm">{otpError}</p>}
          {authError && <p className="text-red-600 text-sm">{authError}</p>}
          
          <button
            type="submit"
            disabled={otpLoading}
            className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
          >
            {otpLoading ? "Sending OTP…" : "Continue"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-slate-600 text-center mb-4">
            Enter the 6-digit OTP sent to <strong>{formData.email}</strong>
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
          
          {otpError && <p className="text-red-600 text-sm text-center">{otpError}</p>}
          {authError && <p className="text-red-600 text-sm text-center">{authError}</p>}

          <button 
            type="submit" 
            disabled={otpLoading || authLoading || otp.length !== 6} 
            className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition disabled:opacity-50"
          >
            {otpLoading || authLoading ? 'Verifying & Registering…' : 'Verify OTP & Register'}
          </button>
          
          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-sm text-slate-500">Resend OTP in {countdown}s</p>
            ) : (
              <button 
                type="button" 
                onClick={() => handleSendOtp(formData.email)} 
                className="text-sm text-primary-600 font-semibold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
          <div className="text-center mt-2">
             <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-sm text-slate-500 font-semibold hover:underline"
              >
                Back to Edit
              </button>
          </div>
        </form>
      )}
      
      {step === 1 && (
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-medium">Login</Link>
        </p>
      )}
    </div>
  );
}
