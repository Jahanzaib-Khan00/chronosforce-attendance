
import { Employee, Project, EmployeeStatus, UserRole, ProjectType, ProjectStatus } from './types';

export const PROJECTS: Project[] = [
  { 
    id: 'p1', 
    name: 'Alpha Prime', 
    client: 'Nebula Corp', 
    type: ProjectType.PERMANENT, 
    status: ProjectStatus.ACTIVE,
    directorId: 'dir1',
    teamLeadId: 'tl1',
    startDate: '2023-01-01'
  },
  { 
    id: 'p2', 
    name: 'Zion Portal', 
    client: 'Future Systems', 
    type: ProjectType.TEMPORARY, 
    status: ProjectStatus.ACTIVE,
    directorId: 'dir1',
    teamLeadId: 'tl1',
    startDate: '2024-02-15',
    endDate: '2024-12-31'
  },
  { 
    id: 'p3', 
    name: 'Core Infrastructure', 
    client: 'Internal', 
    type: ProjectType.PERMANENT, 
    status: ProjectStatus.ACTIVE,
    directorId: 'tm1',
    teamLeadId: null,
    startDate: '2020-01-01'
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'dev-root',
    code: 'DEV-ROOT',
    name: 'Jahanzaib Khan',
    username: 'jahanzaib',
    password: 'k1h2a3n4',
    email: 'jahanzaib@chronos.ai',
    role: UserRole.ADMIN,
    shift: { start: '00:00', end: '23:59' },
    allowedProjectIds: ['p1', 'p2', 'p3'],
    activeProjectId: 'p3',
    supervisorId: null,
    status: EmployeeStatus.ACTIVE,
    lastActionTime: new Date().toISOString(),
    totalMinutesWorkedToday: 420,
    otEnabled: true
  },
  {
    id: 'tm1',
    code: 'TM001',
    name: 'Sarah Connor',
    username: 'sarah',
    password: 'password123',
    email: 's.connor@chronos.ai',
    role: UserRole.TOP_MANAGEMENT,
    shift: { start: '08:00', end: '16:00' },
    allowedProjectIds: ['p1', 'p2', 'p3'],
    activeProjectId: 'p3',
    supervisorId: null,
    status: EmployeeStatus.ACTIVE,
    lastActionTime: new Date().toISOString(),
    totalMinutesWorkedToday: 300,
    otEnabled: true
  },
  {
    id: 'dir1',
    code: 'DIR001',
    name: 'Eleanor Vance',
    username: 'eleanor',
    password: 'password123',
    email: 'e.vance@chronos.ai',
    role: UserRole.DIRECTOR,
    shift: { start: '09:00', end: '17:00' },
    allowedProjectIds: ['p1', 'p2'],
    activeProjectId: 'p1',
    supervisorId: 'tm1',
    status: EmployeeStatus.ACTIVE,
    lastActionTime: new Date().toISOString(),
    totalMinutesWorkedToday: 120,
    otEnabled: false
  },
  {
    id: 'sup1',
    code: 'SUP001',
    name: 'James Holden',
    username: 'james',
    password: 'password123',
    email: 'j.holden@chronos.ai',
    role: UserRole.SUPERVISOR,
    shift: { start: '09:00', end: '17:00' },
    allowedProjectIds: ['p1'],
    activeProjectId: 'p1',
    supervisorId: 'tl1',
    status: EmployeeStatus.ACTIVE,
    lastActionTime: new Date().toISOString(),
    totalMinutesWorkedToday: 200,
    otEnabled: true
  },
  {
    id: 'tl1',
    code: 'TL001',
    name: 'Marcus Thorne',
    username: 'marcus',
    password: 'password123',
    email: 'm.thorne@chronos.ai',
    role: UserRole.TEAM_LEAD,
    shift: { start: '09:00', end: '17:00' },
    allowedProjectIds: ['p1'],
    activeProjectId: 'p1',
    supervisorId: 'dir1',
    status: EmployeeStatus.ACTIVE,
    lastActionTime: new Date().toISOString(),
    totalMinutesWorkedToday: 240,
    otEnabled: false
  },
  {
    id: 'e2',
    code: 'EMP002',
    name: 'David Chen',
    username: 'david',
    password: 'password123',
    // Fix: Wrapped unquoted email string in single quotes
    email: 'david.c@chronos.ai',
    role: UserRole.EMPLOYEE,
    shift: { start: '09:00', end: '17:00' },
    allowedProjectIds: ['p1'],
    activeProjectId: 'p1',
    supervisorId: 'sup1',
    status: EmployeeStatus.BREAK,
    lastActionTime: new Date().toISOString(),
    totalMinutesWorkedToday: 180,
    otEnabled: true
  }
];