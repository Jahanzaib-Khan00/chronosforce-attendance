
import React, { useState, useEffect } from 'react';
import { Clock, Lock, User, ShieldCheck, RefreshCw, Cloud, Link as LinkIcon, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { Employee } from '../types';

interface LoginProps {
  onLogin: (user: Employee) => void;
  employees: Employee[];
  syncId: string;
  onSetSyncId: (id: string) => Promise<boolean>;
  isSyncing: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, employees, syncId, onSetSyncId, isSyncing }) => {
  const [staffName, setStaffName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCloudInput, setShowCloudInput] = useState(!syncId);
  const [tempSyncId, setTempSyncId] = useState('');
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>(syncId ? 'SUCCESS' : 'IDLE');

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
      setError('Staff member not found or password incorrect. Try "Sync Global Database" if you just joined.');
    }
  };

  const handleConnectCloud = async () => {
    const key = tempSyncId.trim().toUpperCase();
    if (!key.startsWith('CF-')) {
      alert("Key must start with 'CF-'. Ask your manager for the Company Sync Key.");
      return;
    }

    setSyncStatus('LOADING');
    const success = await onSetSyncId(key);
    
    if (success) {
      setSyncStatus('SUCCESS');
      setShowCloudInput(false);
      setTempSyncId('');
      setError(''); // Clear errors after successful sync
    } else {
      setSyncStatus('ERROR');
      alert("Could not connect to this Company Key. Check your internet or the key code.");
    }
  };

  const handleResetData = () => {
    if (confirm("Reset everything and start over?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-40"></div>
        
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100 mb-4">
            <Clock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ChronosForce</h1>
          <p className="text-slate-500 font-medium text-sm">Workforce Intelligence Hub</p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex justify-center">
          {syncId ? (
            <div className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full animate-in fade-in">
               <Wifi size={12} className="text-emerald-500" />
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Cloud Active</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full">
               <WifiOff size={12} className="text-slate-400" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local-Only Mode</span>
            </div>
          )}
        </div>

        {showCloudInput ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-900">
                <Cloud size={18} />
                <h3 className="font-black text-sm uppercase tracking-tight">Sync Global Database</h3>
              </div>
              <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                Enter your company's unique <strong>Sync Key</strong> to download your account and attendance records from the cloud.
              </p>
              <div className="relative pt-2">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Enter CF-XXXX Key" 
                  className="w-full pl-10 pr-4 py-4 bg-white border border-indigo-200 rounded-2xl outline-none font-bold text-sm tracking-widest uppercase"
                  value={tempSyncId}
                  onChange={(e) => setTempSyncId(e.target.value)}
                />
              </div>
              <button 
                onClick={handleConnectCloud}
                disabled={syncStatus === 'LOADING'}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {syncStatus === 'LOADING' ? <RefreshCw className="animate-spin mr-2" size={14}/> : <RefreshCw className="mr-2" size={14}/>}
                {syncStatus === 'LOADING' ? 'Connecting...' : 'Link Company'}
              </button>
            </div>
            {syncId && (
              <button onClick={() => setShowCloudInput(false)} className="w-full text-center text-xs text-slate-400 font-bold hover:underline">Back to Login</button>
            )}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in zoom-in-95">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Full Staff Name"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700"
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
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700"
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
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {isSyncing ? <RefreshCw className="animate-spin w-5 h-5" /> : <span>Sign In to Terminal</span>}
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
               <button 
                type="button"
                onClick={() => setShowCloudInput(true)}
                className="text-[10px] font-black uppercase text-indigo-500 tracking-widest hover:text-indigo-700 flex items-center justify-center mx-auto"
               >
                 <RefreshCw size={12} className="mr-2" /> Sync with Another Device
               </button>
            </div>
          </form>
        )}

        <div className="pt-6 text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-slate-400 opacity-50">
            <ShieldCheck size={16} />
            <p className="text-[9px] font-black uppercase tracking-widest">Enterprise Secured Environment</p>
          </div>
          <button 
            onClick={handleResetData}
            className="text-[8px] font-black uppercase text-slate-300 hover:text-rose-500 transition-colors"
          >
            Purge Local Database
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </div>
  );
};

export default Login;
