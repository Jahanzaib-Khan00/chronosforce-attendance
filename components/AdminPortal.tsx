
import React, { useState } from 'react';
import { Employee, UserRole, EmployeeStatus, Project } from '../types';
import { UserPlus, Settings, Save, X, Briefcase, Key, Eye, AlertCircle, ShieldCheck, Cloud, RefreshCw, Copy, Check } from 'lucide-react';

interface AdminPortalProps {
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  employees: Employee[];
  projects: Project[];
  syncId: string;
  setSyncId: (id: string) => void;
  onSyncNow: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onAddEmployee, onUpdateEmployee, employees, projects, syncId, setSyncId, onSyncNow }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [copied, setCopied] = useState(false);
  const [tempSyncId, setTempSyncId] = useState(syncId);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    code: '',
    role: UserRole.EMPLOYEE,
    shiftStart: '09:00',
    shiftEnd: '17:00',
    allowedProjects: [] as string[]
  });

  const generateSyncId = () => {
    const newId = 'CF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setTempSyncId(newId);
  };

  const saveSync = () => {
    setSyncId(tempSyncId);
    alert("Global Sync Key Updated. System will now attempt to connect.");
  };

  const copyKey = () => {
    navigator.clipboard.writeText(syncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        code: formData.code,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role,
        shift: { start: formData.shiftStart, end: formData.shiftEnd },
        allowedProjectIds: formData.allowedProjects,
      };
      onUpdateEmployee(updated);
    } else {
      const newEmp: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        code: formData.code,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role,
        shift: { start: formData.shiftStart, end: formData.shiftEnd },
        allowedProjectIds: formData.allowedProjects,
        activeProjectId: formData.allowedProjects[0] || 'p1',
        supervisorId: null,
        status: EmployeeStatus.OFF,
        lastActionTime: new Date().toISOString(),
        totalMinutesWorkedToday: 0,
        otEnabled: false
      };
      onAddEmployee(newEmp);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Admin Tools</h2>
              <p className="text-sm text-slate-500">Global account and security oversight.</p>
            </div>
            <button 
              onClick={() => { setEditingEmployee(null); setShowForm(true); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center transition-all"
            >
              <UserPlus className="w-5 h-5 mr-2" /> New Account
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 flex items-center">
                  <Cloud className="w-5 h-5 mr-2 text-indigo-500" />
                  Global Cloud Sync
                </h3>
                {syncId && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Live Linked</span>}
             </div>
             
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Enter your <strong>Company Sync Key</strong> below. Use the same key on multiple laptops to share users, attendance, and messages in real-time.
                </p>
                <div className="flex gap-2">
                   <input 
                    type="text" 
                    placeholder="Enter Key (e.g. CF-XR92...)" 
                    className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl outline-none font-mono font-bold text-sm"
                    value={tempSyncId}
                    onChange={(e) => setTempSyncId(e.target.value.toUpperCase())}
                   />
                   <button onClick={saveSync} className="bg-slate-900 text-white px-6 rounded-2xl font-bold hover:bg-black transition-all">Link</button>
                </div>
                <div className="flex justify-between items-center pt-2">
                   <button onClick={generateSyncId} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Generate New Key</button>
                   {syncId && (
                     <button onClick={copyKey} className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
                       {copied ? <Check size={12} className="mr-1 text-emerald-500" /> : <Copy size={12} className="mr-1" />}
                       {copied ? 'Copied' : 'Copy Key'}
                     </button>
                   )}
                </div>
             </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] flex flex-col justify-center space-y-4 shadow-sm h-full">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
            <ShieldCheck size={24} />
          </div>
          <h4 className="font-black text-amber-900 uppercase tracking-tight">Security & Global Policy</h4>
          <p className="text-sm text-amber-800/80 leading-relaxed font-medium">
            Changes made to the Staff Directory or Project Deployment are broadcasted globally when Sync is active. 
            Ensure your Sync Key is kept private to your organization. Root credentials (Jahanzaib Khan) remain protected.
          </p>
          <button onClick={onSyncNow} className="flex items-center text-amber-700 font-black text-[10px] uppercase tracking-widest hover:text-amber-900 transition-colors">
            <RefreshCw size={14} className="mr-2" /> Refresh Global Connection
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{editingEmployee ? `Configure Account: ${editingEmployee.name}` : 'Create System Account'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
              <input placeholder="Full Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Emp Code" className="w-full p-4 bg-slate-50 border rounded-2xl" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
                <select className="w-full p-4 bg-slate-50 border rounded-2xl" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                  {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <input placeholder="Email" className="w-full p-4 bg-slate-50 border rounded-2xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Username" className="w-full p-4 bg-slate-50 border rounded-2xl" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                <input placeholder="Password" className="w-full p-4 bg-slate-50 border rounded-2xl" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-4">
               <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                  <h4 className="font-bold text-sm text-indigo-900 mb-3 flex items-center"><Briefcase className="w-4 h-4 mr-2" /> Assign Projects</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {projects.map(p => (
                      <label key={p.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer">
                        <input type="checkbox" checked={formData.allowedProjects.includes(p.id)} onChange={() => setFormData(prev => ({ ...prev, allowedProjects: prev.allowedProjects.includes(p.id) ? prev.allowedProjects.filter(id => id !== p.id) : [...prev.allowedProjects, p.id] }))} className="w-4 h-4" />
                        <span className="text-xs font-bold">{p.name}</span>
                      </label>
                    ))}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <input type="time" value={formData.shiftStart} onChange={e => setFormData({...formData, shiftStart: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  <input type="time" value={formData.shiftEnd} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
               </div>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t">
               <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
               <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                 <Save className="w-4 h-4 mr-2" /> Save Account
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Full Profile</th>
              <th className="px-8 py-5">Role</th>
              <th className="px-8 py-5">Credential Pair</th>
              <th className="px-8 py-5">Assigned Coverage</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-700">{emp.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight flex items-center">
                          {emp.name} {emp.id === 'dev-root' && <ShieldCheck className="w-3.5 h-3.5 ml-1.5 text-indigo-600" />}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{emp.code}</div>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 rounded-md text-slate-600 border border-slate-200">{emp.role.replace('_', ' ')}</span>
                </td>
                <td className="px-8 py-5 text-xs">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase">U: {emp.username}</span>
                      <span className="font-bold text-indigo-600">P: {emp.password}</span>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex flex-wrap gap-1">
                      {emp.allowedProjectIds.map(pid => (
                        <span key={pid} className="text-[9px] bg-indigo-50 text-indigo-600 font-black uppercase px-2 py-1 rounded border border-indigo-100">
                          {projects.find(p => p.id === pid)?.name || '...'}
                        </span>
                      ))}
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <button onClick={() => { setEditingEmployee(emp); setFormData({ name: emp.name, username: emp.username, password: emp.password || '', email: emp.email, code: emp.code, role: emp.role, shiftStart: emp.shift.start, shiftEnd: emp.shift.end, allowedProjects: [...emp.allowedProjectIds] }); setShowForm(true); }} className="text-slate-400 hover:text-indigo-600 p-2 bg-slate-50 rounded-xl transition-all">
                    <Settings size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPortal;
