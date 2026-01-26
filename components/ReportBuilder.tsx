
import React, { useState, useMemo } from 'react';
import { Employee, Project, UserRole, AttendanceRecord, EmployeeStatus } from '../types';
import { PROJECTS } from '../constants';
import { Calendar, Users, X, Download, Search, CheckSquare, Square, FileText } from 'lucide-react';

interface ReportBuilderProps {
  employees: Employee[];
  projects: Project[];
  attendanceRecords: AttendanceRecord[];
  onClose: () => void;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ 
  employees, 
  projects, 
  attendanceRecords, 
  onClose 
}) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>(employees.map(e => e.id));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const toggleAll = () => {
    if (selectedIds.length === employees.length) setSelectedIds([]);
    else setSelectedIds(employees.map(e => e.id));
  };

  const toggleRole = (role: UserRole) => {
    const roleIds = employees.filter(e => e.role === role).map(e => e.id);
    const allInRoleSelected = roleIds.every(id => selectedIds.includes(id));
    
    if (allInRoleSelected) {
      setSelectedIds(prev => prev.filter(id => !roleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...roleIds])));
    }
  };

  const generateCSV = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateRange: string[] = [];
    
    let current = new Date(start);
    while (current <= end) {
      dateRange.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    const headers = [
      "Date", "Employee Name", "Employee ID", "Role", "Manager/Supervisor",
      "Projects Worked", "Shift", "First In", "Last Out", 
      "Work Duration (Hrs)", "Break Duration (Mins)", "OT Authorization"
    ].join(",");

    const rows: string[] = [];

    selectedIds.forEach(empId => {
      const emp = employees.find(e => e.id === empId);
      if (!emp) return;

      const supervisor = employees.find(s => s.id === emp.supervisorId)?.name || "N/A";

      dateRange.forEach(dateStr => {
        const dayRecords = attendanceRecords.filter(r => {
          const rDate = new Date(r.timestamp).toISOString().split('T')[0];
          return r.employeeId === empId && rDate === dateStr;
        });

        if (dayRecords.length === 0) return;

        const firstIn = dayRecords.find(r => r.type === 'CLOCK_IN')?.timestamp;
        const lastOut = [...dayRecords].reverse().find(r => r.type === 'CLOCK_OUT')?.timestamp;
        
        const workedProjectIds = new Set(dayRecords.map(r => r.projectId).filter(Boolean));
        const workedProjectNames = Array.from(workedProjectIds)
          .map(pid => projects.find(p => p.id === pid)?.name)
          .filter(Boolean)
          .join(" | ");

        let totalWorkMs = 0;
        let lastIn: number | null = null;
        let breakMs = 0;
        let breakStart: number | null = null;

        dayRecords.forEach(r => {
          const ts = new Date(r.timestamp).getTime();
          if (r.type === 'CLOCK_IN') lastIn = ts;
          if (r.type === 'CLOCK_OUT' && lastIn) { totalWorkMs += (ts - lastIn); lastIn = null; }
          if (r.type === 'BREAK_START') breakStart = ts;
          if (r.type === 'BREAK_END' && breakStart) { breakMs += (ts - breakStart); breakStart = null; }
        });

        rows.push([
          `"${dateStr}"`,
          `"${emp.name}"`,
          `"${emp.code}"`,
          `"${emp.role}"`,
          `"${supervisor}"`,
          `"${workedProjectNames}"`,
          `"${emp.shift.start}-${emp.shift.end}"`,
          firstIn ? `"${new Date(firstIn).toLocaleTimeString()}"` : "N/A",
          lastOut ? `"${new Date(lastOut).toLocaleTimeString()}"` : "N/A",
          `"${(totalWorkMs / 3600000).toFixed(2)}"`,
          `"${Math.floor(breakMs / 60000)}"`,
          emp.otEnabled ? "UNIVERSAL_OT" : "NONE"
        ].join(","));
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ChronosForce_Intelligence_Audit_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 text-white">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Report Builder</h2>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Aggregate workspace metrics & audit trails</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-10 custom-scrollbar">
          
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600 mb-2">
              <Calendar size={20} />
              <h3 className="font-black text-xs uppercase tracking-widest">1. Define Temporal Range</h3>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Start Date</label>
                <input 
                  type="date" 
                  className="w-full bg-transparent border-none outline-none font-bold text-slate-800"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">End Date</label>
                <input 
                  type="date" 
                  className="w-full bg-transparent border-none outline-none font-bold text-slate-800"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
               <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                 The builder will scan the selected period for all clock events and project switches. Dates with zero activity will be omitted.
               </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Users size={20} />
                <h3 className="font-black text-xs uppercase tracking-widest">2. Select Personnel</h3>
              </div>
              <div className="flex space-x-2">
                 <button onClick={toggleAll} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">
                    {selectedIds.length === employees.length ? 'Deselect All' : 'Select All'}
                 </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {[UserRole.TEAM_LEAD, UserRole.EMPLOYEE].map(role => (
                <button 
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${
                    employees.filter(e => e.role === role).every(e => selectedIds.includes(e.id))
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  All {role.replace('_', ' ')}s
                </button>
              ))}
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search staff by name or ID..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredEmployees.map(emp => (
                <button 
                  key={emp.id}
                  onClick={() => {
                    setSelectedIds(prev => prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id]);
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedIds.includes(emp.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${selectedIds.includes(emp.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{emp.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{emp.code}</p>
                    </div>
                  </div>
                  {selectedIds.includes(emp.id) ? <CheckSquare className="text-indigo-600" size={18} /> : <Square className="text-slate-200" size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selection Count</span>
              <span className="text-xl font-black text-slate-900">{selectedIds.length} <span className="text-sm text-slate-400 font-bold">Personnel</span></span>
            </div>
            <div className="w-[1px] h-10 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Range</span>
              <span className="text-sm font-black text-indigo-600 uppercase">{startDate} — {endDate}</span>
            </div>
          </div>

          <div className="flex space-x-4">
             <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all">Cancel</button>
             <button 
              onClick={generateCSV}
              disabled={selectedIds.length === 0}
              className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
             >
               <Download size={20} className="mr-2" /> Compile & Export (.csv)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
