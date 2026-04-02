import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { CalendarOff, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageLOA() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const crewMember = JSON.parse(localStorage.getItem('crew_session'));

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    const r = await base44.entities.LOARequest.list('-created_date', 100);
    setRequests(r);
    setLoading(false);
  };

  const handleReview = async (id, status) => {
    await base44.entities.LOARequest.update(id, { status, reviewed_by: crewMember.display_name });
    await loadRequests();
  };

  const statusConfig = {
    Pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
    Approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10' },
    Denied: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">LOA Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and manage leave requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <CalendarOff className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No leave requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const config = statusConfig[req.status] || statusConfig.Pending;
            const Icon = config.icon;
            return (
              <div key={req.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{req.crew_member_name?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{req.crew_member_name}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(req.created_date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>{req.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground text-xs">From</p>
                    <p className="font-medium">{format(new Date(req.start_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">To</p>
                    <p className="font-medium">{format(new Date(req.end_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{req.reason}</p>

                {req.status === 'Pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReview(req.id, 'Approved')}>
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleReview(req.id, 'Denied')}>
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Deny
                    </Button>
                  </div>
                )}
                {req.reviewed_by && <p className="text-xs text-muted-foreground mt-2">Reviewed by: {req.reviewed_by}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
