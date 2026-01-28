
import React, { useState } from 'react';
import { Clock, Lock, User, ShieldCheck, RefreshCw } from 'lucide-react';
import { Employee } from '../types';

interface LoginProps {
  onLogin: (user: Employee) => void;
  employees: Employee[];
}

const Login: React.FC<LoginProps> = ({ onLogin, employees }) => {
  const [staffName, setStaffName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Case-insensitive full name matching
    const cleanName = staffName.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Match strictly against emp.name
    const user = employees.find(emp => 
      emp.name.toLowerCase() === cleanName && 
      emp.password === cleanPassword
    );
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Please enter your full Staff Name exactly as registered.');
    }
  };

  const handleResetData = () => {
    if (confirm("This will clear your local storage and reset all system data. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
        
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100 mb-4 animate-bounce-slow">
            <Clock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ChronosForce</h1>
          <p className="text-slate-500 font-medium">Workforce Intelligence Hub</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Full Staff Name"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 font-bold text-slate-700"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 font-bold text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600 text-xs font-bold text-center border border-rose-100 animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <span>Log In</span>
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-indigo-600">
            <ShieldCheck size={16} />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Secured Enterprise Access
            </p>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">
            Login is case-insensitive. Full Name required.
          </p>
          <button 
            onClick={handleResetData}
            className="flex items-center justify-center mx-auto text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-500 transition-colors mt-2"
          >
            <RefreshCw size={10} className="mr-1" /> Reset All Data
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Login;
