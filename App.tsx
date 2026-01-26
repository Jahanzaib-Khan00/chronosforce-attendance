
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, EmployeeStatus, AttendanceRecord, LeaveRequest, UserRole, Project, Message, DailyActivityLog } from './types';
import { MOCK_EMPLOYEES, PROJECTS } from './constants';
import EmployeePortal from './components/EmployeePortal';
import ManagerPortal from './components/ManagerPortal';
import AdminPortal from './components/AdminPortal';
import RequestManager from './components/RequestManager';
import ProjectManager from './components/ProjectManager';
import EmployeeManager from './components/EmployeeManager';
import CommunicationCenter from './components/CommunicationCenter';
import Login from './components/Login';
import { LayoutDashboard, Users, Clock, LogOut, ClipboardCheck, UserCog, FolderKanban, UserRoundSearch, MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [allProjects, setAllProjects] = useState<Project[]>(PROJECTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dailyActivityLogs, setDailyActivityLogs] = useState<DailyActivityLog[]>([]);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'PORTAL' | 'MANAGEMENT' | 'ADMIN' | 'REQUESTS' | 'PROJECTS' | 'EMPLOYEES'>('PORTAL');
  const [showMessageCenter, setShowMessageCenter] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAllEmployees(prev => prev.map(emp => {
        if (emp.status === EmployeeStatus.ACTIVE) {
          const now = new Date();
          const shiftEndStr = emp.shift.end;
          const [h, m] = shiftEndStr.split(':').map(Number);
          const shiftEndTime = new Date();
          shiftEndTime.setHours(h, m, 0, 0);

          const isOvertime = now > shiftEndTime;
          if (!isOvertime || emp.otEnabled) {
            return { ...emp, totalMinutesWorkedToday: emp.totalMinutesWorkedToday + 1 };
          }
        }
        return emp;
      }));
    }, 60000); 
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = (status: EmployeeStatus, projectId?: string) => {
    if (!currentUser) return;
    const timestamp = new Date().toISOString();
    let recordType: AttendanceRecord['type'] = 'PROJECT_CHANGE';

    if (status === EmployeeStatus.ACTIVE && currentUser.status === EmployeeStatus.OFF) recordType = 'CLOCK_IN';
    else if (status === EmployeeStatus.OFF) recordType = 'CLOCK_OUT';
    else if (status === EmployeeStatus.BREAK) recordType = 'BREAK_START';
    else if (status === EmployeeStatus.ACTIVE && currentUser.status === EmployeeStatus.BREAK) recordType = 'BREAK_END';

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: currentUser.id,
      type: recordType,
      timestamp,
      projectId: projectId || currentUser.activeProjectId
    };

    setAttendanceRecords(prev => [...prev, newRecord]);
    setAllEmployees(prev => prev.map(emp => {
      if (emp.id === currentUser.id) {
        const updated = { ...emp, status, activeProjectId: projectId || emp.activeProjectId, lastActionTime: timestamp };
        setCurrentUser(updated);
        return updated;
      }
      return emp;
    }));
  };

  const handleDeleteEmployee = (empId: string) => {
    // Root Security Guardrail: Jahanzaib Khan cannot be deleted.
    if (empId === 'dev-root') {
      alert("SYSTEM PROTECTION: The Root Administrator account (Jahanzaib Khan) is part of the core infrastructure and cannot be removed.");
      return;
    }
    
    // One-click deletion as requested (removed confirm)
    setAllEmployees(prev => prev.filter(e => e.id !== empId));
  };

  const handleResetWorkforce = () => {
    if (window.confirm("Emergency Procedure: This will restore the default workforce and may overwrite custom accounts. Proceed?")) {
      setAllEmployees(MOCK_EMPLOYEES);
      alert("System workforce restored to defaults.");
    }
  };

  const handleReadChat = (chatId: string) => {
    setLastReadTimestamps(prev => ({ ...prev, [chatId]: new Date().toISOString() }));
  };

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter(m => {
      if (m.senderId === currentUser.id) return false;
      if (m.receiverId === currentUser.id) {
        const lastRead = lastReadTimestamps[m.senderId] || '1970-01-01T00:00:00Z';
        return m.timestamp > lastRead;
      }
      if (!m.receiverId) {
        const lastRead = lastReadTimestamps['GLOBAL'] || '1970-01-01T00:00:00Z';
        return m.timestamp > lastRead;
      }
      return false;
    }).length;
  }, [messages, currentUser, lastReadTimestamps]);

  if (!currentUser) return <Login onLogin={setCurrentUser} employees={allEmployees} />;

  const hasMgmtAccess = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR, UserRole.SUPERVISOR, UserRole.TEAM_LEAD].includes(currentUser.role);
  const isHighLevel = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR].includes(currentUser.role);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-20 md:w-64 bg-white border-r hidden sm:flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Clock className="text-white w-6 h-6" /></div>
          <span className="font-bold text-xl hidden md:block tracking-tighter">ChronosForce</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard />} label="My Portal" active={activeTab === 'PORTAL'} onClick={() => setActiveTab('PORTAL')} />
          {hasMgmtAccess && (
            <>
              <NavItem icon={<Users />} label="Operations" active={activeTab === 'MANAGEMENT'} onClick={() => setActiveTab('MANAGEMENT')} />
              <NavItem icon={<ClipboardCheck />} label="Approvals" active={activeTab === 'REQUESTS'} onClick={() => setActiveTab('REQUESTS')} />
            </>
          )}
          {isHighLevel && (
            <>
              <NavItem icon={<FolderKanban />} label="Projects" active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')} />
              <NavItem icon={<UserRoundSearch />} label="Staffing" active={activeTab === 'EMPLOYEES'} onClick={() => setActiveTab('EMPLOYEES')} />
            </>
          )}
          {currentUser.role === UserRole.ADMIN && <NavItem icon={<UserCog />} label="Sys Admin" active={activeTab === 'ADMIN'} onClick={() => setActiveTab('ADMIN')} />}
          <div className="pt-6 mt-6 border-t border-slate-50">
             <NavItem icon={<MessageCircle />} label="Messages" active={showMessageCenter} onClick={() => setShowMessageCenter(true)} badge={unreadCount} />
          </div>
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={() => setCurrentUser(null)} className="w-full p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-center space-x-3 hover:bg-slate-800 transition-colors">
            <LogOut size={18} />
            <span className="hidden md:block font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">{activeTab.toLowerCase()} Hub</h1>
            <div className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-indigo-100">{currentUser.role.replace('_', ' ')}</div>
          </header>

          {activeTab === 'PORTAL' && (
            <EmployeePortal 
              employee={currentUser} 
              onUpdateStatus={handleUpdateStatus} 
              onRequestLeave={(req) => setLeaveRequests(prev => [{...req, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), finalStatus: 'PENDING', teamLeadStatus: 'PENDING', supervisorStatus: 'PENDING', directorStatus: 'PENDING'}, ...prev])} 
              onSaveActivityLog={(log) => setDailyActivityLogs(prev => [{...log, id: Math.random().toString(36).substr(2, 9), employeeId: currentUser.id, date: new Date().toISOString().split('T')[0], submittedAt: new Date().toISOString()}, ...prev])}
              attendanceRecords={attendanceRecords.filter(r => r.employeeId === currentUser.id)} 
              activityLogs={dailyActivityLogs.filter(l => l.employeeId === currentUser.id)}
            />
          )}
          {activeTab === 'MANAGEMENT' && <ManagerPortal employees={allEmployees} projects={allProjects} currentUser={currentUser} attendanceRecords={attendanceRecords} dailyActivityLogs={dailyActivityLogs} />}
          {activeTab === 'PROJECTS' && <ProjectManager projects={allProjects} employees={allEmployees} onAddProject={(p) => setAllProjects(prev => [...prev, p])} onUpdateProject={(up) => setAllProjects(prev => prev.map(p => p.id === up.id ? up : p))} onDeleteProject={(id) => setAllProjects(prev => prev.filter(p => p.id !== id))} currentUser={currentUser} />}
          {activeTab === 'EMPLOYEES' && <EmployeeManager employees={allEmployees} projects={allProjects} onAddEmployee={(e) => setAllEmployees(prev => [...prev, e])} onUpdateEmployee={(e) => setAllEmployees(prev => prev.map(ex => ex.id === e.id ? e : ex))} onDeleteEmployee={handleDeleteEmployee} currentUser={currentUser} />}
          {activeTab === 'REQUESTS' && <RequestManager requests={leaveRequests} userRole={currentUser.role} onApprove={(id, role) => setLeaveRequests(prev => prev.map(r => r.id === id ? {...r, finalStatus: 'APPROVED'} : r))} onReject={(id) => setLeaveRequests(prev => prev.map(r => r.id === id ? {...r, finalStatus: 'REJECTED'} : r))} />}
          {activeTab === 'ADMIN' && <AdminPortal onAddEmployee={(e) => setAllEmployees(prev => [...prev, e])} onUpdateEmployee={(e) => setAllEmployees(prev => prev.map(ex => ex.id === e.id ? e : ex))} employees={allEmployees} projects={allProjects} onResetWorkforce={handleResetWorkforce} />}
        </div>
      </main>

      {showMessageCenter && (
        <CommunicationCenter 
          messages={messages} 
          currentUser={currentUser} 
          allEmployees={allEmployees} 
          lastReadTimestamps={lastReadTimestamps}
          onSendMessage={(m) => setMessages(prev => [...prev, {...m, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString()}])} 
          onReadChat={handleReadChat}
          onClose={() => setShowMessageCenter(false)} 
        />
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all relative ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}>
    <div className="flex items-center space-x-3">
      {React.cloneElement(icon as React.ReactElement, { size: 22 })}
      <span className="font-bold text-sm hidden md:block whitespace-nowrap">{label}</span>
    </div>
    {badge && badge > 0 ? (
      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black animate-in zoom-in">
        {badge}
      </span>
    ) : null}
  </button>
);

export default App;
