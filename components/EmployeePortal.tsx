
import React, { useState, useEffect } from 'react';
// Fix: PROJECTS is not exported from types.ts. Import it from constants.ts instead.
import { Employee, EmployeeStatus, LeaveRequest } from '../types';
import { PROJECTS } from '../constants';
import { Clock, Coffee, LogOut, Briefcase, CalendarCheck, Send } from 'lucide-react';

interface EmployeePortalProps {
  employee: Employee;
  onUpdateStatus: (status: EmployeeStatus, projectId?: string) => void;
  onRequestLeave: (request: Omit<LeaveRequest, 'id' | 'teamLeadStatus' | 'directorStatus' | 'finalStatus' | 'createdAt'>) => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ employee, onUpdateStatus, onRequestLeave }) => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            <p className="text-slate-500">{employee.code} • {employee.role}</p>
            <div className="mt-1 flex items-center text-sm text-slate-400">
              <Clock className="w-4 h-4 mr-1" />
              Shift: {employee.shift.start} - {employee.shift.end}
            </div>
          </div>
        </div>
        <div className="text-center md:text-right mt-6 md:mt-0">
          <p className="text-3xl font-mono font-bold text-indigo-600">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-slate-500 text-sm">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Attendance Controls
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {employee.status === EmployeeStatus.OFF ? (
              <button
                onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)}
                className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center"
              >
                <Clock className="mr-2" /> Clock In
              </button>
            ) : (
              <>
                <button
                  onClick={() => onUpdateStatus(EmployeeStatus.OFF)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center"
                >
                  <LogOut className="mr-2" /> Clock Out
                </button>
                {employee.status === EmployeeStatus.BREAK ? (
                  <button
                    onClick={() => onUpdateStatus(EmployeeStatus.ACTIVE)}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center"
                  >
                    <Clock className="mr-2" /> Back to Work
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(EmployeeStatus.BREAK)}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center"
                  >
                    <Coffee className="mr-2" /> Take Break
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
            Project Log
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 italic">Only showing projects assigned to you by management.</p>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                onUpdateStatus(employee.status, e.target.value);
              }}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {allowedProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.client}</option>
              ))}
            </select>
            <div className="pt-4 flex items-center justify-between text-sm text-slate-500 border-t border-slate-50 mt-2">
              <span>Time Accrued Today:</span>
              <span className="font-bold text-slate-900">{Math.floor(employee.totalMinutesWorkedToday / 60)}h {employee.totalMinutesWorkedToday % 60}m</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center mb-6">
          <CalendarCheck className="w-5 h-5 mr-2 text-rose-500" />
          Leave & Request Portal
        </h2>
        <form onSubmit={handleLeaveSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Start Date</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">End Date</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Reason for Leave</label>
            <textarea 
              placeholder="Provide details for approval workflow..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[100px] outline-none"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center"
          >
            <Send className="w-4 h-4 mr-2" /> Submit for Approval
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeePortal;
