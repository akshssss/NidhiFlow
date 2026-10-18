/**
 * NidhiFlow API client
 */

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nidhiflow_token') : null;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errBody: any;
    try {
      errBody = await res.json();
    } catch {
      errBody = { message: res.statusText };
    }
    const message = Array.isArray(errBody.message)
      ? errBody.message.join(', ')
      : errBody.message || 'An error occurred';
    throw new ApiError(res.status, message, errBody);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

  // Auth endpoints
  loginStartup: (data: any) => api.post<any>('/auth/startup/login', data),
  registerStartup: (data: any) => api.post<any>('/auth/startup/register', data),
  loginInvestor: (data: any) => api.post<any>('/auth/investor/login', data),
  registerInvestor: (data: any) => api.post<any>('/auth/investor/register', data),
  loginAdmin: (data: any) => api.post<any>('/auth/admin/login', data),
  getMe: () => api.get<any>('/auth/me'),
  logout: () => api.post<any>('/auth/logout'),

  // Startups endpoints
  getStartups: (params?: Record<string, any>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/startups${q}`);
  },
  getStartupById: (id: string) => api.get<any>(`/startups/${id}`),
  getMyStartup: () => api.get<any>('/startups/me'),
  getMyStartupDashboard: () => api.get<any>('/startups/me/dashboard'),
  updateMyStartup: (data: any) => api.put<any>('/startups/me', data),
  postStartupUpdate: (data: any) => api.post<any>('/startups/me/updates', data),

  // Investors endpoints
  getInvestors: (params?: Record<string, any>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/investors${q}`);
  },
  getInvestorById: (id: string) => api.get<any>(`/investors/${id}`),
  getMyInvestor: () => api.get<any>('/investors/me'),
  getMyInvestorDashboard: () => api.get<any>('/investors/me/dashboard'),
  updateMyInvestor: (data: any) => api.put<any>('/investors/me', data),
  getSavedStartups: (page = 1) => api.get<any>(`/investors/me/saved?page=${page}`),
  saveStartup: (startupId: string) => api.post<any>(`/investors/me/saved/${startupId}`),
  unsaveStartup: (startupId: string) => api.delete<any>(`/investors/me/saved/${startupId}`),

  // Deal Flow / Interests
  expressInterest: (data: any) => api.post<any>('/interests', data),
  getStartupInterests: (params?: any) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/interests/startup${q}`);
  },
  getInvestorInterests: (params?: any) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/interests/investor${q}`);
  },
  acceptInterest: (id: string) => api.put<any>(`/interests/${id}/accept`),
  declineInterest: (id: string) => api.put<any>(`/interests/${id}/decline`),
  commitInterest: (id: string) => api.put<any>(`/interests/${id}/commit`),

  // Verification
  submitStartupVerification: (data: any) => api.post<any>('/verification/startup/submit', data),
  submitInvestorVerification: (data: any) => api.post<any>('/verification/investor/submit', data),
  getVerificationQueue: () => api.get<any>('/verification/queue'),
  reviewStartupVerification: (id: string, data: any) =>
    api.put<any>(`/verification/startup/${id}/review`, data),
  reviewInvestorVerification: (id: string, data: any) =>
    api.put<any>(`/verification/investor/${id}/review`, data),

  // Chat
  getChatRooms: () => api.get<any>('/chat/rooms'),
  getChatMessages: (roomId: string, page = 1) =>
    api.get<any>(`/chat/rooms/${roomId}/messages?page=${page}`),
  sendMessage: (roomId: string, data: any) =>
    api.post<any>(`/chat/rooms/${roomId}/messages`, data),
  markChatRead: (roomId: string) => api.post<any>(`/chat/rooms/${roomId}/read`),

  // Reviews
  createReview: (data: any) => api.post<any>('/reviews', data),
  getInvestorReviews: (investorId: string) => api.get<any>(`/reviews/investor/${investorId}`),
  replyReview: (reviewId: string, reply: string) =>
    api.post<any>(`/reviews/${reviewId}/reply`, { reply }),
  reportReview: (reviewId: string, reason: string) =>
    api.post<any>(`/reviews/${reviewId}/report`, { reason }),
  moderateReview: (reviewId: string, isHidden: boolean) =>
    api.put<any>(`/reviews/${reviewId}/moderate`, { isHidden }),

  // Leaderboard
  getStartupLeaderboard: (params?: any) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/leaderboard/startups${q}`);
  },
  getInvestorLeaderboard: (page = 1) => api.get<any>(`/leaderboard/investors?page=${page}`),
  recomputeLeaderboard: () => api.post<any>('/leaderboard/recompute'),

  // Admin
  getAdminDashboard: () => api.get<any>('/admin/dashboard'),
  getAdminUsers: (params?: any) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any>(`/admin/users${q}`);
  },
  toggleUserStatus: (userId: string, isActive: boolean) =>
    api.put<any>(`/admin/users/${userId}/status`, { isActive }),
  getReportedReviews: () => api.get<any>('/admin/reported-reviews'),
  getAuditLogs: () => api.get<any>('/admin/audit-logs'),

  // Notifications
  getNotifications: () => api.get<any>('/notifications'),
  getUnreadNotificationsCount: () => api.get<any>('/notifications/unread-count'),
  markNotificationRead: (id: string) => api.put<any>(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put<any>('/notifications/read-all'),
};
