import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.username.length < 5 || form.password.length < 5) {
      return toast.error("Minimum 5 characters required");
    }

    try {
      await axios.post('https://watch-party-backend-hvyo.onrender.com/api/auth/register', form);
      toast.success("Account created! Please login.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Create Account">
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">Choose Username</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">Create Password</label>
          <input 
            type="password" 
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold active:scale-95 transition-all">
          Sign Up
        </button>
        <p className="text-xs text-center text-slate-500">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;