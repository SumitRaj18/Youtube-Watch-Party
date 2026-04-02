import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../shared/Navbar';
import toast from 'react-hot-toast';

const Lobby = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const createRoom = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please login to create a room');
      navigate('/login');
      return;
    }

    const newRoomId = Math.random().toString(36).substring(7);
    
    try {
      await axios.post(
        'https://watch-party-backend-hvyo.onrender.com/api/rooms/create',
        { roomId: newRoomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Room created successfully');
      navigate(`/room/${newRoomId}`);
    } 
    catch (err)   {
  if (err.response?.status === 401) {
    toast.error('Session expired. Please login again');
    localStorage.removeItem('token');
    navigate('/login');
  } else {
    toast.error(err.response?.data?.error || err.response?.data?.message || err.message || 'Error creating room');
    console.log('Create room error:', err.response);
  } }
  };


  const joinRoom = () => {
    if (roomId.trim()) navigate(`/room/${roomId.trim()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') joinRoom();
  };

  return (
<div className="flex flex-col min-h-screen min-h-dvh bg-[#F8FAFC] overflow-x-hidden">
      <Navbar />

<main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden w-full ...">

        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-64 h-64 sm:w-[28rem] sm:h-[28rem] bg-blue-100/50 blur-[80px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-64 h-64 sm:w-[28rem] sm:h-[28rem] bg-red-50/60 blur-[80px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3"
        />

        <div className="relative z-10 flex flex-col items-center w-full max-w-sm sm:max-w-md">

          <div className="flex items-center gap-3 mb-7 sm:mb-8">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-red-600 rounded-xl shadow-md shadow-red-200 transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 whitespace-nowrap">
              YouTube <span className="text-blue-600">Watch Party</span>
            </h1>
          </div>

          <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="space-y-4 sm:space-y-5">

              <button
                onClick={createRoom}
                className="w-full bg-slate-900 hover:bg-black active:scale-95 text-white py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md shadow-slate-200 cursor-pointer"
              >
                Create New Room
              </button>

              <div className="relative flex items-center">
                <div className="grow border-t border-slate-100" />
                <span className="shrink mx-4 text-slate-400 text-[10px] font-bold tracking-widest uppercase">
                  or
                </span>
                <div className="grow border-t border-slate-100" />
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <button
                  onClick={joinRoom}
                  disabled={!roomId.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md shadow-blue-100 cursor-pointer"
                >
                  Join Room
                </button>
              </div>

            </div>
          </div>

          <p className="mt-5 text-slate-400 text-xs font-medium text-center">
            Watch videos together, perfectly in sync.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Lobby;