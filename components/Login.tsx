
import React, { useState, useEffect } from 'react';
import { Clock, Lock, User, ShieldCheck, RefreshCw, Cloud, Link as LinkIcon, CheckCircle2, Globe, ArrowRight, Zap, PlusCircle, Database, ExternalLink } from 'lucide-react';
import { Employee } from '../types';

interface LoginProps {
  onLogin: (user: Employee) => void;
  employees: Employee[];
  backendUrl: string;
  onSetBackendUrl: (url: string) => Promise<any>;
  isSyncing: boolean;
  dbReady: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, employees, backendUrl, onSetBackendUrl, isSyncing, dbReady }) => {
  const [phase, setPhase] = useState<'CHOICE' | 'SETUP' | 'STAFF'>(backendUrl ? 'STAFF' : 'CHOICE');
  const [tempUrl, setTempUrl] = useState(backendUrl);
  const [staffName, setStaffName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (dbReady) setPhase('STAFF');
  }, [dbReady]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUrl.includes('script.google.com')) {
      setError("Please enter a valid Google Apps Script Web App URL.");
      return;
    }
    setError('');
    const success = await onSetBackendUrl(tempUrl);
    if (!success) {
      setError("Could not reach backend. Ensure your script is deployed for 'Anyone'.");
    }
  };

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
      setError('Staff member not found or password incorrect.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,#1e1b4b_0%,#0f172a_100%)]"></div>
      
      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-white/10 p-10 space-y-8 relative z-10 animate-in zoom-in-95 duration-500">
        
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center shadow-2xl shadow-indigo-500/30 mb-4">
            <Clock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">ChronosForce</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Persistent Cloud Terminal</p>
        </div>

        {phase === 'CHOICE' ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-6">
            <button 
              onClick={() => setPhase('SETUP')}
              className="w-full p-6 bg-slate-900 text-white rounded-3xl hover:bg-black transition-all flex items-center justify-between group shadow-xl"
            >
              <div className="text-left">
                <p className="font-black text-[9px] uppercase tracking-widest text-indigo-400 mb-1">Configuration Required</p>
                <p className="text-lg font-bold">Connect My Google Sheet</p>
              </div>
              <Database className="group-hover:scale-110 transition-transform text-indigo-400" size={28} />
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium px-6">
              You must link your organization's Google Apps Script to enable cloud persistence across all devices.
            </p>
          </div>
        ) : phase === 'SETUP' ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                <h4 className="font-black text-xs text-indigo-900 uppercase tracking-widest flex items-center">
                   <Zap size={14} className="mr-2" /> Quick Setup Steps
                </h4>
                <ol className="text-[10px] text-indigo-800 space-y-1.5 font-medium list-decimal pl-4">
                   <li>Create a new Apps Script at script.google.com</li>
                   <li>Paste the Chronos Backend code and Deploy.</li>
                   <li>Set access to <strong>"Anyone"</strong> and copy the URL.</li>
                </ol>
             </div>
             <form onSubmit={handleConnect} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Apps Script Deployment URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="https://script.google.com/macros/s/.../exec" 
                      className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-medium text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                    />
                  </div>
               </div>
               <button 
                type="submit"
                disabled={isSyncing}
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center disabled:opacity-50"
               >
                 {isSyncing ? <RefreshCw className="animate-spin mr-2" /> : 'Establish Neural Link'}
               </button>
               <button onClick={() => setPhase('CHOICE')} className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
             </form>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
               <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                  <Globe size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Connected to Sheets Cloud</span>
               </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Full Staff Name"
                  className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800"
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
                  placeholder="Secret Key"
                  className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {isSyncing ? <RefreshCw className="animate-spin w-5 h-5" /> : <span>Authorize Terminal Access</span>}
            </button>

            <div className="pt-4 text-center">
               <button 
                type="button"
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="text-[9px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors"
               >
                 Change Cloud Backend
               </button>
            </div>
          </form>
        )}

        {error && (
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 text-[10px] font-black text-center border border-rose-100 uppercase tracking-widest animate-shake">
            {error}
          </div>
        )}

        <div className="pt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-slate-300 opacity-60">
            <ShieldCheck size={16} />
            <p className="text-[9px] font-black uppercase tracking-widest">Private Infrastructure Security</p>
          </div>
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
