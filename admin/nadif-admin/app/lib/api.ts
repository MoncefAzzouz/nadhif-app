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
    const errorMsg = body.error || `API error ${res.status}`;
    if (path !== '/api/auth/login' && (res.status === 401 || res.status === 403 || errorMsg === 'Invalid or expired token')) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new Error(errorMsg);
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
  typeAr?: string;
  typeFr?: string;
  workers: number;
  basePrice: number;
  rapidBasePrice: number;
  durationHours: number;
}

export interface ApiService {
  id: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  description: string;
  descriptionAr?: string;
  descriptionFr?: string;
  picture: string;
  extraWorkerPrice: number;
  rapidExtraWorkerPrice: number;
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
  serviceId?: string | null;
  houseConfigId?: string | null;
  categoryId?: string | null;
  categoryServiceId?: string | null;
  promoId?: string;
  extraWorkers: number;
  useMaterials: boolean;
  productOrigin: 'NONE' | 'LOCAL' | 'IMPORTED';
  status: 'PENDING' | 'CALLED_NOT_PAID' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  scheduledDate: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isRapid?: boolean;
  sizeM2?: number;
  clientNote?: string;
  housePictures?: string[];
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; fullName: string; phone: string };
  cleaner?: ApiCleaner;
  service?: ApiService | null;
  houseConfig?: ApiHouseConfig | null;
  category?: ApiCategory | null;
  categoryService?: ApiCategoryService | null;
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

  create: (data: Omit<Partial<ApiService>, 'houseConfigs'> & { houseConfigs?: any[] }) =>
    apiFetch<ApiService>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Omit<Partial<ApiService>, 'houseConfigs'> & { houseConfigs?: any[] }) =>
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

// ─── Types: Categories ────────────────────────────────────────────────────────
export interface ApiCategoryService {
  id: string;
  categoryId: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  workers: number;
  basePrice: number;
  rapidBasePrice: number;
  durationHours: number;
}

export interface ApiCategory {
  id: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  description: string;
  descriptionAr?: string;
  descriptionFr?: string;
  picture: string;
  materialPrice: number;
  materialsMandatory: boolean;
  localProductPrice: number;
  importedProductPrice: number;
  productsMandatory: boolean;
  isActive: boolean;
  createdAt: string;
  categoryServices: ApiCategoryService[];
}

// ─── Admin: Categories ────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => apiFetch<ApiCategory[]>('/api/admin/categories'),

  create: (data: Omit<Partial<ApiCategory>, 'categoryServices'> & { categoryServices?: any[] }) =>
    apiFetch<ApiCategory>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Omit<Partial<ApiCategory>, 'categoryServices'> & { categoryServices?: any[] }) =>
    apiFetch<ApiCategory>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/categories/${id}`, { method: 'DELETE' }),
};

// ─── Types: Pages / CMS ──────────────────────────────────────────────────────
export interface ApiFaq {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
}

export interface ApiAboutUs {
  vision: string;
  hotline: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  wilayaCenter: string;
}

// ─── Admin/Public: Pages / CMS ───────────────────────────────────────────────
export const pagesApi = {
  faqs: {
    getAll: () => apiFetch<ApiFaq[]>('/api/admin/pages/faqs'),
    create: (data: Partial<ApiFaq>) =>
      apiFetch<ApiFaq>('/api/admin/pages/faqs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<ApiFaq>) =>
      apiFetch<ApiFaq>(`/api/admin/pages/faqs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/pages/faqs/${id}`, { method: 'DELETE' }),
  },
  privacy: {
    get: () => apiFetch<{ privacyPolicy: string }>('/api/pages/privacy', {}, false),
    update: (privacyPolicy: string) =>
      apiFetch<{ privacyPolicy: string }>('/api/admin/pages/privacy', {
        method: 'POST',
        body: JSON.stringify({ privacyPolicy }),
      }),
  },
  about: {
    get: () => apiFetch<ApiAboutUs | null>('/api/pages/about', {}, false),
    update: (data: ApiAboutUs) =>
      apiFetch<ApiAboutUs>('/api/admin/pages/about', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

export const lockedDaysApi = {
  getAll: () => apiFetch<string[]>('/api/admin/locked-days'),
  update: (lockedDays: string[]) => 
    apiFetch<string[]>('/api/admin/locked-days', {
      method: 'POST',
      body: JSON.stringify({ lockedDays }),
    }),
};

export interface ApiSkill {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
  color: string;
  services: ApiService[];
  categories: ApiCategory[];
  subscriptionServiceTiers?: ApiSubscriptionServiceTier[];
  createdAt: string;
}

export const skillsApi = {
  getAll: () => apiFetch<ApiSkill[]>('/api/admin/skills'),
  create: (payload: { name: string; nameAr?: string; nameFr?: string; description?: string; color?: string; serviceIds?: string[]; categoryIds?: string[]; serviceTierIds?: string[] }) =>
    apiFetch<ApiSkill>('/api/admin/skills', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: { name: string; nameAr?: string; nameFr?: string; description?: string; color?: string; serviceIds?: string[]; categoryIds?: string[]; serviceTierIds?: string[] }) =>
    apiFetch<ApiSkill>(`/api/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/skills/${id}`, { method: 'DELETE' }),
};

export interface ApiSubscriptionPropertyType {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiSubscriptionServiceTier {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
  durationHours: number;
  workers: number;
  isActive: boolean;
  createdAt: string;
}

export interface ApiSubscriptionPayment {
  id: string;
  subscriptionId: string;
  amount: number;
  note: string | null;
  createdAt: string;
}

export interface ApiSubscriptionSession {
  id: string;
  subscriptionId: string;
  scheduledDate: string;
  durationHours: number;
  cleanerId: string | null;
  status: string;
  createdAt: string;
  cleaner?: ApiCleaner;
}

export interface ApiSubscription {
  id: string;
  userId: string | null;
  fullName: string;
  phone: string;
  propertyTypeId: string;
  surfaceM2: number;
  roomsToClean: number;
  pictures: string[];
  address: string;
  latitude: number | null;
  longitude: number | null;
  serviceTierId: string;
  daysPerWeek: number;
  monthlyPrice: number | null;
  amountPaid: number;
  adminNote: string | null;
  status: 'PENDING' | 'DAYS_PROPOSED' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  user?: ApiUser | null;
  propertyType?: ApiSubscriptionPropertyType;
  serviceTier?: ApiSubscriptionServiceTier;
  sessions?: ApiSubscriptionSession[];
  payments?: ApiSubscriptionPayment[];
}

export const propertyTypesApi = {
  getAll: () => apiFetch<ApiSubscriptionPropertyType[]>('/api/subscriptions/property-types'),
  create: (data: Partial<ApiSubscriptionPropertyType>) =>
    apiFetch<ApiSubscriptionPropertyType>('/api/subscriptions/property-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ApiSubscriptionPropertyType>) =>
    apiFetch<ApiSubscriptionPropertyType>(`/api/subscriptions/property-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/subscriptions/property-types/${id}`, { method: 'DELETE' }),
};

export const serviceTiersApi = {
  getAll: () => apiFetch<ApiSubscriptionServiceTier[]>('/api/subscriptions/service-tiers'),
  create: (data: Partial<ApiSubscriptionServiceTier>) =>
    apiFetch<ApiSubscriptionServiceTier>('/api/subscriptions/service-tiers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ApiSubscriptionServiceTier>) =>
    apiFetch<ApiSubscriptionServiceTier>(`/api/subscriptions/service-tiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/subscriptions/service-tiers/${id}`, { method: 'DELETE' }),
};

export interface ApiAvailableDaysResponse {
  subscriptionId: string;
  daysPerWeek: number;
  workersNeeded: number;
  durationHours: number;
  weeks: {
    week: number;
    days: {
      date: string;
      dayName: string;
      availableCleanerCount: number;
      isAvailable: boolean;
      isLocked?: boolean;
    }[];
  }[];
}

export const subscriptionsApi = {
  getAll: () => apiFetch<ApiSubscription[]>('/api/subscriptions'),
  create: (data: Partial<ApiSubscription>) =>
    apiFetch<ApiSubscription>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOne: (id: string) => apiFetch<ApiSubscription>(`/api/subscriptions/${id}`),
  update: (id: string, data: Partial<ApiSubscription>) =>
    apiFetch<ApiSubscription>(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/subscriptions/${id}`, { method: 'DELETE' }),
  getAvailableDays: (id: string) =>
    apiFetch<ApiAvailableDaysResponse>(`/api/subscriptions/${id}/available-days`),
  setSessions: (id: string, sessions: { scheduledDate: string; durationHours: number; cleanerId?: string | null }[]) =>
    apiFetch<ApiSubscriptionSession[]>(`/api/subscriptions/${id}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ sessions }),
    }),
  recordPayment: (id: string, amount: number, note?: string) =>
    apiFetch<{ payment: ApiSubscriptionPayment; subscription: ApiSubscription }>(`/api/subscriptions/${id}/payments`, {
      method: 'POST',
      body: JSON.stringify({ amount, note }),
    }),
};



// ─── Admin: Push Notifications ───────────────────────────────────────────────
export interface BroadcastResult {
  recipients: number;
  success: number;
  failure: number;
}

export const notificationsApi = {
  broadcast: (payload: { title: string; body: string; audience: 'all' | 'cleaners' | 'phone'; phone?: string }) =>
    apiFetch<BroadcastResult>('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
