import { UserCircle, Plane, Calendar, Shield, Award } from 'lucide-react';
import { format } from 'date-fns';
import { getRolesArray, ROLE_COLORS } from '@/lib/roleUtils';

export default function Profile() {
  const crewMember = JSON.parse(localStorage.getItem('crew_session'));
  const roles = getRolesArray(crewMember);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-heading font-bold">My Profile</h1>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[hsl(215,80%,48%)] to-[hsl(215,80%,35%)] relative">
          <div className="absolute inset-0 opacity-50" style={{backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px"}} />
        </div>
        
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card flex items-center justify-center shadow-lg">
            <span className="text-3xl font-heading font-bold text-primary">{crewMember?.display_name?.[0]}</span>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h2 className="text-xl font-heading font-bold">{crewMember?.display_name}</h2>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                crewMember?.status === 'Active' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
              }`}>
                {crewMember?.status || 'Active'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roles.map(role => (
                <span key={role} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ROLE_COLORS[role] || 'bg-muted text-muted-foreground border-border'}`}>
                  {role}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">@{crewMember?.username}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailCard icon={Award} label="Rank" value={crewMember?.rank || 'Not set'} />
        <DetailCard icon={Plane} label="Flights Completed" value={crewMember?.flights_completed || 0} />
        <DetailCard icon={Calendar} label="Joined" value={crewMember?.join_date ? format(new Date(crewMember.join_date), 'MMM d, yyyy') : 'N/A'} />
        <DetailCard icon={Shield} label="Status" value={crewMember?.status || 'Active'} />
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold text-sm">{value}</p>
        </div>
      </div>
    </div>
  );
}
