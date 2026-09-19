import axios from 'axios';
import { io } from 'socket.io-client';
import { useEffect } from 'react';

const BACKEND_URL = 'https://jeevansetu-dpye.onrender.com';

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`
});

export const socket = io(BACKEND_URL);

export const call = async p => {
  try {
    return (await p).data.data;
  } catch (e) {
    throw new Error(
      e.response?.data?.error || 'Cannot reach server. Is the API running?'
    );
  }
};

export const TYPES = [
  'Accident / Trauma',
  'Cardiac',
  'Stroke',
  'Respiratory',
  'Pregnancy',
  'Burns',
  'Severe Bleeding',
  'Other'
];

export const useLive = load =>
  useEffect(() => {
    load();
    socket.on('update', load);

    return () => socket.off('update', load);
  }, []);