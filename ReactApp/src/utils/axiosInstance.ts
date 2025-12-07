import axios from 'axios';

// Prefer API Gateway if provided; otherwise we'll dynamically route per service
const GATEWAY_URL = import.meta.env?.VITE_API_GATEWAY as string | undefined;

export const axiosInstance = axios.create({
  // If no gateway is provided, do not set a global baseURL so that
  baseURL: GATEWAY_URL || undefined,
  withCredentials: false,
});

// Map first path segment to microservice port when no gateway is defined
function resolveServiceBase(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const seg = parts[0] === 'api' ? (parts[1] || '') : (parts[0] || '');
  const clean = seg.toLowerCase().split('?')[0]; // strip query string
  switch (clean) {
    case 'users':
      return 'http://localhost:8080';
    case 'trainings':
      return 'http://localhost:8081';
    case 'risks':
      return 'http://localhost:8082';
    case 'incidents':
      return 'http://localhost:8083';
    case 'documents':
      return 'http://localhost:8084';
    case 'reports':
      return 'http://localhost:8085';
    case 'vision':
      return 'http://localhost:8086';
    case 'communications':
      return 'http://localhost:8091';
    case 'auth':
      // Auth endpoints are served by PersonnelService (TC/Telefon ile giriş)
      return 'http://localhost:8089';
    case 'exams':
    case 'assignments':
    case 'attempts':
    case 'training-exams':
    case 'personnel-exams':
      return 'http://localhost:8087';
    case 'personnel':
    case 'companies':
      return 'http://localhost:8089';
    case 'isgexpert':
      return 'http://localhost:8092';
    case 'summary':
      return 'http://localhost:8087';
    case 'daily-isg-reports':
    case 'nonconformities':
    case 'warnings':
    case 'penalties':
    case 'activities':
    case 'correctiveactions':
    case 'preventiveactions':
    case 'photos':
    case 'toolboxes':
    case 'controlforms':
    case 'controlformexecutions':
    case 'machinetemplates':
    case 'controlformtemplates':
    case 'machines':
    case 'reminders':
      return 'http://localhost:8091';
    case 'ppeitems':
    case 'ppeassignments':
    case 'ppeissues':
      return 'http://localhost:8088';
    // Note: nonconformities is part of ActivitiesService and is proxied via Vite in dev
    default:
      // Fallback to users-service for auth-related or generic calls
      return 'http://localhost:8080';
  }
}

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  // If no gateway is configured, dynamically set baseURL per request
  // Dev proxy is allowed for PPE/Personnel; Activities endpoints are forced direct to avoid proxy 404s
  if (!GATEWAY_URL && config.url) {
    const url = config.url;
    const isPpeEndpoint = url.startsWith('/api/ppeitems') || url.startsWith('/api/ppeassignments') || url.startsWith('/api/ppeissues');
    const isPersonnelEndpoint = url.startsWith('/api/personnel') || url.startsWith('/api/auth') || url.startsWith('/api/companies');
    const isActivitiesEndpoint =
      url.startsWith('/api/correctiveactions') ||
      url.startsWith('/api/preventiveactions') ||
      url.startsWith('/api/photos') ||
      url.startsWith('/api/warnings') ||
      url.startsWith('/api/penalties') ||
      url.startsWith('/api/nonconformities') ||
      url.startsWith('/api/communications') ||
      url.startsWith('/api/daily-isg-reports') ||
      url.startsWith('/api/toolboxes') ||
      url.startsWith('/api/controlforms') ||
      url.startsWith('/api/machinetemplates') ||
      url.startsWith('/api/controlformtemplates') ||
      url.startsWith('/api/machines') ||
      url.startsWith('/api/reminders');
    const isDev = typeof window !== 'undefined' && window.location && window.location.port === '5173';
    
    console.log('AxiosInstance Debug:', { url, isDev, isActivitiesEndpoint, GATEWAY_URL });
    
    // In dev mode, use Vite proxy for Activities endpoints to avoid CORS issues
    if (isDev && isActivitiesEndpoint) {
      console.log('Using Vite proxy for Activities endpoint:', url);
      // Don't set baseURL, let Vite proxy handle it
    }
    else if (isActivitiesEndpoint) {
      const base = resolveServiceBase(url);
      console.log('Setting baseURL to:', base);
      config.baseURL = base;
    }
    else if (!(isDev && (isPpeEndpoint || isPersonnelEndpoint))) {
      const base = resolveServiceBase(url);
      console.log('Setting baseURL to:', base);
      config.baseURL = base;
    } else {
      console.log('Using Vite proxy for:', url);
    }
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        // Clear stale token
        localStorage.removeItem('auth_token');
      } catch {}
      const failedUrl = error?.config?.url || '';
      // eslint-disable-next-line no-console
      console.warn('Unauthorized (401) for request:', failedUrl);
      if (typeof window !== 'undefined') {
        // Redirect to login route if available
        const current = window.location.pathname + window.location.search;
        const loginPath = '/login';
        if (!window.location.pathname.startsWith(loginPath)) {
          window.location.assign(`${loginPath}?returnUrl=${encodeURIComponent(current)}`);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
