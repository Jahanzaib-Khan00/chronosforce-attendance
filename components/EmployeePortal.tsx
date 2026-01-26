
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeStatus, LeaveRequest, AttendanceRecord, DailyActivityLog, UserRole } from '../types';
import { PROJECTS } from '../constants';
import { Clock, Coffee, LogOut, Briefcase, CalendarCheck, Send, History, ClipboardList, CheckSquare, Square, ShieldCheck, Activity } from 'lucide-react';

interface EmployeePortalProps {
  employee: Employee;
  onUpdateStatus: (status: EmployeeStatus, projectId?: string) => void;
  onRequestLeave: (request: Omit<LeaveRequest, 'id' | 'teamLeadStatus' | 'supervisorStatus' | 'directorStatus' | 'finalStatus' | 'createdAt'>) => void;
  onSaveActivityLog: (log: Omit<DailyActivityLog, 'id' | 'submittedAt' | 'employeeId' | 'date'>) => void;
  attendanceRecords: AttendanceRecord[];
  activityLogs: DailyActivityLog[];
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ 
  employee, 
  onUpdateStatus, 
  onRequestLeave, 
  onSaveActivityLog,
  attendanceRecords,
  activityLogs
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState(employee.activeProjectId);
  
  // Ledger Form State
  const [startTime, setStartTime] = useState(employee.shift.start);
  const [endTime, setEndTime] = useState(employee.shift.end);
  const [otHours, setOtHours] = useState(0);
  const [workedProjectIds, setWorkedProjectIds] = useState<string[]>([employee.activeProjectId]);
  const [workNote, setWorkNote] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Leave Form State
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');

  const isExempt = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR].includes(employee.role);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const allowedProjects = PROJECTS.filter(p => employee.allowedProjectIds.includes(p.id));

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveActivityLog({
      startTime,
      endTime,
      overtimeHours: otHours,
      projectIds: workedProjectIds,
      note: workNote,
    });
    setSubmitSuccess(true);
    setWorkNote('');
    setOtHours(0);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) return;
    onRequestLeave({
      employeeId: employee.id,
      employeeName: employee.name,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
    });
    setLeaveReason('');
    setLeaveStart('');
    setLeaveEnd('');
    alert("Leave request submitted for approval.");
  };

  const toggleProjectSelection = (pid: string) => {
    setWorkedProjectIds(prev => 
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'bg-emerald-500';
      case EmployeeStatus.BREAK: return 'bg-amber-500';
      case EmployeeStatus.OFF: return 'bg-slate-400';
      case EmployeeStatus.LEAVE: return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4">
      {/* Profile & Live Clock */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
              {employee.name.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${getStatusColor(employee.status)}`}></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
            <p className="text-slate-500">{employee.code} • {employee.role.replace('_', ' ')}</p>
            <div className="mt-1 flex items-center text-sm text-slate-400 font-medium">
              <Clock className="w-4 h-4 mr-1 text-slate-300" />
              {isExempt ? 'Executive Command Level' : `Shift Schedule: ${employee.shift.start} - ${employee.shift.end}`}
            </div>
          </div>
        </div>
        <div className="text-center md:text-right mt-6 md:mt-0">
          <p className="text-4xl font-mono font-black text-indigo-600 tracking-tighter">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Controls / Executive Summary */}
        <div className="lg:col-span-1 space-y-8">
          {isExempt ? (
            <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white flex flex-col space-y-6">
              <div className="flex items-center space-x-3">
                <ShieldCheck size={28} className="text-indigo-200" />
                <h2 className="text-xl font-bold">Executive View</h2>
              </div>
              <p className="text-sm text-indigo-100 leading-relaxed">
                As a member of the {employee.role.replace('_', ' ')} tier, you are exempt from daily clock-in sequences. 
                Your operations hub provides direct oversight of subordinate projects and staffing.
              </p>
              <div className="pt-4 border-t border-white/10 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-indigo-200">Total Projects</span>
                    <span className="text-xl font-black">{employee.allowedProjectIds.length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-indigo-200">System Permissions</span>
                    <span className="text-[10px] font-black uppercase bg-white/10 px-2 py-1 rounded">Universal</span>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                Real-time Access
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {employee.status === EmployeeStatus.OFF ? (
                  <button
                    onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center text-lg active:scale-95"
                  >
                    <Clock className="mr-2" /> Clock In
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => onUpdateStatus(EmployeeStatus.OFF)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                    >
                      <LogOut className="mr-2 w-5 h-5" /> Clock Out
                    </button>
                    {employee.status === EmployeeStatus.BREAK ? (
                      <button
                        onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)}
                        className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                      >
                        <Clock className="mr-2 w-5 h-5" /> Resume Duty
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateStatus(EmployeeStatus.BREAK)}
                        className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                      >
                        <Coffee className="mr-2 w-5 h-5" /> Take Break
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Active Engagement</label>
                <select
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value);
                    onUpdateStatus(employee.status, e.target.value);
                  }}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 text-sm"
                >
                  {allowedProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!isExempt && (
            <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white flex flex-col justify-between">
              <div>
                  <h3 className="font-black text-xs uppercase tracking-widest text-indigo-200 mb-1">Today's Accumulation</h3>
                  <p className="text-4xl font-black">{Math.floor(employee.totalMinutesWorkedToday / 60)}h {employee.totalMinutesWorkedToday % 60}m</p>
                  {employee.otEnabled && <p className="text-[10px] font-black uppercase text-indigo-300 mt-1">OT Authorization Enabled</p>}
              </div>
              <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-200 uppercase border-b border-white/10 pb-2">
                    <span>Project Utilization</span>
                    <span>Live Status</span>
                  </div>
                  {allowedProjects.slice(0, 3).map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                        <span className="text-sm font-bold opacity-80">{p.name}</span>
                        <div className={`w-2 h-2 rounded-full ${employee.activeProjectId === p.id ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`}></div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Manual Daily Activity Ledger / History Section */}
        <div className="lg:col-span-2 space-y-8">
          {!isExempt && (
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2 text-indigo-500" />
                  Daily Activity Ledger
                </h2>
                {submitSuccess && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 animate-bounce">Log Saved Successfully!</span>}
              </div>
              
              <form onSubmit={handleActivitySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Actual Started At</label>
                    <input type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Actual Finished At</label>
                    <input type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest block ${!employee.otEnabled ? 'text-slate-300' : 'text-slate-400'}`}>
                      Overtime Hours {!employee.otEnabled && '(Disabled)'}
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      disabled={!employee.otEnabled}
                      className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 ${!employee.otEnabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      value={otHours} 
                      onChange={e => setOtHours(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Projects Worked on Today</label>
                  <div className="flex flex-wrap gap-2">
                    {allowedProjects.map(p => (
                      <button 
                        key={p.id}
                        type="button"
                        onClick={() => toggleProjectSelection(p.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
                          workedProjectIds.includes(p.id) 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                            : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {workedProjectIds.includes(p.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex justify-between">
                    <span>Work Note (Brief)</span>
                    <span className={`${workNote.split(/[.!?]+/).length > 4 ? 'text-rose-500' : 'text-slate-300'}`}>
                      Max 3 sentences recommended
                    </span>
                  </label>
                  <textarea 
                    placeholder="Summarize your achievements for the day..."
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-sm font-medium leading-relaxed"
                    value={workNote}
                    onChange={e => setWorkNote(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-100 hover:bg-indigo-600 transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  <Send size={18} className="mr-2" /> Commit Activity Ledger
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
               <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <History className="w-5 h-5 mr-2 text-indigo-500" />
                Work Log History
              </h2>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar bg-slate-50/20">
              {activityLogs.length === 0 && attendanceRecords.length === 0 ? (
                <div className="py-16 text-center text-slate-300 italic text-sm space-y-2">
                  <Activity size={32} className="mx-auto opacity-20" />
                  <p>Your workspace timeline is empty. {isExempt ? 'Historical data will appear here.' : 'Start your day!'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map(log => (
                    <div key={log.id} className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 bg-indigo-50 rounded-bl-xl text-[8px] font-black text-indigo-600 uppercase tracking-widest">Manual Entry</div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-black text-slate-900 text-sm">{log.startTime} — {log.endTime}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{log.overtimeHours}h Overtime Claimed</p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1">
                          {log.projectIds.map(pid => (
                            <span key={pid} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded border border-indigo-100 uppercase">{PROJECTS.find(p => p.id === pid)?.name}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 font-medium bg-slate-50/50 p-4 rounded-xl italic">"{log.note}"</p>
                    </div>
                  ))}

                  {[...attendanceRecords].reverse().map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          record.type === 'CLOCK_IN' ? 'bg-emerald-100 text-emerald-600' :
                          record.type === 'CLOCK_OUT' ? 'bg-slate-200 text-slate-500' :
                          record.type === 'BREAK_START' ? 'bg-amber-100 text-amber-600' :
                          record.type === 'BREAK_END' ? 'bg-emerald-50 text-emerald-500' :
                          'bg-indigo-50 text-indigo-500'
                        }`}>
                          {record.type === 'CLOCK_IN' && <Clock size={18} />}
                          {record.type === 'CLOCK_OUT' && <LogOut size={18} />}
                          {record.type === 'BREAK_START' && <Coffee size={18} />}
                          {record.type === 'BREAK_END' && <Clock size={18} />}
                          {record.type === 'PROJECT_CHANGE' && <Briefcase size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {record.type.replace('_', ' ')}
                            {record.type === 'PROJECT_CHANGE' && ` to ${PROJECTS.find(p => p.id === record.projectId)?.name}`}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">System Timestamp</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Leave Request Portal */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 flex items-center mb-6">
          <CalendarCheck className="w-5 h-5 mr-2 text-rose-500" />
          Leave & Request Portal
        </h2>
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detailed Justification</label>
            <textarea 
              placeholder="Explain the reason for your absence..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 text-white font-black px-10 py-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Send className="w-4 h-4 mr-2" /> Dispatch Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeePortal;
