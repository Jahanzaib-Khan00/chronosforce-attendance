
import React, { useState, useMemo } from 'react';
// Fix: PROJECTS is exported from constants.ts, not types.ts
import { Employee, EmployeeStatus, Project, UserRole } from '../types';
import { PROJECTS } from '../constants';
// Fix: Added CalendarCheck to the imported icons
import { Users, Briefcase, Clock, AlertTriangle, Search, BrainCircuit, ChevronRight, CalendarCheck, Lock, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import StatCard from './StatCard';
import { getWorkforceInsights } from '../services/geminiService';

interface ManagerPortalProps {
  employees: Employee[];
  projects: Project[];
  currentUser: Employee;
}

const ManagerPortal: React.FC<ManagerPortalProps> = ({ employees, projects, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Hierarchical Filter:
  // Admin sees ALL.
  // Director sees Team Leads and Employees.
  // Team Lead sees only Employees.
  const visibleEmployees = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN) return employees;
    if (currentUser.role === UserRole.DIRECTOR) {
      return employees.filter(e => e.role === UserRole.TEAM_LEAD || e.role === UserRole.EMPLOYEE);
    }
    if (currentUser.role === UserRole.TEAM_LEAD) {
      return employees.filter(e => e.role === UserRole.EMPLOYEE);
    }
    return []; // Standard employees should theoretically not be here
  }, [employees, currentUser]);

  const stats = useMemo(() => {
    return {
      active: visibleEmployees.filter(e => e.status === EmployeeStatus.ACTIVE).length,
      break: visibleEmployees.filter(e => e.status === EmployeeStatus.BREAK).length,
      late: visibleEmployees.filter(e => {
        // Mock logic for lateness: check in with low hours
        return e.status === EmployeeStatus.ACTIVE && e.totalMinutesWorkedToday < 60;
      }).length,
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

  return (
    <div className="space-y-8 pb-20">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Staff" value={stats.active} icon={<Users size={24}/>} color="bg-emerald-500" />
        <StatCard label="On Break" value={stats.break} icon={<Clock size={24}/>} color="bg-amber-500" />
        <StatCard label="Anomalies" value={stats.late} icon={<AlertTriangle size={24}/>} color="bg-rose-500" />
        <StatCard label="Leaves" value={stats.leave} icon={<CalendarCheck size={24}/>} color="bg-indigo-500" />
      </div>

      {/* AI Insights & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-md border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Resource Allocation</h3>
            <div className="text-sm text-slate-500">Subordinates per project</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-6">
              <BrainCircuit className="w-6 h-6" />
              <h3 className="text-xl font-bold">Manager Intelligence</h3>
            </div>
            
            {aiInsights ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-indigo-100 leading-relaxed text-sm whitespace-pre-wrap">{aiInsights}</p>
                <button 
                  onClick={() => setAiInsights(null)}
                  className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-white"
                >
                  Regenerate Report
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                <p className="text-indigo-100 italic">Analyze current hierarchy status for operational efficiency.</p>
                <button 
                  onClick={handleGenerateInsights}
                  disabled={isAnalyzing}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center disabled:opacity-50"
                >
                  {isAnalyzing ? "Analysing..." : "Analyze Subordinates"}
                  {!isAnalyzing && <ChevronRight className="ml-2 w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Subordinate Table with Passwords */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <h3 className="text-xl font-bold text-slate-900">Subordinate Credentials & Status</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search staff..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4 font-semibold">Staff Identity</th>
                <th className="px-8 py-4 font-semibold">Access Key (PWD)</th>
                <th className="px-8 py-4 font-semibold">Current Task</th>
                <th className="px-8 py-4 font-semibold">Live Status</th>
                <th className="px-8 py-4 font-semibold text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-400">Role: {emp.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center text-xs font-mono text-slate-500 mb-1">
                        <Lock className="w-3 h-3 mr-1" /> {emp.username}
                      </div>
                      <div className="font-bold text-indigo-600 flex items-center">
                        <Eye className="w-3 h-3 mr-1" /> {emp.password}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                    {PROJECTS.find(p => p.id === emp.activeProjectId)?.name || 'Idle'}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      emp.status === EmployeeStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' :
                      emp.status === EmployeeStatus.BREAK ? 'bg-amber-100 text-amber-700' :
                      emp.status === EmployeeStatus.LEAVE ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-slate-700">
                    {Math.floor(emp.totalMinutesWorkedToday / 60)}h {emp.totalMinutesWorkedToday % 60}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerPortal;
