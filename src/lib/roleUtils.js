// Helper to check roles - supports both old string `role` and new array `roles`
export const hasRole = (crewMember, role) => {
  if (crewMember?.roles) return crewMember.roles.includes(role);
  return crewMember?.role === role;
};

export const hasAnyRole = (crewMember, ...roles) => roles.some(r => hasRole(crewMember, r));

export const getRolesArray = (crewMember) => {
  if (crewMember?.roles) return crewMember.roles;
  if (crewMember?.role) return [crewMember.role];
  return [];
};

export const ALL_ROLES = [
  "Executive Board",
  "Senior Board",
  "Recruitment",
  "Cabin Operations",
  "Flight Deck",
  "Airside Operations",
  "Security",
  "Flight Dispatcher",
];

export const ROLE_COLORS = {
  'Executive Board': 'bg-accent/10 text-accent border-accent/20',
  'Senior Board': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Recruitment': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Cabin Operations': 'bg-primary/10 text-primary border-primary/20',
  'Flight Deck': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Airside Operations': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'Security': 'bg-red-500/10 text-red-600 border-red-500/20',
  'Flight Dispatcher': 'bg-sky-500/10 text-sky-600 border-sky-500/20',
};
