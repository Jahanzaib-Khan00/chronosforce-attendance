
import React, { useState, useMemo } from 'react';
import { Employee, EmployeeStatus, Project, UserRole, AttendanceRecord, DailyActivityLog } from '../types';
import { PROJECTS } from '../constants';
// Added CalendarCheck to the imports
import { Users, Clock, AlertTriangle, Search, History, X, FileSpreadsheet, ClipboardList, Briefcase, Calendar, CalendarCheck } from 'lucide-react';
import StatCard from './StatCard';
import ReportBuilder from './ReportBuilder';

interface ManagerPortalProps {
  employees: Employee[];
  projects: Project[];
  currentUser: Employee;
  attendanceRecords: AttendanceRecord[];
  dailyActivityLogs: DailyActivityLog[];
}

const ManagerPortal: React.FC<ManagerPortalProps> = ({ 
  employees, 
  projects, 
  currentUser, 
  attendanceRecords, 
  dailyActivityLogs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [selectedTimelineUser, setSelectedTimelineUser] = useState<Employee | null>(null);

  const canBuildReport = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR].includes(currentUser.role);

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

  const timelineData = useMemo(() => {
    if (!selectedTimelineUser) return [];
    const days = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayLogs = dailyActivityLogs.filter(l => l.employeeId === selectedTimelineUser.id && l.date === dateStr);
      const dayAttendance = attendanceRecords.filter(r => r.employeeId === selectedTimelineUser.id && r.timestamp.startsWith(dateStr));
      
      if (dayLogs.length > 0 || dayAttendance.length > 0) {
        days.push({
          date: dateStr,
          logs: dayLogs,
          attendance: dayAttendance
        });
      }
    }
    return days;
  }, [selectedTimelineUser, dailyActivityLogs, attendanceRecords]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Operations Control</h2>
        {canBuildReport && (
          <button 
            onClick={() => setShowReportBuilder(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <FileSpreadsheet size={18} className="mr-2" /> Report Center
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Active Staff" value={stats.active} icon={<Users size={24}/>} color="bg-emerald-500" />
        <StatCard label="On Break" value={stats.break} icon={<Clock size={24}/>} color="bg-amber-500" />
        <StatCard label="Critical" value={stats.late} icon={<AlertTriangle size={24}/>} color="bg-rose-500" />
        <StatCard label="On Leave" value={stats.leave} icon={<CalendarCheck size={24}/>} color="bg-indigo-500" />
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900">Personnel Monitor</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search staff..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Staff Identity</th>
                <th className="px-8 py-5">Daily Yield</th>
                <th className="px-8 py-5">OT Perms</th>
                <th className="px-8 py-5">Live State</th>
                <th className="px-8 py-5 text-right">360 View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleEmployees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-sm">{emp.name.charAt(0)}</div>
                      <div><div className="font-bold text-slate-900">{emp.name}</div><div className="text-[10px] text-slate-400 font-bold uppercase">{emp.role.replace('_', ' ')}</div></div>
                    </div>
                  </td>
                  <td className="px-8 py-5"><span className="text-sm font-black text-slate-900">{Math.floor(emp.totalMinutesWorkedToday / 60)}h {emp.totalMinutesWorkedToday % 60}m</span></td>
                  <td className="px-8 py-5">
                    {emp.otEnabled ? (
                      <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Allowed</span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-100">Standard</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      emp.status === EmployeeStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      emp.status === EmployeeStatus.BREAK ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>{emp.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedTimelineUser(emp)} 
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm transition-all flex items-center ml-auto"
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

      {showReportBuilder && (
        <ReportBuilder 
          employees={employees}
          projects={projects}
          attendanceRecords={attendanceRecords}
          onClose={() => setShowReportBuilder(false)}
        />
      )}

      {selectedTimelineUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 font-bold text-xl">
                  {selectedTimelineUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">Staff 360: {selectedTimelineUser.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedTimelineUser.code} • Daily Activity Lifecycle</p>
                </div>
              </div>
              <button onClick={() => setSelectedTimelineUser(null)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/30">
              {timelineData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-50">
                   <Calendar size={64} />
                   <p className="font-bold text-sm uppercase tracking-widest">No activity found in the last 30 days</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {timelineData.map(day => (
                    <div key={day.date} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                           <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                             <Calendar size={20} />
                           </div>
                           <div>
                             <h4 className="font-black text-slate-900">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.date}</p>
                           </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {day.logs.length > 0 && (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">Ledger Logged</span>
                          )}
                          <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase border border-slate-100">
                            {day.attendance.length} Logs
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                             <Clock size={12} className="mr-2" /> System Attendance
                           </p>
                           <div className="space-y-2">
                             {day.attendance.map(r => (
                               <div key={r.id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                 <span className="text-[11px] font-bold text-slate-600 uppercase">{r.type.replace('_', ' ')}</span>
                                 <span className="text-[11px] font-black text-slate-900">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               </div>
                             ))}
                           </div>
                        </div>

                        <div className="space-y-3">
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center">
                             <ClipboardList size={12} className="mr-2" /> Manual Ledger Entry
                           </p>
                           {day.logs.length === 0 ? (
                             <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
                               <p className="text-[10px] font-bold text-slate-400 italic">No manual note provided for this date</p>
                             </div>
                           ) : (
                             day.logs.map(log => (
                               <div key={log.id} className="space-y-4">
                                 <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100 italic">
                                   <p className="text-sm text-slate-700 font-medium leading-relaxed">"{log.note}"</p>
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase w-full mb-1">Projects Tagged:</p>
                                    {log.projectIds.map(pid => (
                                      <div key={pid} className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600">
                                        <Briefcase size={10} className="mr-2 text-indigo-400" />
                                        {projects.find(p => p.id === pid)?.name}
                                      </div>
                                    ))}
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPortal;
