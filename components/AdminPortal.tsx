
import React, { useState } from 'react';
import { Employee, UserRole, EmployeeStatus, Project } from '../types';
import { UserPlus, Settings, Save, X, Briefcase, Key, Eye, AlertCircle, ShieldCheck, Cloud, RefreshCw, Copy, Check, Users as UsersIcon, Globe } from 'lucide-react';

interface AdminPortalProps {
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  employees: Employee[];
  projects: Project[];
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
  onSyncNow: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onAddEmployee, onUpdateEmployee, employees, projects, workspaceId, setWorkspaceId, onSyncNow }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [copied, setCopied] = useState(false);
  const [tempId, setTempId] = useState(workspaceId);
  
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

  const copyKey = () => {
    navigator.clipboard.writeText(workspaceId);
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
        username: formData.username || formData.name.toLowerCase().replace(/\s+/g, '.'),
        password: formData.password || 'password123',
        email: formData.email,
        role: formData.role,
        shift: { start: formData.shiftStart, end: formData.shiftEnd },
        allowedProjectIds: formData.allowedProjects,
        activeProjectId: formData.allowedProjects[0] || 'p3',
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
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Terminal</h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Global System Configuration</p>
            </div>
            <button 
              onClick={() => { setEditingEmployee(null); setShowForm(true); }}
              className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 flex items-center transition-all"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Provision Account
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                  Cloud Deployment
                </h3>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full">Encrypted Node</span>
             </div>
             
             <div className="p-6 bg-slate-900 rounded-3xl space-y-4">
                <div className="flex items-start space-x-3">
                   <div className="bg-indigo-600 p-2 rounded-lg text-white mt-1"><Key size={14}/></div>
                   <div>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Workspace ID (Company Code)</p>
                      <p className="text-xl font-mono font-black text-white tracking-widest mt-1">{workspaceId}</p>
                   </div>
                </div>

                <div className="flex gap-2">
                   <button onClick={copyKey} className="flex-1 py-4 bg-white/5 text-white/80 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center">
                      {copied ? <Check size={14} className="mr-2 text-emerald-400" /> : <Copy size={14} className="mr-2" />}
                      {copied ? 'Copied' : 'Copy Key'}
                   </button>
                   <button onClick={onSyncNow} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <RefreshCw size={14} className="mr-2" /> Broadcast Sync
                   </button>
                </div>
                
                <p className="text-[9px] text-white/30 font-medium leading-relaxed italic text-center">
                  Share this Company Code with staff on other devices to link them to this database.
                </p>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[2.5rem] flex flex-col justify-center space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h4 className="font-black text-white text-xl tracking-tight">System Integrity</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium mt-2">
              All data entered is automatically sharded across the global node `A2WkXv7U8rKj1L9p5hE3z`. 
              Administrative overrides (Jahanzaib Khan) are hard-coded for system recovery.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            Master Server Active
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                 {editingEmployee ? <Settings size={20}/> : <UserPlus size={20}/>}
               </div>
               <h3 className="text-xl font-black text-slate-900">{editingEmployee ? `Update Account: ${editingEmployee.name}` : 'Provision New Staff'}</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-xl"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Identity</label>
                <input required placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Staff Code</label>
                  <input required placeholder="EMP-XXX" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Access Level</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Hub</label>
                <input required type="email" placeholder="email@chronos.ai" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-5">
               <div className="p-5 bg-indigo-50/30 rounded-3xl border border-indigo-50">
                  <h4 className="font-black text-[10px] text-indigo-900 uppercase tracking-widest mb-4 flex items-center"><Briefcase className="w-4 h-4 mr-2" /> Project Deployment</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {projects.map(p => (
                      <label key={p.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-300 transition-all">
                        <input type="checkbox" checked={formData.allowedProjects.includes(p.id)} onChange={() => setFormData(prev => ({ ...prev, allowedProjects: prev.allowedProjects.includes(p.id) ? prev.allowedProjects.filter(id => id !== p.id) : [...prev.allowedProjects, p.id] }))} className="w-4 h-4 rounded accent-indigo-600" />
                        <span className="text-xs font-bold text-slate-700">{p.name}</span>
                      </label>
                    ))}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shift In</label>
                    <input type="time" value={formData.shiftStart} onChange={e => setFormData({...formData, shiftStart: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Shift Out</label>
                    <input type="time" value={formData.shiftEnd} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
                  </div>
               </div>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t">
               <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition-all">Dismiss</button>
               <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                 Commit Provisioning
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[9px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-6">Staff Profile</th>
              <th className="px-8 py-6">Access Level</th>
              <th className="px-8 py-6">Security Keys</th>
              <th className="px-8 py-6 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-5">
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-700 shadow-inner">{emp.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight flex items-center">
                          {emp.name} {emp.id === 'dev-root' && <ShieldCheck className="w-3.5 h-3.5 ml-1.5 text-indigo-600" />}
                        </div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{emp.code}</div>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 border border-slate-200">{emp.role.replace('_', ' ')}</span>
                </td>
                <td className="px-8 py-5">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-300 uppercase">U: {emp.username}</span>
                      <span className="font-bold text-indigo-500 tracking-tighter text-xs">P: {emp.password}</span>
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <button onClick={() => { setEditingEmployee(emp); setFormData({ name: emp.name, username: emp.username, password: emp.password || '', email: emp.email, code: emp.code, role: emp.role, shiftStart: emp.shift.start, shiftEnd: emp.shift.end, allowedProjects: [...emp.allowedProjectIds] }); setShowForm(true); }} className="text-slate-400 hover:text-indigo-600 p-2.5 bg-slate-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
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
