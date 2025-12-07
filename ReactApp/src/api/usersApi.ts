import { axiosInstance } from '@utils/axiosInstance';

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  tcNo?: string;
  hireDate?: string;
  isActive?: boolean;
  lastLoginDate?: string;
  createdAt?: string;
};

// Backend generic response wrapper
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
};

// Backend UsersService DTO
type BackendUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  phoneNumber?: string | null;
  tcNo?: string | null;
  department?: string | null;
  position?: string | null;
  hireDate?: string | null;
  isActive?: boolean;
  lastLoginDate?: string | null;
  createdAt?: string | null;
};

export async function fetchUsers(): Promise<User[]> {
  const { data } = await axiosInstance.get<ApiResponse<BackendUser[]>>('/api/users');
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map(u => ({
    id: String(u.id),
    email: u.email,
    fullName: `${u.firstName} ${u.lastName}`.trim(),
    role: u.roleName,
    firstName: u.firstName,
    lastName: u.lastName,
    phoneNumber: u.phoneNumber ?? undefined,
    department: u.department ?? undefined,
    position: u.position ?? undefined,
    tcNo: u.tcNo ?? undefined,
    hireDate: u.hireDate ?? undefined,
    isActive: u.isActive,
    lastLoginDate: u.lastLoginDate ?? undefined,
    createdAt: u.createdAt ?? undefined,
  }));
}

export async function fetchUserById(id: string): Promise<User> {
  const { data } = await axiosInstance.get<ApiResponse<BackendUser>>(`/api/users/${id}`);
  const u = data.data;
  return {
    id: String(u.id),
    email: u.email,
    fullName: `${u.firstName} ${u.lastName}`.trim(),
    role: u.roleName,
    firstName: u.firstName,
    lastName: u.lastName,
    phoneNumber: u.phoneNumber ?? undefined,
    department: u.department ?? undefined,
    position: u.position ?? undefined,
    tcNo: u.tcNo ?? undefined,
    hireDate: u.hireDate ?? undefined,
    isActive: u.isActive,
    lastLoginDate: u.lastLoginDate ?? undefined,
    createdAt: u.createdAt ?? undefined,
  };
}

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number; // Backend expects RoleId
  password?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  tcNo?: string;
  hireDate?: string;
  isActive?: boolean;
};

export async function createUser(payload: CreateUserInput): Promise<User> {
  // Map to backend DTO
  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    roleId: payload.roleId,
    // Backend register expects password; fall back to a safe default if not provided
    password: payload.password || 'Passw0rd!',
    phoneNumber: payload.phoneNumber,
    department: payload.department,
    position: payload.position,
    tcNo: payload.tcNo,
    hireDate: payload.hireDate,
    isActive: payload.isActive ?? true,
  };
  // NOTE: UsersController exposes POST /api/users/register (returns AuthResponseDto), not /api/users
  await axiosInstance.post<ApiResponse<any>>('/api/users/register', body);
  // Synthesize a user object from input; the list will be refreshed by react-query invalidate
  return {
    id: 'temp',
    email: payload.email,
    fullName: `${payload.firstName} ${payload.lastName}`.trim(),
    role: '',
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber,
    department: payload.department,
    position: payload.position,
    tcNo: payload.tcNo,
    hireDate: payload.hireDate,
    isActive: payload.isActive ?? true,
  };
}

export async function updateUser(id: string, payload: Partial<User>): Promise<User> {
  const roleNameToId: Record<string, number> = {
    Admin: 1,
    Manager: 2,
    Supervisor: 3,
    Employee: 4,
    Doctor: 5,
    Inspector: 6,
  };
  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    roleId: (payload as any).roleId ?? (payload.role ? roleNameToId[payload.role] : undefined),
    phoneNumber: payload.phoneNumber,
    department: payload.department,
    position: payload.position,
    tcNo: payload.tcNo,
    hireDate: payload.hireDate,
    isActive: payload.isActive,
  };
  const { data } = await axiosInstance.put<ApiResponse<BackendUser>>(`/api/users/${id}` , body);
  const u = data.data;
  return {
    id: String(u.id),
    email: u.email,
    fullName: `${u.firstName} ${u.lastName}`.trim(),
    role: u.roleName,
    firstName: u.firstName,
    lastName: u.lastName,
    phoneNumber: u.phoneNumber ?? undefined,
    department: u.department ?? undefined,
    position: u.position ?? undefined,
    tcNo: u.tcNo ?? undefined,
    hireDate: u.hireDate ?? undefined,
    isActive: u.isActive,
    lastLoginDate: u.lastLoginDate ?? undefined,
    createdAt: u.createdAt ?? undefined,
  };
}

export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`/api/users/${id}`);
}
