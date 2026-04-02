import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import { ALL_ROLES, ROLE_COLORS, getRolesArray } from '@/lib/roleUtils';

export default function ManageCrew() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: '', password: '', display_name: '', roles: [], rank: '', status: 'Active'
  });

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    const m = await base44.entities.CrewMember.list('display_name', 100);
    setMembers(m);
    setLoading(false);
  };

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (editingId) {
      const updateData = { ...form };
      if (!updateData.password) delete updateData.password;
      await base44.entities.CrewMember.update(editingId, updateData);
    } else {
      await base44.entities.CrewMember.create({ ...form, join_date: new Date().toISOString().slice(0, 10), flights_completed: 0 });
    }
    resetForm();
    await loadMembers();
    setSubmitting(false);
  };

  const resetForm = () => {
    setForm({ username: '', password: '', display_name: '', roles: [], rank: '', status: 'Active' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (m) => {
    setForm({
      username: m.username,
      password: '',
      display_name: m.display_name,
      roles: getRolesArray(m),
      rank: m.rank || '',
      status: m.status || 'Active'
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await base44.entities.CrewMember.delete(id);
    await loadMembers();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Manage Crew</h1>
          <p className="text-muted-foreground text-sm mt-1">{members.length} crew members</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4 max-w-2xl">
          <h2 className="font-heading font-semibold">{editingId ? 'Edit Member' : 'Add Crew Member'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Display Name</Label>
              <Input value={form.display_name} onChange={(e) => setForm({...form, display_name: e.target.value})} required />
            </div>
            <div>
              <Label className="text-sm">Username</Label>
              <Input value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} required />
            </div>
            <div>
              <Label className="text-sm">Password {editingId && '(leave blank to keep)'}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required={!editingId} />
            </div>
            <div>
              <Label className="text-sm">Rank</Label>
              <Input value={form.rank} onChange={(e) => setForm({...form, rank: e.target.value})} placeholder="Optional" />
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On LOA">On LOA</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Roles (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ROLES.map(role => (
                <label key={role} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={form.roles.includes(role)}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  <span className="text-sm">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting || form.roles.length === 0} className="bg-primary">
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Add Member'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {members.map(m => {
          const roles = getRolesArray(m);
          return (
            <div key={m.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{m.display_name?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{m.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{m.username}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(m)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {roles.map(role => (
                  <span key={role} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ROLE_COLORS[role] || 'bg-muted text-muted-foreground'}`}>
                    {role}
                  </span>
                ))}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto ${m.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                  {m.status || 'Active'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
