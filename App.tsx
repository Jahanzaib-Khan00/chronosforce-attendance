
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import PasswordChange from './components/PasswordChange';
import { LayoutDashboard, Users, Clock, LogOut, ClipboardCheck, UserCog, FolderKanban, UserRoundSearch, MessageCircle, Activity, FileText, CheckCircle2, XCircle, Cloud, RefreshCw } from 'lucide-react';

const STORAGE_KEYS = {
  EMPLOYEES: 'cf_employees_v3',
  PROJECTS: 'cf_projects_v3',
  RECORDS: 'cf_records_v3',
  REQUESTS: 'cf_requests_v3',
  MESSAGES: 'cf_messages_v3',
  LOGS: 'cf_logs_v3',
  SYNC_ID: 'cf_sync_id_v3',
  LAST_READ: 'cf_last_read_v3'
};

const DEFAULT_PASSWORD = 'password123';
const SYNC_INTERVAL = 10000;

export const getNJTime = () => new Date();

export const formatTime12h = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("en-US", { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true,
    timeZone: "America/New_York" 
  });
};

const App: React.FC = () => {
  const [syncId, setSyncId] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.SYNC_ID) || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'PORTAL' | 'MANAGEMENT' | 'ADMIN' | 'REQUESTS' | 'PROJECTS' | 'EMPLOYEES'>('PORTAL');
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [showClockInPrompt, setShowClockInPrompt] = useState(false);

  const [allEmployees, setAllEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : MOCK_EMPLOYEES;
  });

  const [allProjects, setAllProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : PROJECTS;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyActivityLogs, setDailyActivityLogs] = useState<DailyActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_READ);
    return saved ? JSON.parse(saved) : {};
  });

  const syncInProgress = useRef(false);

  const fetchFromCloud = async (id: string) => {
    if (syncInProgress.current || !id) return;
    try {
      syncInProgress.current = true;
      setIsSyncing(true);
      const res = await fetch(`https://kvdb.io/A2WkXv7U8rKj1L9p5hE3z/${id}`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData) {
          if (cloudData.employees) setAllEmployees(cloudData.employees);
          if (cloudData.projects) setAllProjects(cloudData.projects);
          if (cloudData.records) setAttendanceRecords(cloudData.records);
          if (cloudData.requests) setLeaveRequests(cloudData.requests);
          if (cloudData.messages) setMessages(cloudData.messages);
          if (cloudData.logs) setDailyActivityLogs(cloudData.logs);
        }
      }
    } catch (e) {
      console.error("Cloud Sync Error (Fetch):", e);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  };

  const pushToCloud = async (id: string) => {
    if (!id) return;
    try {
      setIsSyncing(true);
      const data = {
        employees: allEmployees,
        projects: allProjects,
        records: attendanceRecords,
        requests: leaveRequests,
        messages: messages,
        logs: dailyActivityLogs,
        updatedAt: new Date().toISOString()
      };
      await fetch(`https://kvdb.io/A2WkXv7U8rKj1L9p5hE3z/${id}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error("Cloud Sync Error (Push):", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!syncId) return;
    fetchFromCloud(syncId);
    const interval = setInterval(() => fetchFromCloud(syncId), SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [syncId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (syncId) pushToCloud(syncId);
    }, 2000);
    return () => clearTimeout(timer);
  }, [allEmployees, allProjects, attendanceRecords, leaveRequests, messages, dailyActivityLogs, syncId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(allEmployees));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(allProjects));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(attendanceRecords));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(leaveRequests));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(dailyActivityLogs));
    localStorage.setItem(STORAGE_KEYS.SYNC_ID, syncId);
  }, [allEmployees, allProjects, attendanceRecords, leaveRequests, messages, dailyActivityLogs, syncId]);

  const handleUpdateStatus = (status: EmployeeStatus, projectId?: string) => {
    if (!currentUser) return;
    const ts = new Date().toISOString();
    let type: AttendanceRecord['type'] = 'PROJECT_CHANGE';
    if (status === EmployeeStatus.ACTIVE && currentUser.status === EmployeeStatus.OFF) type = 'CLOCK_IN';
    else if (status === EmployeeStatus.OFF) type = 'CLOCK_OUT';
    else if (status === EmployeeStatus.BREAK) type = 'BREAK_START';
    else if (status === EmployeeStatus.ACTIVE && currentUser.status === EmployeeStatus.BREAK) type = 'BREAK_END';

    const record: AttendanceRecord = { 
      id: Math.random().toString(36).substr(2, 9), 
      employeeId: currentUser.id, 
      type, 
      timestamp: ts, 
      projectId: projectId || currentUser.activeProjectId 
    };
    
    setAttendanceRecords(prev => [...prev, record]);
    setAllEmployees(prev => prev.map(emp => {
      if (emp.id === currentUser.id) {
        const up = { ...emp, status, activeProjectId: projectId || emp.activeProjectId, lastActionTime: ts };
        setCurrentUser(up);
        return up;
      }
      return emp;
    }));
  };

  const handleLogin = (user: Employee) => {
    const njToday = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
    const todaysRecords = attendanceRecords.filter(r => {
      const rNJ = new Date(r.timestamp).toLocaleDateString("en-US", { timeZone: "America/New_York" });
      return r.employeeId === user.id && rNJ === njToday;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const lastRecord = todaysRecords.length > 0 ? todaysRecords[todaysRecords.length - 1] : null;
    let synchronizedUser = { ...user };
    
    if (!lastRecord || lastRecord.type === 'CLOCK_OUT') {
      synchronizedUser.status = EmployeeStatus.OFF;
      setShowClockInPrompt(true);
    } else {
      if (lastRecord.type === 'CLOCK_IN' || lastRecord.type === 'BREAK_END' || lastRecord.type === 'PROJECT_CHANGE') {
        synchronizedUser.status = EmployeeStatus.ACTIVE;
      } else if (lastRecord.type === 'BREAK_START') {
        synchronizedUser.status = EmployeeStatus.BREAK;
      }
      synchronizedUser.activeProjectId = lastRecord.projectId || user.activeProjectId;
    }
    
    setAllEmployees(prev => prev.map(e => e.id === user.id ? synchronizedUser : e));
    setCurrentUser(synchronizedUser);
  };

  const handleLogout = async () => {
    if (currentUser && (currentUser.status === EmployeeStatus.ACTIVE || currentUser.status === EmployeeStatus.BREAK)) {
      handleUpdateStatus(EmployeeStatus.OFF);
    }
    if (syncId) await pushToCloud(syncId);
    setCurrentUser(null);
    setShowClockInPrompt(false);
  };

  const isSuperior = (managerId: string, employeeId: string): boolean => {
    if (managerId === 'dev-root') return true; 
    const employee = allEmployees.find(e => e.id === employeeId);
    if (!employee || !employee.supervisorId) return false;
    if (employee.supervisorId === managerId) return true;
    return isSuperior(managerId, employee.supervisorId);
  };

  const hasMgmtAccess = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR, UserRole.SUPERVISOR, UserRole.TEAM_LEAD].includes(currentUser?.role || UserRole.EMPLOYEE);

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        employees={allEmployees} 
        syncId={syncId}
        onSetSyncId={(id) => {
          setSyncId(id);
          fetchFromCloud(id);
        }}
        isSyncing={isSyncing}
      />
    );
  }

  if (currentUser.password === DEFAULT_PASSWORD) {
    return <PasswordChange user={currentUser} onUpdatePassword={(p) => {
      setAllEmployees(prev => prev.map(e => e.id === currentUser.id ? { ...e, password: p } : e));
      setCurrentUser({ ...currentUser, password: p });
    }} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-20 md:w-64 bg-white border-r hidden sm:flex flex-col fixed h-full z-20 shadow-xl shadow-slate-200/50">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100"><Clock className="text-white w-6 h-6" /></div>
          <span className="font-bold text-xl hidden md:block tracking-tighter text-slate-900">ChronosForce</span>
        </div>
        
        <div className="px-6 mb-4 flex items-center space-x-2">
           <Cloud size={14} className={syncId ? (isSyncing ? 'text-amber-500 animate-pulse' : 'text-emerald-500') : 'text-slate-300'} />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
             {syncId ? 'Cloud Active' : 'Offline Mode'}
           </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2 flex flex-col">
          <NavItem icon={<LayoutDashboard />} label="My Portal" active={activeTab === 'PORTAL'} onClick={() => setActiveTab('PORTAL')} />
          {hasMgmtAccess && <NavItem icon={<Activity />} label="Live" active={activeTab === 'MANAGEMENT'} onClick={() => setActiveTab('MANAGEMENT')} />}
          {[UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR, UserRole.SUPERVISOR, UserRole.TEAM_LEAD].includes(currentUser.role) && (
            <>
              <NavItem icon={<FolderKanban />} label="Projects" active={activeTab === 'PROJECTS'} onClick={() => setActiveTab('PROJECTS')} />
              <NavItem icon={<UserRoundSearch />} label="Manage Staff" active={activeTab === 'EMPLOYEES'} onClick={() => setActiveTab('EMPLOYEES')} />
            </>
          )}
          {currentUser.role === UserRole.ADMIN && <NavItem icon={<UserCog />} label="Admin Tools" active={activeTab === 'ADMIN'} onClick={() => setActiveTab('ADMIN')} />}
          
          <div className="mt-auto space-y-2 pb-6 pt-6 border-t border-slate-100">
             {hasMgmtAccess && <NavItem icon={<FileText />} label="Requests" active={activeTab === 'REQUESTS'} onClick={() => setActiveTab('REQUESTS')} />}
             <NavItem icon={<MessageCircle />} label="Messages" active={showMessageCenter} onClick={() => setShowMessageCenter(true)} badge={messages.filter(m => m.receiverId === currentUser.id && m.timestamp > (lastReadTimestamps[m.senderId] || '0')).length} />
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all">
            <LogOut size={18} />
            <span className="hidden md:block font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {activeTab === 'MANAGEMENT' ? 'Live' : activeTab === 'REQUESTS' ? 'Requests' : activeTab === 'EMPLOYEES' ? 'Staffing' : activeTab === 'ADMIN' ? 'Admin Tools' : activeTab.toLowerCase()} Hub
            </h1>
            <div className="flex items-center space-x-4">
               {syncId && (
                 <button 
                  onClick={() => fetchFromCloud(syncId)} 
                  className={`p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all ${isSyncing ? 'animate-spin' : ''}`}
                  title="Force Sync"
                 >
                  <RefreshCw size={16} />
                 </button>
               )}
               <div className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-indigo-100">{currentUser.role.replace('_', ' ')}</div>
            </div>
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
          {activeTab === 'EMPLOYEES' && <EmployeeManager employees={allEmployees} projects={allProjects} onAddEmployee={(e) => setAllEmployees(prev => [...prev, e])} onUpdateEmployee={(e) => setAllEmployees(prev => prev.map(ex => ex.id === e.id ? e : ex))} onDeleteEmployee={(id) => setAllEmployees(prev => prev.filter(e => e.id !== id))} currentUser={currentUser} />}
          {activeTab === 'REQUESTS' && <RequestManager requests={leaveRequests.filter(req => isSuperior(currentUser.id, req.employeeId))} userRole={currentUser.role} onApprove={(id, role) => setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, finalStatus: role === UserRole.DIRECTOR ? 'APPROVED' : r.finalStatus } : r))} onReject={(id) => setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, finalStatus: 'REJECTED' } : r))} onDeleteRequest={(id) => setLeaveRequests(prev => prev.filter(r => r.id !== id))} />}
          {activeTab === 'ADMIN' && <AdminPortal employees={allEmployees} projects={allProjects} onAddEmployee={(e) => setAllEmployees(prev => [...prev, e])} onUpdateEmployee={(e) => setAllEmployees(prev => prev.map(ex => ex.id === e.id ? e : ex))} syncId={syncId} setSyncId={setSyncId} onSyncNow={() => fetchFromCloud(syncId)} />}
        </div>
      </main>

      {showClockInPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white max-w-sm w-full rounded-[2rem] shadow-2xl p-8 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto flex items-center justify-center text-indigo-600">
              <Clock size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Shift Not Started</h3>
              <p className="text-sm text-slate-500 font-medium">Welcome back, {currentUser.name}! Would you like to clock in now?</p>
            </div>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => { handleUpdateStatus(EmployeeStatus.ACTIVE); setShowClockInPrompt(false); }}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
              >
                <CheckCircle2 size={18} className="mr-2" /> Yes, Clock In
              </button>
              <button 
                onClick={() => setShowClockInPrompt(false)}
                className="w-full py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessageCenter && (
        <CommunicationCenter 
          messages={messages} currentUser={currentUser} allEmployees={allEmployees} lastReadTimestamps={lastReadTimestamps}
          onSendMessage={(m) => setMessages(prev => [...prev, {...m, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString()}])} 
          onReadChat={(id) => setLastReadTimestamps(prev => ({ ...prev, [id]: new Date().toISOString() }))}
          onClose={() => setShowMessageCenter(false)} 
        />
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all relative ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-100'}`}>
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
