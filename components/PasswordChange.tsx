
import React, { useState } from 'react';
import { Employee } from '../types';
import { ShieldCheck, Save, LogOut, Key } from 'lucide-react';

interface PasswordChangeProps {
  user: Employee;
  onUpdatePassword: (newPassword: string) => void;
  onLogout: () => void;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({ user, onUpdatePassword, onLogout }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword === 'password123') {
      setError('You cannot use the default temporary password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    onUpdatePassword(newPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white max-w-md w-full rounded-[2.5rem] shadow-2xl p-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-100">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Security Update Required</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Hello {user.name}, please update your temporary password to continue.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">New Secure Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Confirm Secure Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {error && <div className="p-4 bg-rose-50 text-rose-500 text-xs font-bold rounded-xl text-center">{error}</div>}

          <div className="flex flex-col space-y-3">
            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" /> Activate Security Update
            </button>
            <button type="button" onClick={onLogout} className="w-full py-4 text-slate-400 font-bold flex items-center justify-center hover:text-rose-500 transition-colors">
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChange;
