
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, EmployeeStatus, LeaveRequest, AttendanceRecord, DailyActivityLog, UserRole } from '../types';
import { PROJECTS } from '../constants';
import { Clock, Coffee, LogOut, Briefcase, CalendarCheck, Send, History, ClipboardList, CheckSquare, Square, Activity, AlertCircle } from 'lucide-react';
import { getNJTime, formatTime12h } from '../App';

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
  const [currentTime, setCurrentTime] = useState(getNJTime());
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
    const timer = setInterval(() => setCurrentTime(getNJTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const allowedProjects = PROJECTS.filter(p => employee.allowedProjectIds.includes(p.id));

  const isClockedIn = useMemo(() => {
    const njToday = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
    return attendanceRecords.some(r => {
      const rNJ = new Date(r.timestamp).toLocaleDateString("en-US", { timeZone: "America/New_York" });
      return r.type === 'CLOCK_IN' && rNJ === njToday;
    });
  }, [attendanceRecords]);

  const showClockInReminder = useMemo(() => {
    if (isExempt || employee.status !== EmployeeStatus.OFF || isClockedIn) return false;
    
    // Check if shift has started in NJ
    const nowNJ = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    const njDate = new Date(nowNJ);
    const [sh, sm] = employee.shift.start.split(':').map(Number);
    const shiftStartTime = new Date(njDate);
    shiftStartTime.setHours(sh, sm, 0, 0);
    
    return njDate > shiftStartTime;
  }, [employee, isExempt, isClockedIn]);

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
      {/* Clock-in Reminder */}
      {showClockInReminder && (
        <div className="bg-amber-100 border border-amber-200 p-6 rounded-3xl flex items-center justify-between shadow-sm animate-in zoom-in-95">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-black text-amber-900 leading-tight">Clock-in Reminder</h4>
                <p className="text-sm text-amber-800 font-medium">Your shift started at {employee.shift.start}. Please remember to clock in!</p>
              </div>
           </div>
           <button onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)} className="bg-amber-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all">
             Clock In Now
           </button>
        </div>
      )}

      {/* Profile & Live Clock */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-br-full -z-10 opacity-30"></div>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 font-bold text-3xl shadow-inner">
              {employee.name.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${getStatusColor(employee.status)} shadow-sm`}></div>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{employee.name}</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{employee.code} • {employee.role.replace('_', ' ')}</p>
            <div className="mt-2 flex items-center text-xs text-slate-400 font-black uppercase tracking-tighter">
              <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              {isExempt ? 'Executive' : `Shift: ${employee.shift.start} - ${employee.shift.end}`}
            </div>
          </div>
        </div>
        <div className="text-center md:text-right mt-6 md:mt-0">
          <p className="text-4xl font-mono font-black text-indigo-600 tracking-tighter drop-shadow-sm">
            {formatTime12h(currentTime)}
          </p>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            New Jersey System Time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-500" />
              Live Terminal
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {employee.status === EmployeeStatus.OFF ? (
                <button
                  onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center text-lg active:scale-95"
                >
                  <Clock className="mr-2" /> Start Shift
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => onUpdateStatus(EmployeeStatus.OFF)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                  >
                    <LogOut className="mr-2 w-5 h-5 text-slate-400" /> End Shift
                  </button>
                  {employee.status === EmployeeStatus.BREAK ? (
                    <button
                      onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)}
                      className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                    >
                      <Clock className="mr-2 w-5 h-5" /> Resume Work
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(EmployeeStatus.BREAK)}
                      className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                    >
                      <Coffee className="mr-2 w-5 h-5 text-amber-500" /> Start Break
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t border-slate-50">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Active Project</label>
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

          {!isExempt && isClockedIn && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between h-[340px]">
              <div>
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-1">Daily Yield (Clocked Time)</h3>
                  <p className="text-4xl font-black tracking-tighter">
                    {Math.floor(employee.totalMinutesWorkedToday / 60)}h {employee.totalMinutesWorkedToday % 60}m
                  </p>
                  {employee.otEnabled && <p className="text-[9px] font-black uppercase text-emerald-400 mt-2 bg-emerald-400/10 inline-block px-2 py-1 rounded">OT Authorized</p>}
              </div>
              <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase border-b border-white/5 pb-2">
                    <span>Deployments</span>
                    <span>Activity</span>
                  </div>
                  {allowedProjects.slice(0, 3).map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-300">{p.name}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${employee.activeProjectId === p.id ? 'bg-indigo-400 animate-pulse' : 'bg-slate-800'}`}></div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          {!isExempt && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-md border border-slate-100 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-slate-800 flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2 text-indigo-500" />
                  Yield Ledger
                </h2>
                {submitSuccess && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 animate-bounce">Report Dispatched!</span>}
              </div>
              
              <form onSubmit={handleActivitySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Start Time</label>
                    <input type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Finish Time</label>
                    <input type="time" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest block ${!employee.otEnabled ? 'text-slate-300' : 'text-slate-400'}`}>
                      OT Hours {!employee.otEnabled && '(Locked)'}
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.5" 
                      disabled={!employee.otEnabled}
                      className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 ${!employee.otEnabled ? 'opacity-30' : ''}`} 
                      value={otHours} 
                      onChange={e => setOtHours(Number(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Project Allocation</label>
                  <div className="flex flex-wrap gap-2">
                    {allowedProjects.map(p => (
                      <button 
                        key={p.id}
                        type="button"
                        onClick={() => toggleProjectSelection(p.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase transition-all flex items-center space-x-2 ${
                          workedProjectIds.includes(p.id) 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {workedProjectIds.includes(p.id) ? <CheckSquare size={12} /> : <Square size={12} />}
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Work Summary</label>
                  <textarea 
                    placeholder="Document milestones for today..."
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-sm font-medium"
                    value={workNote}
                    onChange={e => setWorkNote(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  <Send size={18} className="mr-2" /> Dispatch Ledger Entry
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <h2 className="text-lg font-black text-slate-800 flex items-center">
                <History className="w-5 h-5 mr-2 text-indigo-500" />
                Live Work Feed (Fixed NJ)
              </h2>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-6 custom-scrollbar">
              {activityLogs.length === 0 && attendanceRecords.length === 0 ? (
                <div className="py-20 text-center text-slate-300 space-y-4">
                  <Activity size={48} className="mx-auto opacity-10" />
                  <p className="font-black uppercase tracking-widest text-[10px]">No historical data found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...attendanceRecords].reverse().map(record => (
                    <div key={record.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                          record.type === 'CLOCK_IN' ? 'bg-emerald-500 text-white' :
                          record.type === 'CLOCK_OUT' ? 'bg-slate-800 text-white' :
                          record.type === 'BREAK_START' ? 'bg-amber-400 text-white' :
                          'bg-indigo-500 text-white'
                        }`}>
                          {record.type === 'CLOCK_IN' && <Clock size={18} />}
                          {record.type === 'CLOCK_OUT' && <LogOut size={18} />}
                          {record.type === 'BREAK_START' && <Coffee size={18} />}
                          {record.type === 'BREAK_END' && <Clock size={18} />}
                          {record.type === 'PROJECT_CHANGE' && <Briefcase size={18} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-[11px] uppercase tracking-tight">
                            {record.type.replace('_', ' ')}
                            {record.type === 'PROJECT_CHANGE' && ` → ${PROJECTS.find(p => p.id === record.projectId)?.name}`}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">NJ System Time</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{formatTime12h(record.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
