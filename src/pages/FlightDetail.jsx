import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, ArrowLeft, Clock, Users, UserPlus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';
import { getRolesArray } from '@/lib/roleUtils';

export default function FlightDetail() {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [position, setPosition] = useState('');
  const crewMember = JSON.parse(localStorage.getItem('crew_session'));

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    const [flights, allocs] = await Promise.all([
      base44.entities.Flight.filter({ id }),
      base44.entities.FlightAllocation.filter({ flight_id: id }),
    ]);
    if (flights.length > 0) setFlight(flights[0]);
    setAllocations(allocs);
    setLoading(false);
  };

  const isAllocated = allocations.some(a => a.crew_member_id === crewMember?.id);
  const myAllocation = allocations.find(a => a.crew_member_id === crewMember?.id);
  const isFull = allocations.length >= (flight?.max_crew || 6);

  const handleAllocate = async () => {
    setAllocating(true);
    await base44.entities.FlightAllocation.create({
      flight_id: id,
      crew_member_id: crewMember.id,
      crew_member_name: crewMember.display_name,
      crew_member_roles: getRolesArray(crewMember).join(', '),
      position: position.trim() || 'Crew',
    });
    await loadData();
    setAllocating(false);
  };

  const handleDeallocate = async () => {
    setAllocating(true);
    if (myAllocation) await base44.entities.FlightAllocation.delete(myAllocation.id);
    await loadData();
    setAllocating(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!flight) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Flight not found</p>
        <Link to="/flights" className="text-primary text-sm mt-2 inline-block">Back to Flights</Link>
      </div>
    );
  }

  const statusColors = {
    Scheduled: 'bg-primary/10 text-primary border-primary/20',
    Boarding: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    'In Flight': 'bg-green-500/10 text-green-600 border-green-500/20',
    Completed: 'bg-muted text-muted-foreground border-border',
    Cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/flights" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Flights
      </Link>

      {/* Flight Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-primary">{flight.flight_number}</h1>
          <span className={`text-sm font-medium px-3 py-1 rounded-full border ${statusColors[flight.status] || ''}`}>
            {flight.status}
          </span>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl font-heading font-bold">{flight.departure}</p>
            <p className="text-xs text-muted-foreground mt-1">Departure</p>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-accent rotate-90" />
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="text-center">
            <p className="text-3xl font-heading font-bold">{flight.arrival}</p>
            <p className="text-xs text-muted-foreground mt-1">Arrival</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {format(new Date(flight.date), 'MMM d, yyyy · HH:mm')}
          </div>
          {flight.aircraft && <div className="flex items-center gap-2"><Plane className="w-4 h-4" />{flight.aircraft}</div>}
          <div className="flex items-center gap-2"><Users className="w-4 h-4" />{allocations.length}/{flight.max_crew || 6} crew</div>
        </div>
      </div>

      {/* Allocate */}
      {flight.status === 'Scheduled' && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-heading font-semibold mb-4">Flight Allocation</h2>
          {isAllocated ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-600 font-medium">
                You are allocated{myAllocation?.position ? ` as ${myAllocation.position}` : ''}
              </p>
              <Button variant="outline" size="sm" onClick={handleDeallocate} disabled={allocating} className="text-red-500 border-red-200 hover:bg-red-50">
                <UserMinus className="w-4 h-4 mr-2" /> Remove Allocation
              </Button>
            </div>
          ) : isFull ? (
            <p className="text-sm text-muted-foreground">This flight is full.</p>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-1.5 block">Position (optional)</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Captain, Cabin Crew..." />
              </div>
              <Button onClick={handleAllocate} disabled={allocating} className="bg-primary">
                <UserPlus className="w-4 h-4 mr-2" /> Allocate
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Crew List */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-heading font-semibold mb-4">Allocated Crew ({allocations.length})</h2>
        {allocations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No crew allocated yet.</p>
        ) : (
          <div className="space-y-2">
            {allocations.map(alloc => (
              <div key={alloc.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{alloc.crew_member_name?.[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alloc.crew_member_name}</p>
                  {alloc.crew_member_roles && <p className="text-xs text-muted-foreground">{alloc.crew_member_roles}</p>}
                </div>
                {alloc.position && (
                  <span className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">
                    {alloc.position}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
