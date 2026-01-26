
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeStatus, LeaveRequest, AttendanceRecord } from '../types';
import { PROJECTS } from '../constants';
import { Clock, Coffee, LogOut, Briefcase, CalendarCheck, Send, ListChecks, History } from 'lucide-react';

interface EmployeePortalProps {
  employee: Employee;
  onUpdateStatus: (status: EmployeeStatus, projectId?: string) => void;
  onRequestLeave: (request: Omit<LeaveRequest, 'id' | 'teamLeadStatus' | 'supervisorStatus' | 'directorStatus' | 'finalStatus' | 'createdAt'>) => void;
  attendanceRecords: AttendanceRecord[];
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ employee, onUpdateStatus, onRequestLeave, attendanceRecords }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState(employee.activeProjectId);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const allowedProjects = PROJECTS.filter(p => employee.allowedProjectIds.includes(p.id));

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

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'bg-emerald-500';
      case EmployeeStatus.BREAK: return 'bg-amber-500';
      case EmployeeStatus.OFF: return 'bg-slate-400';
      case EmployeeStatus.LEAVE: return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const formatTimestamp = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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
              Shift Schedule: {employee.shift.start} - {employee.shift.end}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Attendance Controls
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {employee.status === EmployeeStatus.OFF ? (
              <button
                onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)}
                className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center text-lg active:scale-95"
              >
                <Clock className="mr-2" /> Clock In
              </button>
            ) : (
              <>
                <button
                  onClick={() => onUpdateStatus(EmployeeStatus.OFF)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                >
                  <LogOut className="mr-2 w-5 h-5" /> Clock Out
                </button>
                {employee.status === EmployeeStatus.BREAK ? (
                  <button
                    onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                  >
                    <Clock className="mr-2 w-5 h-5" /> Resume Work
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(EmployeeStatus.BREAK)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center active:scale-95"
                  >
                    <Coffee className="mr-2 w-5 h-5" /> Take Break
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
            <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
            Current Deployment
          </h2>
          <div className="flex-1 flex flex-col justify-between">
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                onUpdateStatus(employee.status, e.target.value);
              }}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
            >
              {allowedProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
              ))}
            </select>
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency Counter</span>
              <span className="font-black text-indigo-600 text-2xl">{Math.floor(employee.totalMinutesWorkedToday / 60)}h {employee.totalMinutesWorkedToday % 60}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Log */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <History className="w-5 h-5 mr-2 text-indigo-500" />
            Activity History (Today)
          </h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chronological Trail</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-4 custom-scrollbar">
          {attendanceRecords.length === 0 ? (
            <div className="py-10 text-center text-slate-300 italic text-sm">No activity recorded for today yet.</div>
          ) : (
            <div className="space-y-3">
              {[...attendanceRecords].reverse().map(record => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all">
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
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{record.type === 'CLOCK_IN' ? 'Shift Commenced' : 'System Event'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{formatTimestamp(record.timestamp)}</p>
                    <p className="text-[9px] text-slate-400 font-bold">STAMP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
