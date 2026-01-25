
import React, { useState } from 'react';
import { Employee, UserRole, EmployeeStatus, Project } from '../types';
import { UserPlus, Settings, Save, X, Briefcase, Key, Eye } from 'lucide-react';

interface AdminPortalProps {
  onAddEmployee: (emp: Employee) => void;
  employees: Employee[];
  projects: Project[];
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onAddEmployee, employees, projects }) => {
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      totalMinutesWorkedToday: 0
    };
    onAddEmployee(newEmp);
    setShowForm(false);
    setFormData({
      name: '', username: '', password: '', email: '', code: '',
      role: UserRole.EMPLOYEE, shiftStart: '09:00', shiftEnd: '17:00', allowedProjects: []
    });
  };

  const toggleProject = (pid: string) => {
    setFormData(prev => ({
      ...prev,
      allowedProjects: prev.allowedProjects.includes(pid) 
        ? prev.allowedProjects.filter(id => id !== pid)
        : [...prev.allowedProjects, pid]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">User & Project Directory</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" /> New Employee
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Create Profile</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input 
                placeholder="Full Name" 
                className="w-full p-4 bg-slate-50 border rounded-xl outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  placeholder="Emp Code (e.g. EMP045)" 
                  className="w-full p-4 bg-slate-50 border rounded-xl"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  required
                />
                <select 
                  className="w-full p-4 bg-slate-50 border rounded-xl"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <input 
                placeholder="Email Address" 
                className="w-full p-4 bg-slate-50 border rounded-xl"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Key className="absolute left-3 top-4 text-slate-300 w-4 h-4" />
                  <input 
                    placeholder="Username" 
                    className="w-full p-4 pl-10 bg-slate-50 border rounded-xl"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <input 
                  type="text"
                  placeholder="Password" 
                  className="w-full p-4 bg-slate-50 border rounded-xl"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                  <h4 className="font-bold text-sm text-indigo-900 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" /> Assign Projects
                  </h4>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {projects.map(p => (
                      <label key={p.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-200">
                        <input 
                          type="checkbox" 
                          checked={formData.allowedProjects.includes(p.id)}
                          onChange={() => toggleProject(p.id)}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-sm font-medium">{p.name}</span>
                      </label>
                    ))}
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Shift Start</label>
                    <input type="time" value={formData.shiftStart} onChange={e => setFormData({...formData, shiftStart: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Shift End</label>
                    <input type="time" value={formData.shiftEnd} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                  </div>
               </div>
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t">
               <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold">Cancel</button>
               <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center">
                 <Save className="w-4 h-4 mr-2" /> Save Profile
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-widest">
            <tr>
              <th className="px-8 py-4">Employee</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Credentials</th>
              <th className="px-8 py-4">Projects Assigned</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-5">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-700">{emp.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-400">{emp.code}</div>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md">{emp.role}</span>
                </td>
                <td className="px-8 py-5 text-sm">
                   <div className="text-slate-600 font-mono flex flex-col">
                      <span className="font-bold text-xs uppercase text-slate-400">User: {emp.username}</span>
                      <span className="text-indigo-600 font-bold flex items-center mt-1">
                        <Eye className="w-3 h-3 mr-1" /> {emp.password}
                      </span>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex flex-wrap gap-1">
                      {emp.allowedProjectIds.map(pid => (
                        <span key={pid} className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded">
                          {projects.find(p => p.id === pid)?.name || 'Project'}
                        </span>
                      ))}
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="text-indigo-600 hover:text-indigo-800 p-2"><Settings size={18} /></button>
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
