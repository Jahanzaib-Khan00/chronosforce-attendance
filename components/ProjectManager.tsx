
import React, { useState } from 'react';
import { Project, ProjectType, ProjectStatus, Employee, UserRole } from '../types';
import { FolderPlus, User, Users, XCircle, Play, Square, Trash2 } from 'lucide-react';

interface ProjectManagerProps {
  projects: Project[];
  employees: Employee[];
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  currentUser: Employee;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, employees, onAddProject, onUpdateProject, onDeleteProject, currentUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    client: '',
    type: ProjectType.PERMANENT,
    status: ProjectStatus.ACTIVE,
    directorId: '',
    teamLeadId: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const canManage = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR].includes(currentUser.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client) return;

    const newProj: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      client: formData.client!,
      type: formData.type || ProjectType.PERMANENT,
      status: formData.status || ProjectStatus.ACTIVE,
      directorId: formData.directorId || null,
      teamLeadId: formData.teamLeadId || null,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate
    };

    onAddProject(newProj);
    setShowForm(false);
    setFormData({ type: ProjectType.PERMANENT, status: ProjectStatus.ACTIVE, startDate: new Date().toISOString().split('T')[0] });
  };

  const toggleStatus = (proj: Project) => {
    const newStatus = proj.status === ProjectStatus.ACTIVE ? ProjectStatus.ENDED : ProjectStatus.ACTIVE;
    onUpdateProject({ ...proj, status: newStatus });
  };

  const directors = employees.filter(e => e.role === UserRole.DIRECTOR || e.role === UserRole.TOP_MANAGEMENT || e.role === UserRole.ADMIN);
  const teamLeads = employees.filter(e => e.role === UserRole.TEAM_LEAD);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project Portfolio</h2>
          <p className="text-slate-500 text-sm">Strategic oversight and resource control.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center transition-all hover:scale-[1.02]"
          >
            <FolderPlus className="w-5 h-5 mr-2" /> Initialize Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">New Project Definition</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2"><XCircle size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Identity</label>
                <input required placeholder="e.g. Project Orion" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stakeholder</label>
                <input required placeholder="Client Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type</label>
                  <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProjectType})}>
                    <option value={ProjectType.PERMANENT}>Permanent</option>
                    <option value={ProjectType.TEMPORARY}>Temporary</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}>
                    <option value={ProjectStatus.ACTIVE}>Active</option>
                    <option value={ProjectStatus.ENDED}>Ended</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Director</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.directorId || ''} onChange={e => setFormData({...formData, directorId: e.target.value})}>
                  <option value="">Select Director...</option>
                  {directors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Lead</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.teamLeadId || ''} onChange={e => setFormData({...formData, teamLeadId: e.target.value})}>
                  <option value="">Select Team Lead...</option>
                  {teamLeads.map(tl => <option key={tl.id} value={tl.id}>{tl.name}</option>)}
                </select>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t">
               <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold">Discard</button>
               <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.map(proj => {
          const director = employees.find(e => e.id === proj.directorId);
          const teamLead = employees.find(e => e.id === proj.teamLeadId);
          const assignedStaff = employees.filter(e => e.allowedProjectIds.includes(proj.id));

          return (
            <div key={proj.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all p-8 group relative flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{proj.name}</h4>
                  <p className="text-xs text-slate-400 uppercase font-black">{proj.client}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  proj.status === ProjectStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {proj.status}
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-center space-x-3 text-sm font-bold text-slate-700">
                  <User size={16} className="text-slate-300" />
                  <span>Director: {director?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm font-bold text-slate-700">
                  <Users size={16} className="text-slate-300" />
                  <span>Team Lead: {teamLead?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-between items-center">
                 <div className="text-xs font-bold text-slate-400">Total Staff: <span className="text-slate-900">{assignedStaff.length}</span></div>
                 {canManage && (
                   <div className="flex space-x-2">
                      <button onClick={() => toggleStatus(proj)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                        {proj.status === ProjectStatus.ACTIVE ? <Square size={16} /> : <Play size={16} />}
                      </button>
                      <button onClick={() => onDeleteProject(proj.id)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectManager;
