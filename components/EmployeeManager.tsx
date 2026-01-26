
import React, { useState, useMemo } from 'react';
import { Employee, UserRole, Project, EmployeeStatus } from '../types';
import { UserPlus, Search, Briefcase, Clock, UserCheck, Trash2, Edit3, X, Save, Zap, ShieldCheck } from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  projects: Project[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  currentUser: Employee;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ 
  employees, 
  projects, 
  onAddEmployee, 
  onUpdateEmployee, 
  onDeleteEmployee,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    username: '',
    email: '',
    password: 'password123',
    role: UserRole.EMPLOYEE,
    shiftStart: '09:00',
    shiftEnd: '17:00',
    supervisorId: '',
    projectIds: [] as string[],
    otEnabled: false
  });

  const roleWeights: Record<UserRole, number> = {
    [UserRole.EMPLOYEE]: 0,
    [UserRole.TEAM_LEAD]: 1,
    [UserRole.SUPERVISOR]: 2,
    [UserRole.DIRECTOR]: 3,
    [UserRole.ADMIN]: 4,
    [UserRole.TOP_MANAGEMENT]: 5,
  };

  const canEdit = (target: Employee) => {
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TOP_MANAGEMENT) return true;
    return roleWeights[currentUser.role] > roleWeights[target.role];
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = filterProject ? emp.allowedProjectIds.includes(filterProject) : true;
      const matchesRole = filterRole ? emp.role === filterRole : true;
      return matchesSearch && matchesProject && matchesRole;
    });
  }, [employees, searchTerm, filterProject, filterRole]);

  const openAddForm = () => {
    setEditingEmployee(null);
    setFormData({
      name: '', code: '', username: '', email: '', password: 'password123',
      role: UserRole.EMPLOYEE, shiftStart: '09:00', shiftEnd: '17:00', supervisorId: '', projectIds: [],
      otEnabled: false
    });
    setShowForm(true);
  };

  const openEditForm = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      code: emp.code,
      username: emp.username,
      email: emp.email,
      password: emp.password || 'password123',
      role: emp.role,
      shiftStart: emp.shift.start,
      shiftEnd: emp.shift.end,
      supervisorId: emp.supervisorId || '',
      projectIds: [...emp.allowedProjectIds],
      otEnabled: emp.otEnabled || false
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      const updatedEmp: Employee = {
        ...editingEmployee,
        code: formData.code,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role,
        shift: { start: formData.shiftStart, end: formData.shiftEnd },
        allowedProjectIds: formData.projectIds,
        supervisorId: formData.supervisorId || null,
        otEnabled: formData.otEnabled
      };
      onUpdateEmployee(updatedEmp);
    } else {
      const newEmp: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        code: formData.code,
        name: formData.name,
        username: formData.username || formData.name.toLowerCase().replace(/\s+/g, '.'),
        password: formData.password,
        email: formData.email,
        role: formData.role,
        shift: { start: formData.shiftStart, end: formData.shiftEnd },
        allowedProjectIds: formData.projectIds,
        activeProjectId: formData.projectIds[0] || 'p3',
        supervisorId: formData.supervisorId || null,
        status: EmployeeStatus.OFF,
        lastActionTime: new Date().toISOString(),
        totalMinutesWorkedToday: 0,
        otEnabled: formData.otEnabled
      };
      onAddEmployee(newEmp);
    }
    setShowForm(false);
  };

  const toggleProject = (pid: string) => {
    setFormData(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(pid) 
        ? prev.projectIds.filter(id => id !== pid)
        : [...prev.projectIds, pid]
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search employees..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none text-sm font-medium"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button 
            onClick={openAddForm}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Staff
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">{editingEmployee ? `Editing: ${editingEmployee.name}` : 'Add New Staff Member'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl outline-none font-bold" placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Code</label>
                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl outline-none" placeholder="EMP001" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl outline-none" placeholder="john@chronos.ai" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-4 bg-slate-50 border rounded-xl outline-none font-bold">
                  {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Direct Supervisor</label>
                <select value={formData.supervisorId} onChange={e => setFormData({...formData, supervisorId: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl outline-none">
                  <option value="">No Reporting Manager</option>
                  {employees.filter(e => e.role !== UserRole.EMPLOYEE && e.id !== (editingEmployee?.id || '')).map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Start</label>
                  <input type="time" value={formData.shiftStart} onChange={e => setFormData({...formData, shiftStart: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift End</label>
                  <input type="time" value={formData.shiftEnd} onChange={e => setFormData({...formData, shiftEnd: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-xl outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <h4 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center">
                    <Briefcase className="w-3 h-3 mr-2" /> Project Permissions
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {projects.map(p => (
                      <label key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                        <span className="text-xs font-bold text-slate-700">{p.name}</span>
                        <input type="checkbox" checked={formData.projectIds.includes(p.id)} onChange={() => toggleProject(p.id)} className="w-4 h-4 rounded accent-indigo-600" />
                      </label>
                    ))}
                  </div>
               </div>
               
               <button 
                type="button"
                onClick={() => setFormData({...formData, otEnabled: !formData.otEnabled})}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  formData.otEnabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
               >
                 <div className="flex items-center space-x-3">
                   <Zap size={18} className={formData.otEnabled ? 'text-emerald-500' : 'text-slate-300'} />
                   <span className="text-xs font-black uppercase tracking-widest">Overtime Perms</span>
                 </div>
                 <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.otEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.otEnabled ? 'right-1' : 'left-1'}`}></div>
                 </div>
               </button>
            </div>

            <div className="lg:col-span-3 flex justify-end items-center gap-4 pt-6 border-t border-slate-100">
               <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
               <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                 <Save className="w-4 h-4 mr-2" /> {editingEmployee ? 'Update Profile' : 'Save Staff Member'}
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Employee Identity</th>
                <th className="px-8 py-5">Deployment</th>
                <th className="px-8 py-5">OT Perms</th>
                <th className="px-8 py-5">Reports To</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map(emp => {
                const supervisor = employees.find(e => e.id === emp.supervisorId);
                const isEditable = canEdit(emp);
                const isRoot = emp.id === 'dev-root';

                return (
                  <tr key={emp.id} className={`hover:bg-slate-50/30 transition-colors group ${isRoot ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${isRoot ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none flex items-center">
                            {emp.name}
                            {isRoot && <ShieldCheck size={14} className="ml-2 text-indigo-600" title="Protected Account" />}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{emp.code} • {emp.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {emp.allowedProjectIds.map(pid => {
                          const proj = projects.find(p => p.id === pid);
                          return (
                            <span key={pid} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md">
                              {proj?.name || 'Unknown'}
                            </span>
                          );
                        })}
                        {emp.allowedProjectIds.length === 0 && <span className="text-xs text-slate-300 italic">No project assigned</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {emp.otEnabled ? (
                        <span className="flex items-center text-emerald-600 text-[10px] font-black uppercase">
                          <Zap size={10} className="mr-1" /> Authorized
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-slate-300">Standard</span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                        <span className="text-sm font-semibold text-slate-700">{supervisor?.name || 'Unspecified'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditable ? (
                          <>
                            <button 
                              onClick={() => openEditForm(emp)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" 
                              title="Edit Staff Member"
                            >
                              <Edit3 size={16} />
                            </button>
                            {!isRoot && (
                              <button 
                                onClick={() => onDeleteEmployee(emp.id)}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Remove Staff Member"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Read Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManager;
