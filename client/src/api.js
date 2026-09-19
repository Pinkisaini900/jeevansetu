import axios from 'axios'; import { io } from 'socket.io-client'; import { useEffect } from 'react';
export const api = axios.create({ baseURL: '/api' });
export const socket = io();
export const call = async p => { try { return (await p).data.data; } catch (e) { throw new Error(e.response?.data?.error || 'Cannot reach server. Is the API running?'); } };
export const TYPES = ['Accident / Trauma', 'Cardiac', 'Stroke', 'Respiratory', 'Pregnancy', 'Burns', 'Severe Bleeding', 'Other'];
// Loads data now and again whenever the server pushes an update (Socket.IO)
export const useLive = load => useEffect(() => { load(); socket.on('update', load); return () => socket.off('update', load); }, []);
