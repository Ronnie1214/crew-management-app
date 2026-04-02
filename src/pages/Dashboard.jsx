import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plane, Navigation, CalendarOff, Bell, Users, ChevronRight, Clock, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const priorityConfig = {
  Urgent: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600', icon: AlertTriangle },
  High: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-600', icon: AlertCircle },
  Medium: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: Info },
  Low: { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', icon: Bell },
};

export default function Dashboard() {
  const [notices, setNotices] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const crewMember = JSON.parse(localStorage.getItem('crew_session'));

  useEffect(() => {
    const load = async () => {
      const [n, f] = await Promise.all([
        base44.entities.Notice.list('-created_date', 5),
        base44.entities.Flight.filter({ status: 'Scheduled' }, 'date', 5),
      ]);
      setNotices(n);
      setFlights(f);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Welcome back, {crewMember?.display_name}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {crewMember?.role} · {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Navigation} label="Upcoming Flights" value={flights.length} color="primary" />
        <StatCard icon={Bell} label="New Notices" value={notices.length} color="accent" />
        <StatCard icon={Plane} label="Flights Completed" value={crewMember?.flights_completed || 0} color="chart-3" />
      </div>

      {/* Notices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">Crew Notices</h2>
          <Link to="/flights" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            View Flights <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {notices.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No notices at the moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map(notice => {
              const config = priorityConfig[notice.priority] || priorityConfig.Medium;
              const Icon = config.icon;
              return (
                <div key={notice.id} className={`bg-card rounded-2xl border ${config.border} p-5`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{notice.title}</h3>
                        {notice.pinned && (
                          <span className="text-[10px] bg-accent/10 text-accent font-medium px-2 py-0.5 rounded-full">Pinned</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{notice.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/60">
                        <span>{notice.author_name}</span>
                        <span>·</span>
                        <span>{format(new Date(notice.created_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Flights */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-4">Upcoming Flights</h2>
        {flights.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Plane className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No upcoming flights</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flights.map(flight => (
              <Link key={flight.id} to={`/flights/${flight.id}`} className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-heading font-bold text-primary">{flight.flight_number}</span>
                  <span className="text-[10px] bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">{flight.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{flight.departure}</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="flex-1 h-px bg-border" />
                    <Plane className="w-3.5 h-3.5 text-muted-foreground rotate-90" />
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <span className="font-semibold text-sm">{flight.arrival}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(flight.date), 'MMM d, yyyy · HH:mm')}
                  {flight.aircraft && <span className="ml-auto">{flight.aircraft}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <div>
          <p className="text-2xl font-heading font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
