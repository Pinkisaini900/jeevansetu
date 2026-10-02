import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, call } from '../api';
import { Card, Btn, primary } from '../components/ui';

export default function AmbulanceGPS() {
  const [searchParams] = useSearchParams();

  const ambulance = searchParams.get('ambulance') || 'JS101';

  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('GPS is not supported on this device.');
      return;
    }

    setError('');
    setTracking(true);

    navigator.geolocation.watchPosition(
      async position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({
          latitude,
          longitude
        });

        try {
          await call(
            api.post('/ambulance/location', {
              ambulanceNumber: ambulance,
              latitude,
              longitude
            })
          );
        } catch (e) {
          setError(e.message);
        }
      },
      error => {
        setTracking(false);

        if (error.code === 1) {
          setError('Location permission denied.');
        } else if (error.code === 2) {
          setError('Unable to get your location.');
        } else {
          setError('GPS request timed out.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
      }
    );
  };

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <h1 className="text-xl font-bold">
          Ambulance GPS
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Ambulance: {ambulance}
        </p>

        <div className="mt-6">
          {!tracking ? (
            <Btn
              onClick={startTracking}
              className={`w-full ${primary}`}
            >
              Start Live Location
            </Btn>
          ) : (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              GPS tracking is active.
            </div>
          )}
        </div>

        {location && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
            <div>
              Latitude: {location.latitude}
            </div>

            <div>
              Longitude: {location.longitude}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}