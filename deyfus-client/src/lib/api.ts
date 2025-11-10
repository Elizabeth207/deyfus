import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { 
  Branch,
  Category,
  InventoryItem,
  Movement,
  StockAlert 
} from './types';

// Fallback to localhost:4000 if VITE_API_URL is not set (server defaults to 4000)
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const API_BASE = BASE;

function buildUrl(path: string, params?: Record<string, any>) {
  // Asegurarnos de que todas las rutas empiecen con /api
  const normalizedPath = path.startsWith('/api') ? path : `/api${path}`;
  const url = new URL(normalizedPath, BASE || window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export async function apiFetch(path: string, options: {
  method?: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
} = {}, branchId?: number | string) {
  const { method = 'GET', params, body, headers = {} } = options;

  const mergedParams = { ...(params || {}) } as Record<string, any>;
  if (branchId !== undefined && branchId !== null) {
    // attach branchId to query for GET/DELETE, for others we put in body if it's an object
    if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') mergedParams.branchId = branchId;
  }

  const url = buildUrl(path, mergedParams);

  const token = localStorage.getItem('token');

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'DELETE') {
    const payload = typeof body === 'object' ? { ...body } : body;
    if (branchId !== undefined && branchId !== null && typeof payload === 'object') payload.branchId = branchId;
    fetchOptions.body = JSON.stringify(payload);
  }

  const res = await fetch(url, fetchOptions);
  
  // Handle 401 - Force logout
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (logoutCallback) {
      logoutCallback();
    }
    throw { message: 'Sesión expirada. Por favor, inicia sesión de nuevo.', status: 401, url };
  }

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      // If backend returned HTML (e.g. Vite index.html because wrong port), include text for debugging
      const errPayload = (json && typeof json === 'object') ? json : { message: res.statusText || 'Request failed', status: res.status, url, text };
      throw errPayload;
    }
    return json;
  } catch (err) {
    // If JSON.parse failed, wrap the raw text so callers can surface it
    if (err instanceof SyntaxError) {
      throw { message: 'Invalid JSON response', status: res.status, url, text };
    }
    throw err;
  }
}

export function useApi() {
  const { user, logout } = useAuth();
  
  // Register logout callback so apiFetch can call it on 401
  useCallback(() => {
    setLogoutCallback(() => logout());
  }, [logout])();

  // Only auto-attach branchId for non-admin users (so ADMIN can list across branches)
  const autoBranch = user && user.role !== 'ADMIN' ? user.branchId : undefined;

  const get = useCallback((path: string, params?: Record<string, any>) => apiFetch(path, { method: 'GET', params }, autoBranch), [autoBranch]);
  const post = useCallback((path: string, body?: any) => apiFetch(path, { method: 'POST', body }, autoBranch), [autoBranch]);
  const put = useCallback((path: string, body?: any) => apiFetch(path, { method: 'PUT', body }, autoBranch), [autoBranch]);
  const del = useCallback((path: string, params?: Record<string, any>) => apiFetch(path, { method: 'DELETE', params }, autoBranch), [autoBranch]);

  const unwrap = (res: any) => {
    if (res && res.data !== undefined && res.data !== null) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  };

  const apiFns = {
    // Branches
    getBranches: async (): Promise<{ data: Branch[] }> => {
      const res = await get('/branches');
      return { data: unwrap(res) };
    },

    // Categories
    getCategories: async (): Promise<{ data: Category[] }> => {
      const res = await get('/categories');
      return { data: unwrap(res) };
    },

    // Products
    getProducts: async (params?: Record<string, any>) => {
      const res = await get('/products', params);
      return { data: unwrap(res) };
    },
    getProductById: async (id: number) => {
      const res = await get(`/products/${id}`);
      return { data: unwrap(res) };
    },

    // Inventory (server uses explicit routes under /api/inventory)
    getInventory: async (filters?: any): Promise<{ data: InventoryItem[] }> => {
      const res = await get('/inventory/list', filters);
      return { data: unwrap(res) };
    },
    createInventory: async (payload: any) => {
      const res = await post('/inventory/create', payload);
      return { data: unwrap(res) };
    },
    updateInventory: async (id: number, payload: any) => {
      const res = await put(`/inventory/update/${id}`, payload);
      return { data: unwrap(res) };
    },
    deleteInventory: async (id: number) => {
      const res = await del(`/inventory/delete/${id}`);
      return { data: unwrap(res) };
    },

    // Movements & adjustments
    getMovements: async (inventoryId: number): Promise<{ data: Movement[] }> => {
      const res = await get(`/inventory/movements/${inventoryId}`);
      return { data: unwrap(res) };
    },
    adjustStock: async (inventoryId: number, data: any) => {
      const res = await post(`/inventory/adjust/${inventoryId}`, data);
      return { data: unwrap(res) };
    },

    // Alerts: backend currently creates alerts but doesn't expose dedicated endpoints in routes; use a safe fallback
    // Alerts: backend does not expose a dedicated alerts GET endpoint currently.
    // Return empty array to avoid 404 noise in the frontend until an endpoint is added.
    getAlerts: async (): Promise<{ data: StockAlert[] }> => {
      return { data: [] };
    },
    resolveAlert: async (_alertId: number) => {
      // If an alerts resolve endpoint is later added, we can call it here.
      // For now, simulate success by returning an empty object.
      return { data: {} };
    }
  };

  return { get, post, put, del, ...apiFns };
}

export type Api = ReturnType<typeof useApi>;
