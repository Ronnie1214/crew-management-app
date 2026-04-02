import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Plus, Trash2, Pin, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'Medium', pinned: false });
  const crewMember = JSON.parse(localStorage.getItem('crew_session'));

  useEffect(() => { loadNotices(); }, []);

  const loadNotices = async () => {
    const n = await base44.entities.Notice.list('-created_date', 50);
    setNotices(n);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (editingId) {
      await base44.entities.Notice.update(editingId, { ...form });
    } else {
      await base44.entities.Notice.create({ ...form, author_name: crewMember.display_name });
    }
    setForm({ title: '', content: '', priority: 'Medium', pinned: false });
    setShowForm(false);
    setEditingId(null);
    await loadNotices();
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Notice.delete(id);
    await loadNotices();
  };

  const handleEdit = (notice) => {
    setForm({ title: notice.title, content: notice.content, priority: notice.priority, pinned: notice.pinned });
    setEditingId(notice.id);
    setShowForm(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Manage Notices</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage crew notices</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: '', content: '', priority: 'Medium', pinned: false }); }} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> New Notice
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-heading font-semibold">{editingId ? 'Edit Notice' : 'New Notice'}</h2>
          <div>
            <Label className="text-sm">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <Label className="text-sm">Content</Label>
            <Textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows={4} required />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label className="text-sm">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch checked={form.pinned} onCheckedChange={(v) => setForm({...form, pinned: v})} />
              <Label className="text-sm">Pinned</Label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-primary">{submitting ? 'Saving...' : editingId ? 'Update' : 'Publish'}</Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
          </div>
        </form>
      )}

      {notices.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No notices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map(notice => (
            <div key={notice.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{notice.title}</h3>
                    {notice.pinned && <Pin className="w-3.5 h-3.5 text-accent" />}
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{notice.priority}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{notice.author_name} · {format(new Date(notice.created_date), 'MMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(notice)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(notice.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
