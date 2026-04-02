import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plane, Clock, Users, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      const [f, a] = await Promise.all([
        base44.entities.Flight.list('date', 50),
        base44.entities.FlightAllocation.list('-created_date', 200),
      ]);
      setFlights(f);
      setAllocations(a);
      setLoading(false);
    };
    load();
  }, []);

  const getAllocationCount = (flightId) => allocations.filter(a => a.flight_id === flightId).length;

  const filtered = flights.filter(f => {
    const matchesSearch = !search || 
      f.flight_number?.toLowerCase().includes(search.toLowerCase()) ||
      f.departure?.toLowerCase().includes(search.toLowerCase()) ||
      f.arrival?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Flight Schedule</h1>
        <p className="text-muted-foreground text-sm mt-1">View and allocate for upcoming flights</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flights..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Boarding">Boarding</SelectItem>
            <SelectItem value="In Flight">In Flight</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flight Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Plane className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No flights found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(flight => {
            const crewCount = getAllocationCount(flight.id);
            const statusColors = {
              Scheduled: 'bg-primary/10 text-primary',
              Boarding: 'bg-yellow-500/10 text-yellow-600',
              'In Flight': 'bg-green-500/10 text-green-600',
              Completed: 'bg-muted text-muted-foreground',
              Cancelled: 'bg-red-500/10 text-red-600',
            };
            return (
              <Link
                key={flight.id}
                to={`/flights/${flight.id}`}
                className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading font-bold text-lg text-primary">{flight.flight_number}</span>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColors[flight.status] || ''}`}>
                    {flight.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center">
                    <p className="font-bold text-lg">{flight.departure}</p>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="flex-1 h-px bg-border" />
                    <Plane className="w-4 h-4 text-accent rotate-90" />
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{flight.arrival}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(flight.date), 'MMM d · HH:mm')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {crewCount}/{flight.max_crew || 6} crew
                  </div>
                </div>

                {flight.aircraft && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">{flight.aircraft}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
