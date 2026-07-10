import api, { saveToken, clearToken } from './api';

const USER_KEY = 'cinematix_user';

const toPublicUser = (user) => ({
  id: user._id || user.id,
  _id: user._id || user.id,
  email: user.email,
  username: user.email, // backend tidak punya username terpisah
  fullName: user.name,  // backend pakai 'name', frontend pakai 'fullName'
  role: user.role,
  avatarUrl: user.avatarUrl || null,
});

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    if (!data.success) throw new Error(data.message || 'Login gagal');
    saveToken(data.token);
    const publicUser = toPublicUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(publicUser));
    return publicUser;
  },

  async adminLogin(usernameOrEmail, password) {
    // Backend tidak punya endpoint login admin khusus,
    // gunakan endpoint login biasa lalu validasi role
    const { data } = await api.post('/auth/login', {
      email: usernameOrEmail,
      password,
    });
    if (!data.success) throw new Error(data.message || 'Login admin gagal');
    if (data.user.role !== 'admin') {
      throw new Error('Akses ditolak: bukan akun admin');
    }
    saveToken(data.token);
    const publicUser = toPublicUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(publicUser));
    return publicUser;
  },

  async register(email, password, fullName) {
    const { data } = await api.post('/auth/register', {
      name: fullName,
      email,
      password,
      confirmPassword: password,
    });
    if (!data.success) throw new Error(data.message || 'Registrasi gagal');
    return toPublicUser(data.user);
  },

  async logout() {
    clearToken();
    localStorage.removeItem(USER_KEY);
  },

  async getCurrentUser() {
    const token = localStorage.getItem('cinematix_token');
    if (!token) return null;
    try {
      const { data } = await api.get('/auth/me');
      if (!data.success) return null;
      const publicUser = toPublicUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(publicUser));
      return publicUser;
    } catch {
      clearToken();
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
};
