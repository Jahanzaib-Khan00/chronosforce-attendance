
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  BREAK = 'BREAK',
  OFF = 'OFF',
  LEAVE = 'LEAVE',
  LATE = 'LATE'
}

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  TEAM_LEAD = 'TEAM_LEAD',
  SUPERVISOR = 'SUPERVISOR',
  DIRECTOR = 'DIRECTOR',
  TOP_MANAGEMENT = 'TOP_MANAGEMENT',
  ADMIN = 'ADMIN'
}

export enum ProjectType {
  PERMANENT = 'PERMANENT',
  TEMPORARY = 'TEMPORARY'
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED'
}

export interface Shift {
  start: string; // HH:mm
  end: string;   // HH:mm
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: ProjectType;
  status: ProjectStatus;
  directorId: string | null;
  teamLeadId: string | null;
  startDate: string;
  endDate?: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  username: string;
  password?: string;
  email: string;
  role: UserRole;
  shift: Shift;
  allowedProjectIds: string[];
  activeProjectId: string;
  supervisorId: string | null; 
  status: EmployeeStatus;
  lastActionTime: string; 
  totalMinutesWorkedToday: number;
  otEnabled: boolean; // Permanent OT permission flag
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  teamLeadStatus: ApprovalStatus;
  supervisorStatus: ApprovalStatus;
  directorStatus: ApprovalStatus;
  finalStatus: ApprovalStatus;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END' | 'PROJECT_CHANGE';
  timestamp: string;
  projectId?: string;
}

// Added OvertimeApproval interface to fix missing export error in ReportBuilder.tsx
export interface OvertimeApproval {
  id: string;
  employeeId: string;
  date: string;
  approvedBy: string;
  status: ApprovalStatus;
}

export interface DailyActivityLog {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  overtimeHours: number;
  projectIds: string[];
  note: string;
  submittedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string; // If null, it's a global broadcast
  content: string;
  timestamp: string;
}