import { Link, useLocation } from 'react-router-dom';
import { Plane, LayoutDashboard, Navigation, CalendarOff, UserCircle, Megaphone, PlaneTakeoff, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { hasAnyRole } from '@/lib/roleUtils';

export default function Sidebar({ crewMember, onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = hasAnyRole(crewMember, 'Executive Board', 'Senior Board');
  const isDispatcher = hasAnyRole(crewMember, 'Flight Dispatcher');

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/flights', label: 'Flights', icon: Navigation },
    { path: '/loa', label: 'Leave of Absence', icon: CalendarOff },
    { path: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  const adminItems = [
    ...(isAdmin ? [{ path: '/admin/notices', label: 'Manage Notices', icon: Megaphone }] : []),
    ...(isAdmin || isDispatcher ? [{ path: '/admin/flights', label: 'Schedule Flights', icon: PlaneTakeoff }] : []),
    ...(isAdmin ? [{ path: '/admin/crew', label: 'Manage Crew', icon: Shield }] : []),
    ...(isAdmin ? [{ path: '/admin/loa', label: 'LOA Requests', icon: CalendarOff }] : []),
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300",
      collapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-sidebar-primary-foreground text-sm truncate">Corendon Airlines</h1>
              <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">Crew Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full flex items-center justify-center hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-sidebar-foreground" /> : <ChevronLeft className="w-3 h-3 text-sidebar-foreground" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {!collapsed && <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest px-3 mb-2">Main</p>}
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
              location.pathname === item.path
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {adminItems.length > 0 && (
          <>
            {!collapsed && <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest px-3 mt-6 mb-2">Administration</p>}
            {adminItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  location.pathname === item.path
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3 px-2 py-2", collapsed && "justify-center")}>
          <div className="w-8 h-8 bg-sidebar-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-sidebar-foreground">{crewMember?.display_name?.[0]}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{crewMember?.display_name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{(crewMember?.roles || [crewMember?.role]).join(', ')}</p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-all w-full mt-1",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
