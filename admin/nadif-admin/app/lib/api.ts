// ─── Nadif Admin API Client ──────────────────────────────────────────────────
// Centralised fetch helper. Automatically attaches the stored JWT token.

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// ─── Token helpers ────────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nadif_token');
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('nadif_user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function saveAuth(token: string, user: any) {
  localStorage.setItem('nadif_token', token);
  localStorage.setItem('nadif_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('nadif_token');
  localStorage.removeItem('nadif_user');
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiUser {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: 'ADMIN' | 'CUSTOMER' | 'CLEANER';
  createdAt: string;
  _count?: { orders: number };
}

export interface ApiCleaner {
  id: string;
  fullName: string;
  phone: string;
  bio: string | null;
  isActive: boolean;
  rating: number;
  skills: string[];
  createdAt: string;
}

export interface ApiPromo {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiHouseConfig {
  id: string;
  serviceId: string;
  type: string;
  workers: number;
  basePrice: number;
}

export interface ApiService {
  id: string;
  name: string;
  description: string;
  picture: string;
  extraWorkerPrice: number;
  durationHours: number;
  materialPrice: number;
  materialsMandatory: boolean;
  localProductPrice: number;
  importedProductPrice: number;
  productsMandatory: boolean;
  isActive: boolean;
  createdAt: string;
  houseConfigs: ApiHouseConfig[];
}

export interface ApiOrder {
  id: string;
  userId: string;
  cleanerId?: string;
  serviceId: string;
  houseConfigId: string;
  promoId?: string;
  extraWorkers: number;
  useMaterials: boolean;
  productOrigin: 'NONE' | 'LOCAL' | 'IMPORTED';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  scheduledDate: string;
  address: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; fullName: string; phone: string };
  cleaner?: ApiCleaner;
  service?: ApiService;
  houseConfig?: ApiHouseConfig;
  promo?: ApiPromo;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersApi = {
  getAll: () => apiFetch<ApiOrder[]>('/api/orders'),

  getOne: (id: string) => apiFetch<ApiOrder>(`/api/orders/${id}`),

  updateStatus: (id: string, status: ApiOrder['status']) =>
    apiFetch<ApiOrder>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  update: (id: string, data: Partial<ApiOrder>) =>
    apiFetch<ApiOrder>(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/orders/${id}`, { method: 'DELETE' }),

  createAdminOrder: (data: any) =>
    apiFetch<ApiOrder>('/api/admin/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const servicesApi = {
  getAll: () => apiFetch<ApiService[]>('/api/services', {}, false),

  getOne: (id: string) => apiFetch<ApiService>(`/api/services/${id}`, {}, false),

  create: (data: Partial<ApiService> & { houseConfigs?: any[] }) =>
    apiFetch<ApiService>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ApiService>) =>
    apiFetch<ApiService>(`/api/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/services/${id}`, { method: 'DELETE' }),
};

// ─── Admin: Users ─────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => apiFetch<ApiUser[]>('/api/admin/users'),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
};

// ─── Admin: Cleaners ──────────────────────────────────────────────────────────
export const cleanersApi = {
  getAll: () => apiFetch<ApiCleaner[]>('/api/admin/cleaners'),

  create: (data: Partial<ApiCleaner>) =>
    apiFetch<ApiCleaner>('/api/admin/cleaners', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ApiCleaner>) =>
    apiFetch<ApiCleaner>(`/api/admin/cleaners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/cleaners/${id}`, { method: 'DELETE' }),
};

// ─── Admin: Promos ────────────────────────────────────────────────────────────
export const promosApi = {
  getAll: () => apiFetch<ApiPromo[]>('/api/admin/promos'),

  create: (data: Partial<ApiPromo>) =>
    apiFetch<ApiPromo>('/api/admin/promos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ApiPromo>) =>
    apiFetch<ApiPromo>(`/api/admin/promos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/promos/${id}`, { method: 'DELETE' }),
};
