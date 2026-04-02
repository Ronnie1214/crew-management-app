import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarOff, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function LOA() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });
  const crewMember = JSON.parse(localStorage.getItem('crew_session'));

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const r = await base44.entities.LOARequest.filter({ crew_member_id: crewMember.id }, '-created_date');
    setRequests(r);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.LOARequest.create({
      crew_member_id: crewMember.id,
      crew_member_name: crewMember.display_name,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
    });
    setForm({ start_date: '', end_date: '', reason: '' });
    setShowForm(false);
    await loadRequests();
    setSubmitting(false);
  };

  const statusConfig = {
    Pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
    Approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10' },
    Denied: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Leave of Absence</h1>
          <p className="text-muted-foreground text-sm mt-1">Request and track your leave</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-heading font-semibold">New LOA Request</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} required />
            </div>
            <div>
              <Label className="text-sm">End Date</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} required />
            </div>
          </div>
          <div>
            <Label className="text-sm">Reason</Label>
            <Textarea value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} placeholder="Explain your reason for leave..." required />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-primary">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {requests.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <CalendarOff className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No leave requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const config = statusConfig[req.status] || statusConfig.Pending;
            const Icon = config.icon;
            return (
              <div key={req.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className={`text-sm font-semibold ${config.color}`}>{req.status}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{format(new Date(req.created_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <p className="text-muted-foreground text-xs">From</p>
                    <p className="font-medium">{format(new Date(req.start_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">To</p>
                    <p className="font-medium">{format(new Date(req.end_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{req.reason}</p>
                {req.reviewed_by && (
                  <p className="text-xs text-muted-foreground mt-2">Reviewed by: {req.reviewed_by}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
