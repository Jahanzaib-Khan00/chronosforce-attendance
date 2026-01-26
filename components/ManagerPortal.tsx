
import React, { useState, useMemo } from 'react';
import { Employee, EmployeeStatus, Project, UserRole, AttendanceRecord } from '../types';
import { PROJECTS } from '../constants';
import { Users, Briefcase, Clock, AlertTriangle, Search, BrainCircuit, ChevronRight, CalendarCheck, Lock, Eye, History, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatCard from './StatCard';
import { getWorkforceInsights } from '../services/geminiService';

interface ManagerPortalProps {
  employees: Employee[];
  projects: Project[];
  currentUser: Employee;
  attendanceRecords: AttendanceRecord[];
}

const ManagerPortal: React.FC<ManagerPortalProps> = ({ employees, projects, currentUser, attendanceRecords }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAuditUser, setSelectedAuditUser] = useState<Employee | null>(null);

  const visibleEmployees = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN) return employees;
    if (currentUser.role === UserRole.DIRECTOR) {
      return employees.filter(e => e.role === UserRole.TEAM_LEAD || e.role === UserRole.EMPLOYEE);
    }
    if (currentUser.role === UserRole.TEAM_LEAD) {
      return employees.filter(e => e.role === UserRole.EMPLOYEE);
    }
    if (currentUser.role === UserRole.SUPERVISOR) {
      return employees.filter(e => e.supervisorId === currentUser.id);
    }
    return [];
  }, [employees, currentUser]);

  const stats = useMemo(() => {
    return {
      active: visibleEmployees.filter(e => e.status === EmployeeStatus.ACTIVE).length,
      break: visibleEmployees.filter(e => e.status === EmployeeStatus.BREAK).length,
      late: visibleEmployees.filter(e => e.status === EmployeeStatus.ACTIVE && e.totalMinutesWorkedToday < 60).length,
      leave: visibleEmployees.filter(e => e.status === EmployeeStatus.LEAVE).length,
    };
  }, [visibleEmployees]);

  const projectDistribution = useMemo(() => {
    return projects.map(p => ({
      name: p.name,
      count: visibleEmployees.filter(e => e.activeProjectId === p.id).length
    }));
  }, [visibleEmployees, projects]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const filteredEmployees = visibleEmployees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateInsights = async () => {
    setIsAnalyzing(true);
    const insights = await getWorkforceInsights(employees, projects, []);
    setAiInsights(insights || "No insights available.");
    setIsAnalyzing(false);
  };

  const getAuditLogs = (userId: string) => {
    return attendanceRecords.filter(r => r.employeeId === userId).reverse();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Staff" value={stats.active} icon={<Users size={24}/>} color="bg-emerald-500" />
        <StatCard label="On Break" value={stats.break} icon={<Clock size={24}/>} color="bg-amber-500" />
        <StatCard label="Critical" value={stats.late} icon={<AlertTriangle size={24}/>} color="bg-rose-500" />
        <StatCard label="On Leave" value={stats.leave} icon={<CalendarCheck size={24}/>} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-md border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Resource Distribution</h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Headcount per project</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-6">
              <BrainCircuit className="w-6 h-6" />
              <h3 className="text-xl font-bold">Ops Intelligence</h3>
            </div>
            
            {aiInsights ? (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-sm text-indigo-100 leading-relaxed whitespace-pre-wrap">
                {aiInsights}
                <button 
                  onClick={() => setAiInsights(null)}
                  className="block mt-6 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                >
                  Clear Analysis
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                <p className="text-indigo-100 font-medium italic">Audit subordinate productivity and identify operational bottlenecks with AI.</p>
                <button 
                  onClick={handleGenerateInsights}
                  disabled={isAnalyzing}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all flex items-center shadow-lg disabled:opacity-50"
                >
                  {isAnalyzing ? "Processing Data..." : "Analyze Workforce"}
                  {!isAnalyzing && <ChevronRight className="ml-2 w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900">Personnel Monitor</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name or code..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Staff Identity</th>
                <th className="px-8 py-5">Current Task</th>
                <th className="px-8 py-5">Daily Yield</th>
                <th className="px-8 py-5">Live State</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{emp.role.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center text-sm font-bold text-slate-600">
                       <Briefcase className="w-3.5 h-3.5 mr-2 text-slate-300" />
                       {PROJECTS.find(p => p.id === emp.activeProjectId)?.name || 'Idle'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-slate-900">{Math.floor(emp.totalMinutesWorkedToday / 60)}h {emp.totalMinutesWorkedToday % 60}m</span>
                       <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${Math.min((emp.totalMinutesWorkedToday / 480) * 100, 100)}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      emp.status === EmployeeStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      emp.status === EmployeeStatus.BREAK ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      emp.status === EmployeeStatus.LEAVE ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedAuditUser(emp)}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all"
                      title="View Daily Audit Log"
                    >
                      <History size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Modal */}
      {selectedAuditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center space-x-3">
                 <History className="text-indigo-600" size={24} />
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">Attendance Audit</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedAuditUser.name}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedAuditUser(null)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-100 transition-all text-slate-400"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {getAuditLogs(selectedAuditUser.id).length === 0 ? (
                  <div className="text-center py-10">
                    <Clock className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No activity data for today</p>
                  </div>
                ) : (
                  getAuditLogs(selectedAuditUser.id).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            log.type === 'CLOCK_IN' ? 'bg-emerald-100 text-emerald-600' :
                            log.type === 'CLOCK_OUT' ? 'bg-slate-200 text-slate-500' :
                            log.type === 'BREAK_START' ? 'bg-amber-100 text-amber-600' :
                            log.type === 'BREAK_END' ? 'bg-emerald-50 text-emerald-500' :
                            'bg-indigo-50 text-indigo-500'
                          }`}>
                            {log.type.includes('CLOCK') ? <Clock size={14}/> : log.type.includes('BREAK') ? <Clock size={14}/> : <Briefcase size={14}/>}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.type.replace('_', ' ')}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{log.type === 'PROJECT_CHANGE' ? PROJECTS.find(p => p.id === log.projectId)?.name : 'System Log'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Timestamp</p>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Duty Time</p>
                  <p className="text-xl font-black text-indigo-600">{Math.floor(selectedAuditUser.totalMinutesWorkedToday / 60)}h {selectedAuditUser.totalMinutesWorkedToday % 60}m</p>
               </div>
               <button onClick={() => setSelectedAuditUser(null)} className="bg-white text-slate-700 font-bold px-6 py-3 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPortal;
