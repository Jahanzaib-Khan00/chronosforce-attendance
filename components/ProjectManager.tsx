
import React, { useState } from 'react';
import { Project, ProjectType, ProjectStatus, Employee, UserRole } from '../types';
import { FolderPlus, User, Users, XCircle, Play, Square, Trash2, Edit3, Settings, Save } from 'lucide-react';

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
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    client: '',
    type: ProjectType.PERMANENT,
    status: ProjectStatus.ACTIVE,
    directorId: '',
    teamLeadId: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const canManage = [UserRole.ADMIN, UserRole.TOP_MANAGEMENT, UserRole.DIRECTOR, UserRole.SUPERVISOR, UserRole.TEAM_LEAD].includes(currentUser.role);

  const openAddForm = () => {
    setEditingProject(null);
    setFormData({
      name: '', client: '', type: ProjectType.PERMANENT, status: ProjectStatus.ACTIVE,
      directorId: '', teamLeadId: '', startDate: new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const openEditForm = (proj: Project) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      client: proj.client,
      type: proj.type,
      status: proj.status,
      directorId: proj.directorId || '',
      teamLeadId: proj.teamLeadId || '',
      startDate: proj.startDate,
      endDate: proj.endDate
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client) return;

    if (editingProject) {
      const updated: Project = {
        ...editingProject,
        name: formData.name!,
        client: formData.client!,
        type: formData.type!,
        status: formData.status!,
        directorId: formData.directorId || null,
        teamLeadId: formData.teamLeadId || null,
        startDate: formData.startDate!,
        endDate: formData.endDate
      };
      onUpdateProject(updated);
    } else {
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
    }
    
    setShowForm(false);
  };

  const directors = employees.filter(e => e.role === UserRole.DIRECTOR || e.role === UserRole.TOP_MANAGEMENT || e.role === UserRole.ADMIN);
  const teamLeads = employees.filter(e => e.role === UserRole.TEAM_LEAD);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project Portfolio</h2>
          <p className="text-slate-500 text-sm">Deployment oversight and resource configuration.</p>
        </div>
        {canManage && (
          <button 
            onClick={openAddForm}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 flex items-center transition-all hover:scale-[1.02]"
          >
            <FolderPlus className="w-5 h-5 mr-2" /> New Deployment
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {editingProject ? `Configuring: ${editingProject.name}` : 'Initialize New Project'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-2"><XCircle size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Descriptor</label>
                <input required placeholder="Project Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client / Stakeholder</label>
                <input required placeholder="Stakeholder Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Scope</label>
                  <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProjectType})}>
                    <option value={ProjectType.PERMANENT}>Permanent</option>
                    <option value={ProjectType.TEMPORARY}>Temporary</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Status</label>
                  <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}>
                    <option value={ProjectStatus.ACTIVE}>Active</option>
                    <option value={ProjectStatus.ENDED}>Deactivated</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Director</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.directorId || ''} onChange={e => setFormData({...formData, directorId: e.target.value})}>
                  <option value="">Unassigned (Select Below)</option>
                  {directors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.role})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Team Lead</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.teamLeadId || ''} onChange={e => setFormData({...formData, teamLeadId: e.target.value})}>
                  <option value="">Unassigned (Select Below)</option>
                  {teamLeads.map(tl => <option key={tl.id} value={tl.id}>{tl.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commencement Date</label>
                <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4 pt-6 border-t">
               <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
               <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center">
                 <Save size={18} className="mr-2" /> {editingProject ? 'Apply Changes' : 'Initialize Deployment'}
               </button>
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
            <div key={proj.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all p-8 group relative flex flex-col min-h-[320px]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 leading-tight mb-1">{proj.name}</h4>
                  <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest">{proj.client}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  proj.status === ProjectStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {proj.status}
                </div>
              </div>

              <div className="space-y-5 mb-8 flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Director</p>
                    <p className="text-sm font-bold text-slate-700">{director?.name || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Team Lead</p>
                    <p className="text-sm font-bold text-slate-700">{teamLead?.name || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-between items-center mt-auto">
                 <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workforce</span>
                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-md font-bold">{assignedStaff.length}</span>
                 </div>
                 {canManage && (
                   <div className="flex space-x-2">
                      <button 
                        onClick={() => openEditForm(proj)} 
                        className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="Configure Project"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => onDeleteProject(proj.id)} 
                        className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        title="Remove Project"
                      >
                        <Trash2 size={18} />
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
