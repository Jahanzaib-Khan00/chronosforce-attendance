
import React, { useState } from 'react';
import { Clock, Lock, User, ShieldCheck, RefreshCw, Cloud, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Employee } from '../types';

interface LoginProps {
  onLogin: (user: Employee) => void;
  employees: Employee[];
  syncId: string;
  onSetSyncId: (id: string) => void;
  isSyncing: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, employees, syncId, onSetSyncId, isSyncing }) => {
  const [staffName, setStaffName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCloudInput, setShowCloudInput] = useState(false);
  const [tempSyncId, setTempSyncId] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = staffName.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = employees.find(emp => 
      emp.name.toLowerCase() === cleanName && 
      emp.password === cleanPassword
    );
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. If you are a new user, please "Connect Cloud" below first.');
    }
  };

  const handleConnectCloud = () => {
    if (tempSyncId.trim().startsWith('CF-')) {
      onSetSyncId(tempSyncId.trim().toUpperCase());
      setShowCloudInput(false);
      setTempSyncId('');
    } else {
      alert("Please enter a valid Company Sync Key starting with 'CF-'");
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

        {syncId ? (
          <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full mx-auto w-fit animate-in fade-in">
             <CheckCircle2 size={12} className="text-emerald-500" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Linked to Company Cloud</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full mx-auto w-fit">
             <Cloud size={12} className="text-amber-500" />
             <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Local Mode - Connect Cloud to Login</span>
          </div>
        )}

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
            disabled={isSyncing}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSyncing ? <RefreshCw className="animate-spin w-5 h-5" /> : <span>Log In</span>}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 text-center space-y-4">
          {!showCloudInput ? (
            <button 
              onClick={() => setShowCloudInput(true)}
              className="flex items-center justify-center mx-auto space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <Cloud size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest">Connect to Company Cloud</span>
            </button>
          ) : (
            <div className="space-y-3 animate-in slide-in-from-bottom-2">
               <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Enter Sync Key (CF-XXXX)" 
                    className="w-full pl-10 pr-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl outline-none text-sm font-bold uppercase tracking-widest"
                    value={tempSyncId}
                    onChange={(e) => setTempSyncId(e.target.value)}
                  />
               </div>
               <div className="flex space-x-2">
                  <button onClick={handleConnectCloud} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">Link Company</button>
                  <button onClick={() => setShowCloudInput(false)} className="px-4 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest">Cancel</button>
               </div>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 text-slate-400 opacity-50">
            <ShieldCheck size={16} />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Secured Enterprise Access
            </p>
          </div>
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
