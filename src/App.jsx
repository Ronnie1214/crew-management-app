import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useState, useEffect } from 'react';
import CrewLogin from './pages/CrewLogin';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Flights from './pages/Flights';
import FlightDetail from './pages/FlightDetail';
import LOA from './pages/LOA';
import Profile from './pages/Profile';
import ManageNotices from './pages/admin/ManageNotices';
import ScheduleFlights from './pages/admin/ScheduleFlights';
import ManageCrew from './pages/admin/ManageCrew';
import ManageLOA from './pages/admin/ManageLOA';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [crewMember, setCrewMember] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('crew_session');
    if (session) {
      setCrewMember(JSON.parse(session));
    }
    setCheckingSession(false);
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth || checkingSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  if (!crewMember) {
    return <CrewLogin onLogin={(member) => setCrewMember(member)} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('crew_session');
    setCrewMember(null);
  };

  return (
    <Routes>
      <Route element={<AppLayout crewMember={crewMember} onLogout={handleLogout} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/flights/:id" element={<FlightDetail />} />
        <Route path="/loa" element={<LOA />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/notices" element={<ManageNotices />} />
        <Route path="/admin/flights" element={<ScheduleFlights />} />
        <Route path="/admin/crew" element={<ManageCrew />} />
        <Route path="/admin/loa" element={<ManageLOA />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
