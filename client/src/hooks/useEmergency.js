import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { socket } from '../services/socket.js';

/** Loads one emergency and keeps it live through Socket.IO (status changes + ambulance movement). */
export function useEmergency(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(socket.connected);

  const refresh = useCallback(async () => {
    try {
      setData(await api.status(id));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    refresh();

    const join = () => {
      socket.emit('join:emergency', id);
      setLive(true);
      refresh(); // catch up on anything missed while offline
    };
    const onDisconnect = () => setLive(false);
    const onUpdate = (payload) => {
      if (payload.id === id) setData(payload);
    };
    const onLocation = (p) => {
      if (p.emergencyId !== id) return;
      setData((d) =>
        d && {
          ...d,
          status: p.arrived ? 'ARRIVED' : d.status,
          ambulance: { ...d.ambulance, latitude: p.latitude, longitude: p.longitude },
          tracking: d.tracking && { distanceKm: p.distanceKm, etaMinutes: p.etaMinutes, arrived: p.arrived },
          selected: d.selected && { ...d.selected, distanceKm: p.distanceKm, etaMinutes: p.etaMinutes },
        },
      );
    };

    socket.on('connect', join);
    socket.on('disconnect', onDisconnect);
    socket.on('emergency:update', onUpdate);
    socket.on('ambulance:location', onLocation);
    if (socket.connected) socket.emit('join:emergency', id);
    return () => {
      socket.off('connect', join);
      socket.off('disconnect', onDisconnect);
      socket.off('emergency:update', onUpdate);
      socket.off('ambulance:location', onLocation);
    };
  }, [id, refresh]);

  return { data, loading, error, live, refresh };
}
