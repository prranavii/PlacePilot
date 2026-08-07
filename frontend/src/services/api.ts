const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API Error';
    try {
      const errJson = await response.json();
      if (typeof errJson.detail === 'string') {
        errorDetail = errJson.detail;
      } else if (Array.isArray(errJson.detail)) {
        errorDetail = errJson.detail.map((d: any) => `${d.loc ? d.loc.slice(1).join('.') + ': ' : ''}${d.msg}`).join(', ');
      } else if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'object' ? JSON.stringify(errJson.detail) : String(errJson.detail);
      }
    } catch {
      // Ignore
    }
    throw new Error(errorDetail);
  }


  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me', { method: 'GET' }),
    verifyEmail: (token: string) => request(`/auth/verify?token=${token}`, { method: 'GET' }),
    forgotPassword: (email: string) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (data: any) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    testEmail: (email: string) => request(`/auth/test-email?email=${encodeURIComponent(email)}`, { method: 'POST' }),
  },
  applications: {
    list: () => request('/applications'),
    create: (data: any) => request('/applications', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => request(`/applications/${id}`),
    update: (id: string, data: any) => request(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/applications/${id}`, { method: 'DELETE' }),
    events: (id: string) => request(`/applications/${id}/events`),
  }
};
