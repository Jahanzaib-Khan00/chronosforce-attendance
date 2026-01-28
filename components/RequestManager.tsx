
import React from 'react';
import { LeaveRequest, UserRole, ApprovalStatus } from '../types';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowRight, FastForward, Trash2 } from 'lucide-react';

interface RequestManagerProps {
  requests: LeaveRequest[];
  userRole: UserRole;
  onApprove: (requestId: string, role: UserRole) => void;
  onReject: (requestId: string, role: UserRole) => void;
  onDeleteRequest: (requestId: string) => void;
}

const RequestManager: React.FC<RequestManagerProps> = ({ requests, userRole, onApprove, onReject, onDeleteRequest }) => {
  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'NOT_REQUIRED': return <FastForward className="w-4 h-4 text-slate-300" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start space-x-4 shadow-sm">
        <AlertCircle className="text-indigo-600 w-6 h-6 mt-1" />
        <div>
          <h3 className="font-bold text-indigo-900 uppercase tracking-tight text-sm">Direct Line Visibility</h3>
          <p className="text-sm text-indigo-800/80 leading-relaxed mt-1">
            You only see requests from your direct reporting chain. 
            <span className="font-bold"> Directors</span> can finalise approvals immediately, bypassing lower stages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <div className="bg-white py-24 rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
             No pending approvals in your reporting line
          </div>
        ) : (
          requests.map(req => {
            const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.TOP_MANAGEMENT;
            
            const canLead = userRole === UserRole.TEAM_LEAD || isAdmin;
            const canSupervise = userRole === UserRole.SUPERVISOR || isAdmin;
            const canDirect = userRole === UserRole.DIRECTOR || isAdmin;

            const needsLead = req.teamLeadStatus === 'PENDING';
            const needsSupervisor = (req.teamLeadStatus === 'APPROVED' || req.teamLeadStatus === 'NOT_REQUIRED') && req.supervisorStatus === 'PENDING';
            const needsDirector = (req.supervisorStatus === 'APPROVED' || req.supervisorStatus === 'NOT_REQUIRED') && req.directorStatus === 'PENDING';

            // Directors can approve ANYTIME if they see it
            const activeRole = 
              canDirect ? UserRole.DIRECTOR :
              (needsSupervisor && canSupervise) ? UserRole.SUPERVISOR :
              (needsLead && canLead) ? UserRole.TEAM_LEAD : null;

            return (
              <div key={req.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-bold text-indigo-600 text-lg shadow-inner">
                      {req.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-lg">{req.employeeName}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{req.startDate} — {req.endDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <div className={`px-4 py-1.5 rounded-xl font-black text-xs border ${
                         req.finalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         req.finalStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                         'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>
                         {req.finalStatus}
                       </div>
                    </div>
                    <button 
                      onClick={() => onDeleteRequest(req.id)}
                      className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                      title="Dismiss & Notify"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600 italic">
                  "{req.reason}"
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center space-x-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                    <Stage 
                      title="Team Lead" 
                      status={req.teamLeadStatus} 
                      icon={getStatusIcon(req.teamLeadStatus)} 
                      active={needsLead && !canDirect}
                    />
                    <ArrowRight size={14} className="text-slate-200 shrink-0" />
                    <Stage 
                      title="Supervisor" 
                      status={req.supervisorStatus} 
                      icon={getStatusIcon(req.supervisorStatus)} 
                      active={needsSupervisor && !canDirect}
                    />
                    <ArrowRight size={14} className="text-slate-200 shrink-0" />
                    <Stage 
                      title="Director" 
                      status={req.directorStatus} 
                      icon={getStatusIcon(req.directorStatus)} 
                      active={canDirect || needsDirector}
                    />
                  </div>

                  <div className="flex items-center space-x-3 w-full lg:w-auto">
                    {activeRole ? (
                      <>
                        <button 
                          onClick={() => onReject(req.id, activeRole)} 
                          className="flex-1 lg:flex-none px-6 py-3 bg-white text-rose-500 rounded-xl font-bold border border-rose-200 hover:bg-rose-50 transition-all"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => onApprove(req.id, activeRole)} 
                          className="flex-1 lg:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                          Approve {activeRole === UserRole.TEAM_LEAD ? 'as Lead' : activeRole === UserRole.SUPERVISOR ? 'as Supervisor' : 'as Director'}
                        </button>
                      </>
                    ) : (
                       <div className="w-full lg:w-auto text-center px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100">
                         Clearance stage locked
                       </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const Stage = ({ title, status, icon, active }: { title: string, status: ApprovalStatus, icon: React.ReactNode, active: boolean }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border transition-all min-w-[150px] ${
    active ? 'bg-indigo-50 border-indigo-200 shadow-sm scale-105 z-10' : 
    status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 opacity-60' :
    status === 'NOT_REQUIRED' ? 'bg-slate-50 border-slate-100 opacity-40 italic' :
    'bg-white border-slate-100 opacity-40'
  }`}>
    <div className={`p-2 rounded-lg ${
       status === 'APPROVED' ? 'bg-emerald-100' : 
       status === 'REJECTED' ? 'bg-rose-100' : 
       active ? 'bg-indigo-100' : 'bg-slate-100'
    }`}>
      {icon}
    </div>
    <div>
      <p className={`text-[9px] font-black uppercase leading-none mb-1 ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{title}</p>
      <p className={`text-[10px] font-bold ${active ? 'text-indigo-900' : 'text-slate-700'}`}>
        {status === 'NOT_REQUIRED' ? 'Skipped' : status}
      </p>
    </div>
  </div>
);

export default RequestManager;
