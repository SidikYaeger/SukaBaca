/**
 * Authentication Service
 */
import { API_ENDPOINTS } from '../config/api.config';
import { request, setStoredAuth, clearStoredAuth, getStoredAuth } from './api.client';

export const authService = {
  getCurrentSession() {
    return getStoredAuth();
  },

  async login(username, password) {
    const data = await request(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    return setStoredAuth(data);
  },

  async register(username, password, email = '', name = '') {
    const data = await request(API_ENDPOINTS.AUTH_REGISTER, {
      method: 'POST',
      body: JSON.stringify({ 
        username, 
        password, 
        email: email || `${username}@example.com`,
        name: name || username 
      })
    });
    if (!data?.token) {
      return this.login(username, password);
    }
    return setStoredAuth(data);
  },

  logout() {
    clearStoredAuth();
  }
};
