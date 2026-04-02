import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';

const Login = ({ setAuthToken }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (form.username.length < 5 || form.password.length < 5) {
      return toast.error("Minimum 5 characters required");
    }

    try {
      const { data } = await axios.post('https://watch-party-backend-hvyo.onrender.com/api/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      setAuthToken(data.token);
      toast.success(`Welcome back, ${data.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <AuthLayout title="Sign In">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">Username</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
          <input 
            type="password" 
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold active:scale-95 transition-all">
          Login
        </button>
        <p className="text-xs text-center text-slate-500">
          Don't have an account? <Link to="/register" className="text-blue-600 font-bold">Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;