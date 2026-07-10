import api from './api';

export const bioskopService = {
  async getBioskop() {
    const { data } = await api.get('/bioskop');
    return data.data || data || [];
  },
};
