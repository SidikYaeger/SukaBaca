/**
 * Core HTTP Client Wrapper with JWT Injection and Error Normalization
 */

const AUTH_STORAGE_KEY = 'sukabaca_auth';

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.profile?.token || null;
  } catch {
    return null;
  }
};

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, user: null, profile: null };
    const parsed = JSON.parse(raw);
    if (parsed && parsed.isAuthenticated && parsed.profile?.token) {
      return parsed;
    }
  } catch {}
  return { isAuthenticated: false, user: null, profile: null };
};

export const setStoredAuth = (user) => {
  const usernameStr = typeof user === 'object' && user !== null 
    ? (user.username || user.name || 'User') 
    : (user || '');
  const data = { 
    isAuthenticated: Boolean(usernameStr), 
    user: usernameStr, 
    profile: typeof user === 'object' ? user : null 
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  return data;
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export async function request(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else if (contentType.includes('application/pdf') || contentType.includes('application/octet-stream')) {
      responseData = await response.blob();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMsg = typeof responseData === 'object' && responseData?.message 
        ? responseData.message 
        : `Request failed with status ${response.status}`;
      throw new ApiError(errorMsg, response.status, responseData);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Network request failed', 0, null);
  }
}
