import { useAuthContext } from './AuthProvider';

export const useAuth = () => {
  const { token, login, logout } = useAuthContext();
  const isAuthenticated = !!token;
  // Try to decode JWT payload to extract roles and user info
  let roles: string[] = [];
  let user: { email?: string; role?: string; userId?: string } | null = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || '')) || {};
      const raw = payload['roles'] ?? payload['role'] ?? [];
      if (Array.isArray(raw)) roles = raw.map((r) => String(r));
      else if (typeof raw === 'string') roles = [raw];
      
      user = {
        email: payload['email'] || payload['sub'] || payload['unique_name'],
        role: roles[0] || 'User',
        userId: payload['userId'] || payload['nameid'] || payload['sub']
      };
    } catch {}
  }
  const isInRole = (r: string) => roles.includes(r);
  const isAdmin = isInRole('Admin');
  return { token, isAuthenticated, login, logout, roles, isInRole, isAdmin, user };
};
