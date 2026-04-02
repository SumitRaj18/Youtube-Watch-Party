import React from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { socket } from '../src/socket';
import { LogOut, Tv, User, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
    toast.success('Successfully logged out');
  };

  return (
    
<nav className="w-full bg-slate-100 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">

  <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
    <div className="bg-red-600 p-1.5 sm:p-2 rounded-xl group-hover:bg-red-500 transition-all shadow-lg shadow-red-100 group-hover:scale-105">
      <Tv size={18} className="text-white" />
    </div>
    <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 ">
      Watch<span className="text-blue-600">Party</span>
    </span>
  </Link>

  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
    {token ? (
      <div className="flex items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl border border-slate-200 shadow-sm min-w-0 max-w-[120px] sm:max-w-none">
          <div className="bg-slate-100 p-1 rounded-full shadow-inner shrink-0">
            <User size={12} className="text-slate-500" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-700 truncate">{username}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors font-bold text-sm group shrink-0"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <NavLink
          to="/login"
          className={({ isActive }) => `
            flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all
            ${isActive
              ? 'bg-white text-blue-600 border border-slate-200 shadow-sm'
              : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent'}
          `}
        >
          <LogIn size={14} />
          Login
        </NavLink>

        <NavLink
          to="/register"
          className={({ isActive }) => `
            flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md
            ${isActive
              ? 'bg-blue-600 text-white shadow-blue-100'
              : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}
          `}
        >
          <UserPlus size={14} />
          <span className="hidden xs:inline">Join Free</span>
          <span className="xs:hidden">Join</span>
        </NavLink>
      </div>
    )}
  </div>
</nav>
  );
};

export default Navbar;