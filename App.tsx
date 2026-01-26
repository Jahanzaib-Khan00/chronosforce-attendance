
import React, { useState } from 'react';
import { Employee, EmployeeStatus, AttendanceRecord, LeaveRequest, UserRole, Project } from './types';
import { MOCK_EMPLOYEES, PROJECTS } from './constants';
import EmployeePortal from './components/EmployeePortal';
import ManagerPortal from './components/ManagerPortal';
import AdminPortal from './components/AdminPortal';
import RequestManager from './components/RequestManager';
import ProjectManager from './components/ProjectManager';
import EmployeeManager from './components/EmployeeManager';
import Login from './components/Login';
import { LayoutDashboard, Users, Clock, Settings, LogOut, Bell, ClipboardCheck, UserCog, FolderKanban, UserRoundSearch } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [allProjects, setAllProjects] = useState<Project[]>(PROJECTS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'PORTAL' | 'MANAGEMENT' | 'ADMIN' | 'REQUESTS' | 'PROJECTS' | 'EMPLOYEES'>('PORTAL');

  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    setActiveTab('PORTAL');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateStatus = (status: EmployeeStatus, projectId?: string) => {
    if (!currentUser) return;
    
    const timestamp = new Date().toISOString();
    let recordType: AttendanceRecord['type'] = 'PROJECT_CHANGE';

    // Determine the log type based on status transition
    if (status === EmployeeStatus.ACTIVE && currentUser.status === EmployeeStatus.OFF) {
      recordType = 'CLOCK_IN';
    } else if (status === EmployeeStatus.OFF) {
      recordType = 'CLOCK_OUT';
    } else if (status === EmployeeStatus.BREAK) {
      recordType = 'BREAK_START';
    } else if (status === EmployeeStatus.ACTIVE && currentUser.status === EmployeeStatus.BREAK) {
      recordType = 'BREAK_END';
    } else if (projectId && projectId !== currentUser.activeProjectId) {
      recordType = 'PROJECT_CHANGE';
    }

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: currentUser.id,
      type: recordType,
      timestamp,
      projectId: projectId || currentUser.activeProjectId
    };

    setAttendanceRecords(prev => [...prev, newRecord]);

    const updatedEmployees = allEmployees.map(emp => {
      if (emp.id === currentUser.id) {
        const updated = { ...emp, status, activeProjectId: projectId || emp.activeProjectId, lastActionTime: timestamp };
        setCurrentUser(updated);
        return updated;
      }
      return emp;
    });
    setAllEmployees(updatedEmployees);
  };

  const handleAddEmployee = (newEmp: Employee) => setAllEmployees(prev => [...prev, newEmp]);

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    const updated = allEmployees.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    setAllEmployees(updated);
    if (currentUser?.id === updatedEmp.id) setCurrentUser(updatedEmp);
  };

  const handleDeleteEmployee = (empId: string) => {
    if (empId === currentUser?.id) return alert("System Integrity Error: Cannot archive active session.");
    if (!window.confirm("Archive this profile? All historic records will be moved to cold storage.")) return;
    setAllEmployees(prev => prev.filter(e => e.id !== empId));
  };

  const handleAddProject = (newProj: Project) => setAllProjects(prev => [...prev, newProj]);

  const handleUpdateProject = (updatedProj: Project) => {
    setAllProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
  };

  const handleDeleteProject = (projectId: string) => {
    if (!window.confirm("CRITICAL: Archive Project? Active assignments will be revoked.")) return;
    setAllProjects(prev => prev.filter(p => p.id !== projectId));
    const updated = allEmployees.map(emp => {
      const remaining = emp.allowedProjectIds.filter(id => id !== projectId);
      return {
        ...emp,
        allowedProjectIds: remaining,
        activeProjectId: emp.activeProjectId === projectId ? (remaining[0] || 'p3') : emp.activeProjectId
      };
    });
    setAllEmployees(updated);
    if (currentUser) {
      const sync = updated.find(e => e.id === currentUser.id);
      if (sync) setCurrentUser(sync);
    }
  };

  const handleRequestLeave = (reqData: any) => {
    if (!currentUser) return;

    let teamLeadStatus: any = 'PENDING';
    let supervisorStatus: any = 'PENDING';
    let directorStatus: any = 'PENDING';

    if (currentUser.role === UserRole.TEAM_LEAD) {
      teamLeadStatus = 'NOT_REQUIRED';
    } else if (currentUser.role === UserRole.SUPERVISOR) {
      teamLeadStatus = 'NOT_REQUIRED';
      supervisorStatus = 'NOT_REQUIRED';
    } else if ([UserRole.DIRECTOR, UserRole.TOP_MANAGEMENT, UserRole.ADMIN].includes(currentUser.role)) {
      teamLeadStatus = 'NOT_REQUIRED';
      supervisorStatus = 'NOT_REQUIRED';
      directorStatus = 'PENDING';
    }

    const newRequest: LeaveRequest = {
      ...reqData,
      id: Math.random().toString(36).substr(2, 9),
      teamLeadStatus,
      supervisorStatus,
      directorStatus,
      finalStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
  };

  const handleApprove = (requestId: string, role: UserRole) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updated = { ...req };
        if (role === UserRole.TEAM_LEAD && updated.teamLeadStatus === 'PENDING') {
           updated.teamLeadStatus = 'APPROVED';
        } else if (role === UserRole.SUPERVISOR && updated.supervisorStatus === 'PENDING' && (updated.teamLeadStatus === 'APPROVED' || updated.teamLeadStatus === 'NOT_REQUIRED')) {
           updated.supervisorStatus = 'APPROVED';
        } else if (role === UserRole.DIRECTOR && updated.directorStatus === 'PENDING' && (updated.supervisorStatus === 'APPROVED' || updated.supervisorStatus === 'NOT_REQUIRED')) {
           updated.directorStatus = 'APPROVED';
        }
        
        if (role === UserRole.ADMIN || role === UserRole.TOP_MANAGEMENT) {
          if (updated.teamLeadStatus === 'PENDING') updated.teamLeadStatus = 'APPROVED';
          if (updated.supervisorStatus === 'PENDING') updated.supervisorStatus = 'APPROVED';
          if (updated.directorStatus === 'PENDING') updated.directorStatus = 'APPROVED';
        }

        const tlOk = updated.teamLeadStatus === 'APPROVED' || updated.teamLeadStatus === 'NOT_REQUIRED';
        const supOk = updated.supervisorStatus === 'APPROVED' || updated.supervisorStatus === 'NOT_REQUIRED';
        const dirOk = updated.directorStatus === 'APPROVED' || updated.directorStatus === 'NOT_REQUIRED';

        if (tlOk && supOk && dirOk) {
          updated.finalStatus = 'APPROVED';
          setAllEmployees(emps => emps.map(e => e.id === req.employeeId ? {...e, status: EmployeeStatus.LEAVE} : e));
        }
        return updated;
      }
      return req;
    }));
  };

  const handleReject = (requestId: string, role: UserRole) => {
    setLeaveRequests(prev => prev.map(req => req.id === requestId ? { ...req, finalStatus: 'REJECTED' } : req));
  };

  if (!currentUser) return <Login onLogin={handleLogin} employees={allEmployees} />;

  const hasMgmtAccess = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR, UserRole.SUPERVISOR, UserRole.TEAM_LEAD].includes(currentUser.role);
  const isHighLevel = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR].includes(currentUser.role);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-20 md:w-64 bg-white border-r hidden sm:flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><Clock className="text-white w-6 h-6" /></div>
          <span className="font-bold text-xl hidden md:block">ChronosForce</span>
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
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-center space-x-3 hover:bg-slate-800 transition-colors">
            <LogOut size={18} />
            <span className="hidden md:block font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'PORTAL' && 'Workspace'}
                {activeTab === 'MANAGEMENT' && 'Ops Intelligence'}
                {activeTab === 'REQUESTS' && 'Approvals'}
                {activeTab === 'PROJECTS' && 'Projects'}
                {activeTab === 'EMPLOYEES' && 'Staffing'}
              </h1>
            </div>
            <div className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">{currentUser.role.replace('_', ' ')}</div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'PORTAL' && <EmployeePortal employee={currentUser} onUpdateStatus={handleUpdateStatus} onRequestLeave={handleRequestLeave} attendanceRecords={attendanceRecords.filter(r => r.employeeId === currentUser.id)} />}
            {activeTab === 'MANAGEMENT' && <ManagerPortal employees={allEmployees} projects={allProjects} currentUser={currentUser} attendanceRecords={attendanceRecords} />}
            {activeTab === 'PROJECTS' && <ProjectManager projects={allProjects} employees={allEmployees} onAddProject={handleAddProject} onUpdateProject={handleUpdateProject} onDeleteProject={handleDeleteProject} currentUser={currentUser} />}
            {activeTab === 'EMPLOYEES' && <EmployeeManager employees={allEmployees} projects={allProjects} onAddEmployee={handleAddEmployee} onUpdateEmployee={handleUpdateEmployee} onDeleteEmployee={handleDeleteEmployee} currentUser={currentUser} />}
            {activeTab === 'REQUESTS' && <RequestManager requests={leaveRequests} userRole={currentUser.role} onApprove={handleApprove} onReject={handleReject} />}
            {activeTab === 'ADMIN' && <AdminPortal onAddEmployee={handleAddEmployee} onUpdateEmployee={handleUpdateEmployee} employees={allEmployees} projects={allProjects} />}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 p-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}>
    {React.cloneElement(icon as React.ReactElement, { size: 22 })}
    <span className="font-bold text-sm hidden md:block whitespace-nowrap">{label}</span>
  </button>
);

export default App;
