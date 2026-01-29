
import React, { useState, useMemo } from 'react';
import { Employee, EmployeeStatus, Project, UserRole, AttendanceRecord, DailyActivityLog } from '../types';
import { Users, Clock, Search, FileSpreadsheet, Filter, Circle } from 'lucide-react';
import StatCard from './StatCard';
import ReportBuilder from './ReportBuilder';
import { formatTime12h } from '../App';

interface ManagerPortalProps {
  employees: Employee[];
  projects: Project[];
  currentUser: Employee;
  attendanceRecords: AttendanceRecord[];
  dailyActivityLogs: DailyActivityLog[];
}

type LiveFilter = 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ALL';

const ManagerPortal: React.FC<ManagerPortalProps> = ({ 
  employees, 
  projects, 
  currentUser, 
  attendanceRecords, 
  dailyActivityLogs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [liveFilter, setLiveFilter] = useState<LiveFilter>('CLOCKED_IN');
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  const canBuildReport = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR].includes(currentUser.role);

  const visibleEmployees = useMemo(() => {
    let list = [...employees];
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.TOP_MANAGEMENT) {
      if (currentUser.role === UserRole.DIRECTOR) {
        list = list.filter(e => e.role === UserRole.TEAM_LEAD || e.role === UserRole.EMPLOYEE || e.role === UserRole.SUPERVISOR);
      } else if (currentUser.role === UserRole.SUPERVISOR || currentUser.role === UserRole.TEAM_LEAD) {
        list = list.filter(e => e.supervisorId === currentUser.id);
      }
    }
    
    return list.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = projectFilter === 'ALL' ? true : e.activeProjectId === projectFilter;
      let matchesLive = true;
      if (liveFilter === 'CLOCKED_IN') matchesLive = (e.status === EmployeeStatus.ACTIVE || e.status === EmployeeStatus.BREAK);
      else if (liveFilter === 'CLOCKED_OUT') matchesLive = (e.status === EmployeeStatus.OFF || e.status === EmployeeStatus.LEAVE);
      return matchesSearch && matchesProject && matchesLive;
    });
  }, [employees, currentUser, searchTerm, projectFilter, liveFilter]);

  const stats = useMemo(() => ({
    active: employees.filter(e => e.status === EmployeeStatus.ACTIVE || e.status === EmployeeStatus.BREAK).length,
    onBreak: employees.filter(e => e.status === EmployeeStatus.BREAK).length,
    off: employees.filter(e => e.status === EmployeeStatus.OFF).length,
  }), [employees]);

  const calculateLateDuration = (emp: Employee) => {
    const njNowStr = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
    const clockIn = attendanceRecords.find(r => {
      const rNJStr = new Date(r.timestamp).toLocaleDateString("en-US", { timeZone: "America/New_York" });
      return r.employeeId === emp.id && r.type === 'CLOCK_IN' && rNJStr === njNowStr;
    });

    // Fix: Return an object instead of string to fix property access errors (type and text) in JSX
    if (!clockIn) return { text: "--:--", type: 'NONE' };

    const [sh, sm] = emp.shift.start.split(':').map(Number);
    const actualIn = new Date(clockIn.timestamp);
    
    // Construct shift start time on the same wall-clock day as actualIn in NJ
    const actualInNJDate = new Date(actualIn.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const shiftStart = new Date(actualInNJDate);
    shiftStart.setHours(sh, sm, 0, 0);

    const diffMs = actualInNJDate.getTime() - shiftStart.getTime();
    const diffMins = Math.abs(Math.floor(diffMs / 60000));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    const timeFormatted = `${h}h ${m}m`;

    if (diffMs > 60000) return { text: `${timeFormatted} Late`, type: 'LATE' };
    if (diffMs < -60000) return { text: `${timeFormatted} Early`, type: 'EARLY' };
    return { text: "On Time", type: 'ON_TIME' };
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Dashboard</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Pulse (Eastern Time)</p>
        </div>
        {canBuildReport && (
          <button onClick={() => setShowReportBuilder(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center">
            <FileSpreadsheet size={18} className="mr-2" /> Report Center
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Clocked In" value={stats.active} icon={<Users size={24}/>} color="bg-emerald-500" />
        <StatCard label="Live Breaks" value={stats.onBreak} icon={<Clock size={24}/>} color="bg-amber-500" />
        <StatCard label="Clocked Out" value={stats.off} icon={<Circle size={24}/>} color="bg-slate-400" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
             <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {(['CLOCKED_IN', 'CLOCKED_OUT', 'ALL'] as LiveFilter[]).map((f) => (
                  <button key={f} onClick={() => setLiveFilter(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${liveFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{f.replace('_', ' ')}</button>
                ))}
             </div>
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input type="text" placeholder="Search staff..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
          </div>
          <div className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            NJ Server Sync Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Staff Member</th>
                <th className="px-8 py-5">Live Status</th>
                <th className="px-8 py-5">Clock In Time</th>
                <th className="px-8 py-5">Late Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEmployees.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">No matching personnel found</td></tr>
              ) : (
                visibleEmployees.map(emp => {
                  const njStr = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
                  const clockIn = attendanceRecords.find(r => new Date(r.timestamp).toLocaleDateString("en-US", { timeZone: "America/New_York" }) === njStr && r.employeeId === emp.id && r.type === 'CLOCK_IN');
                  const late = calculateLateDuration(emp);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">{emp.name.charAt(0)}</div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">{emp.name}</div>
                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{emp.code} • {emp.role.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          emp.status === EmployeeStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          emp.status === EmployeeStatus.BREAK ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-slate-50 text-slate-400 border-slate-100'
                        }`}>{emp.status}</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-slate-700">{clockIn ? formatTime12h(clockIn.timestamp) : '--:--'}</td>
                      <td className="px-8 py-5">
                        <span className={`text-sm font-black tracking-tighter ${
                          late.type === 'LATE' ? 'text-rose-500' : 
                          late.type === 'EARLY' ? 'text-indigo-500' : 
                          'text-slate-300'
                        }`}>
                          {late.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showReportBuilder && <ReportBuilder employees={employees} projects={projects} attendanceRecords={attendanceRecords} onClose={() => setShowReportBuilder(false)} />}
    </div>
  );
};

export default ManagerPortal;
