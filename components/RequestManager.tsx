
import React from 'react';
import { LeaveRequest, UserRole, ApprovalStatus } from '../types';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface RequestManagerProps {
  requests: LeaveRequest[];
  userRole: UserRole;
  onApprove: (requestId: string, role: UserRole) => void;
  onReject: (requestId: string, role: UserRole) => void;
}

const RequestManager: React.FC<RequestManagerProps> = ({ requests, userRole, onApprove, onReject }) => {
  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start space-x-4">
        <AlertCircle className="text-indigo-600 w-6 h-6 mt-1" />
        <div>
          <h3 className="font-bold text-indigo-900 uppercase tracking-tight text-sm">Hierarchy Chain of Command</h3>
          <p className="text-sm text-indigo-800/80 leading-relaxed mt-1">
            Approvals flow through: <span className="font-bold">Team Lead</span> &rarr; <span className="font-bold">Supervisor</span> &rarr; <span className="font-bold">Director</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.length === 0 ? (
          <div className="bg-white py-24 rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400">
             No pending requests found.
          </div>
        ) : (
          requests.map(req => {
            const canLead = userRole === UserRole.TEAM_LEAD || userRole === UserRole.ADMIN || userRole === UserRole.TOP_MANAGEMENT;
            const canSupervise = userRole === UserRole.SUPERVISOR || userRole === UserRole.ADMIN || userRole === UserRole.TOP_MANAGEMENT;
            const canDirect = userRole === UserRole.DIRECTOR || userRole === UserRole.ADMIN || userRole === UserRole.TOP_MANAGEMENT;

            const needsLead = req.teamLeadStatus === 'PENDING';
            const needsSupervisor = req.teamLeadStatus === 'APPROVED' && req.supervisorStatus === 'PENDING';
            const needsDirector = req.supervisorStatus === 'APPROVED' && req.directorStatus === 'PENDING';

            const activeRole = 
              (needsLead && canLead) ? UserRole.TEAM_LEAD :
              (needsSupervisor && canSupervise) ? UserRole.SUPERVISOR :
              (needsDirector && canDirect) ? UserRole.DIRECTOR : null;

            return (
              <div key={req.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-600 uppercase">
                      {req.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{req.employeeName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{req.startDate} to {req.endDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-bold text-slate-400">STATUS</p>
                     <p className={`text-sm font-black ${req.finalStatus === 'REJECTED' ? 'text-rose-500' : 'text-emerald-500'}`}>{req.finalStatus}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl text-sm italic text-slate-600">"{req.reason}"</div>

                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pt-4 border-t">
                  <div className="flex items-center space-x-3 overflow-x-auto pb-2 lg:pb-0">
                    <Stage title="Team Lead" status={req.teamLeadStatus} icon={getStatusIcon(req.teamLeadStatus)} />
                    <ArrowRight size={14} className="text-slate-200" />
                    <Stage title="Supervisor" status={req.supervisorStatus} icon={getStatusIcon(req.supervisorStatus)} />
                    <ArrowRight size={14} className="text-slate-200" />
                    <Stage title="Director" status={req.directorStatus} icon={getStatusIcon(req.directorStatus)} />
                  </div>

                  <div className="flex items-center space-x-3">
                    {activeRole ? (
                      <>
                        <button onClick={() => onReject(req.id, activeRole)} className="px-6 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold border border-rose-100">Decline</button>
                        <button onClick={() => onApprove(req.id, activeRole)} className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Approve as {activeRole.replace('_', ' ')}</button>
                      </>
                    ) : (
                       <span className="text-xs font-bold text-slate-400 italic">No actions pending for your role</span>
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

const Stage = ({ title, status, icon }: { title: string, status: ApprovalStatus, icon: React.ReactNode }) => (
  <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-xl border min-w-[130px]">
    {icon}
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase leading-none">{title}</p>
      <p className="text-[10px] font-bold text-slate-700">{status}</p>
    </div>
  </div>
);

export default RequestManager;
