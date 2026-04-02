import React from 'react';
import Navbar from '../../shared/Navbar';

const AuthLayout = ({ children, title }) => (
  <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
    <Navbar />
    <main className="grow flex flex-col items-center justify-start p-6 pt-12">
      <div className="w-full max-w-[360px]">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">{title}</h2>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  </div>
);

export default AuthLayout;