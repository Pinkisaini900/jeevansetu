import axios from 'axios';

const http = axios.create({ baseURL: '/api', timeout: 15000 });

export const TOKEN_KEY = 'jeevansetu_hospital_token';
export const HOSPITAL_KEY = 'jeevansetu_hospital';

http.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && cfg.url.startsWith('/hospital')) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Every API call resolves to `data` or throws an Error with a human-readable message.
const call = (promise) =>
  promise
    .then((res) => res.data.data)
    .catch((err) => {
      const message = err.response?.data?.error || (err.request ? 'Cannot reach the JeevanSetu server. Is it running on port 4000?' : err.message);
      const e = new Error(message);
      e.status = err.response?.status;
      throw e;
    });

export const api = {
  ambulances: () => call(http.get('/ambulances')),
  createEmergency: (body) => call(http.post('/emergency', body)),
  nearbyHospitals: (emergencyId) => call(http.get('/hospitals/nearby', { params: { emergencyId } })),
  sendRequests: (id, hospitalIds) => call(http.post(`/emergency/${id}/request`, { hospitalIds })),
  status: (id) => call(http.get(`/emergency/${id}/status`)),
  selectHospital: (id, hospitalId) => call(http.post(`/emergency/${id}/select-hospital`, { hospitalId })),
  simulateResponses: (id) => call(http.post(`/emergency/${id}/simulate-responses`)),
  simulateMovement: (id) => call(http.post(`/emergency/${id}/simulate-movement`)),
  stats: () => call(http.get('/stats')),

  hospitalLogin: (username, password) => call(http.post('/hospital/login', { username, password })),
  hospitalRequests: () => call(http.get('/hospital/requests')),
  accept: (id) => call(http.post(`/hospital/request/${id}/accept`)),
  decline: (id) => call(http.post(`/hospital/request/${id}/decline`)),
  prepare: (id, status) => call(http.post(`/hospital/request/${id}/prepare`, { status })),
};
