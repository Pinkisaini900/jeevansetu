import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Play,
  Zap,
  Ambulance
} from 'lucide-react';

import { api, call, useLive, socket } from '../api';

import {
  Badge,
  Btn,
  Card,
  Busy,
  Err,
  primary,
  ghost
} from '../components/ui';

import LiveMap from '../components/LiveMap';

export default function Track() {
  const { id } = useParams();

  const [d, setD] = useState();
  const [st, setSt] = useState();
  const [err, setErr] = useState('');
  const [sim, setSim] = useState(false);

  const load = () =>
    Promise.all([
      call(api.get(`/emergency/${id}/status`)),
      call(api.get('/stats'))
    ])
      .then(([a, b]) => {
        setD(a);
        setSt(b);
      })
      .catch(e => setErr(e.message));

  useLive(load);

  // Receive REAL ambulance GPS updates
  useEffect(() => {
    const handleLocation = location => {
      if (location.emergencyId !== id) return;

      setD(prev => {
        if (!prev) return prev;

        return {
          ...prev,

          ambulance: {
            ...prev.ambulance,
            latitude: location.latitude,
            longitude: location.longitude
          },

          tracking: {
            ...prev.tracking,
            distanceKm: location.distanceKm,
            etaMinutes: location.etaMinutes,
            arrived: location.arrived
          }
        };
      });
    };

    socket.on('ambulance:location', handleLocation);

    return () => {
      socket.off('ambulance:location', handleLocation);
    };
  }, [id]);

  const act = p =>
    call(p).catch(e => setErr(e.message));

  // Demo movement
  const move = async () => {
    setSim(true);

    try {
      await call(
        api.post(`/emergency/${id}/simulate-movement`)
      );
    } catch (e) {
      setErr(e.message);
      setSim(false);
    }
  };

  if (!d) {
    return err ? <Err m={err} /> : <Busy />;
  }

  const sel = d.selected;

  const pending = d.responses.some(
    r => r.status === 'REQUESTED'
  );

  const hasHospitalRequests =
    d.responses.length > 0;

  const hospitalAccepted =
    d.responses.some(
      r => r.status === 'ACCEPTED'
    );

  const arrived =
    d.tracking?.arrived ||
    (sel && sel.distanceKm < 0.1);

  const timeline = [
    {
      title: 'Emergency Started',
      status: 'completed'
    },
    {
      title: 'Hospitals Notified',
      status: hasHospitalRequests
        ? 'completed'
        : 'pending'
    },
    {
      title: 'Hospital Accepted',
      status:
        sel || hospitalAccepted
          ? 'completed'
          : 'pending'
    },
    {
      title: 'Ambulance En Route',
      status: arrived
        ? 'completed'
        : sel
        ? 'active'
        : 'pending'
    },
    {
      title: 'Hospital Arrival',
      status: arrived
        ? 'completed'
        : 'pending'
    }
  ];

  const stats = [
    [
      'Active Emergencies',
      st?.activeEmergencies
    ],
    [
      'Hospitals Responded',
      st?.hospitalsResponded
    ],
    [
      'Accepted Requests',
      st?.acceptedRequests
    ],
    [
      'Avg Response Time',
      st?.avgResponseSeconds != null
        ? `${st.avgResponseSeconds}s`
        : '—'
    ]
  ];

  const ambulance = d.ambulance;

  const hospital = sel
    ? {
        id: sel.hospitalId,
        name: sel.hospitalName,
        latitude: sel.latitude,
        longitude: sel.longitude
      }
    : null;

  const otherHospitals = d.responses
    .filter(r => !sel || r.hospitalId !== sel.hospitalId)
    .map(r => ({
      id: r.hospitalId,
      name: r.hospitalName,
      latitude: r.latitude,
      longitude: r.longitude
    }));

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([t, v]) => (
          <Card key={t} className="!p-4">
            <div className="text-2xl font-bold text-indigo-900">
              {v ?? '—'}
            </div>

            <div className="text-xs text-slate-500">
              {t}
            </div>
          </Card>
        ))}
      </div>

      <Err m={err} />

      {/* Emergency Status Timeline */}
      <Card>
        <h2 className="mb-5 text-lg font-semibold">
          Emergency Status
        </h2>

        <div className="space-y-0">
          {timeline.map((item, index) => {
            const isLast =
              index === timeline.length - 1;

            return (
              <div
                key={item.title}
                className="flex items-start"
              >
                <div className="flex flex-col items-center">

                  {item.status === 'completed' ? (
                    <CheckCircle2
                      size={24}
                      className="text-green-600"
                    />
                  ) : item.status === 'active' ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                      <Ambulance
                        size={14}
                        className="text-white"
                      />
                    </div>
                  ) : (
                    <Circle
                      size={24}
                      className="text-slate-300"
                    />
                  )}

                  {!isLast && (
                    <div
                      className={`h-8 w-0.5 ${
                        timeline[index + 1].status ===
                          'completed' ||
                        item.status === 'completed'
                          ? 'bg-green-300'
                          : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>

                <div className="ml-3 pb-2">
                  <div
                    className={`font-medium ${
                      item.status === 'active'
                        ? 'text-indigo-700'
                        : item.status === 'completed'
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.title}
                  </div>

                  {item.status === 'active' && (
                    <div className="text-xs text-indigo-500">
                      Currently in progress
                    </div>
                  )}

                  {item.status === 'completed' && (
                    <div className="text-xs text-green-600">
                      Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">

        {/* LEFT */}
        <div className="space-y-4">

          {/* Emergency Information */}
          <Card>
            <h2 className="mb-2 font-semibold">
              Emergency {d.id}
            </h2>

            <dl className="grid grid-cols-2 gap-y-1 text-sm">

              <dt className="text-slate-500">
                Suspected type
              </dt>
              <dd>{d.emergencyType}</dd>

              <dt className="text-slate-500">
                Patient
              </dt>
              <dd>
                {d.patientAge} / {d.patientGender}
              </dd>

              <dt className="text-slate-500">
                Ambulance
              </dt>
              <dd>
                {d.ambulance?.ambulanceNumber}
              </dd>

              <dt className="text-slate-500">
                Request time
              </dt>

              <dd>
                {new Date(
                  d.createdAt
                ).toLocaleTimeString()}
              </dd>

            </dl>
          </Card>

          {/* Hospital Responses */}
          <Card>
            <h2 className="mb-3 font-semibold">
              Hospital Responses
            </h2>

            {!d.responses.length && (
              <p className="text-sm text-slate-500">
                No requests sent yet. Go back and request hospitals.
              </p>
            )}

            <ul className="space-y-3">
              {d.responses.map(r => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {r.hospitalName}
                    </div>

                    <div className="text-xs text-slate-500">
                      {r.distanceKm} km · ETA{' '}
                      {r.etaMinutes} min
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge s={r.status} />

                    {r.status === 'ACCEPTED' &&
                      !sel && (
                        <Btn
                          className={`!py-1.5 ${primary}`}
                          onClick={() =>
                            act(
                              api.post(
                                `/emergency/${id}/select-hospital`,
                                {
                                  hospitalId:
                                    r.hospitalId
                                }
                              )
                            )
                          }
                        >
                          Select
                        </Btn>
                      )}
                  </div>
                </li>
              ))}
            </ul>

            {pending && !sel && (
              <Btn
                onClick={() =>
                  act(
                    api.post(
                      `/emergency/${id}/simulate-responses`
                    )
                  )
                }
                className={`mt-4 w-full ${ghost}`}
              >
                <Zap size={16} />
                Simulate Hospital Response (demo)
              </Btn>
            )}
          </Card>

        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {sel ? (
            <>
              {/* Hospital Confirmed */}
              <Card className="border-indigo-200 bg-indigo-50">
                <div className="flex items-center gap-2 font-semibold text-indigo-900">
                  <CheckCircle2 />
                  Hospital Confirmed
                </div>

                <p className="mt-2 text-lg font-bold">
                  {sel.hospitalName}
                </p>

                <p className="text-sm text-slate-600">
                  Ambulance{' '}
                  {d.ambulance?.ambulanceNumber}
                  {' · '}

                  {arrived
                    ? 'Arrived'
                    : `ETA ${
                        d.tracking?.etaMinutes ??
                        sel.etaMinutes
                      } min · ${
                        d.tracking?.distanceKm ??
                        sel.distanceKm
                      } km`}

                  {' · '}Status: Confirmed
                </p>
              </Card>

              {/* Live Map */}
              <Card>
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                    LIVE AMBULANCE LOCATION
                  </span>
                </div>

                <LiveMap
                  ambulance={{
                    ...ambulance,
                    label:
                      ambulance?.ambulanceNumber ||
                      'Ambulance'
                  }}
                  hospital={hospital}
                  others={otherHospitals}
                  moving={sim || !arrived}
                />

                <Btn
                  disabled={sim || arrived}
                  onClick={move}
                  className={`mt-3 w-full ${primary}`}
                >
                  <Play size={16} />

                  {arrived
                    ? 'Ambulance Arrived'
                    : sim
                    ? 'Ambulance Moving...'
                    : 'Simulate Ambulance Movement'}
                </Btn>

              </Card>
            </>
          ) : (
            <Card className="text-sm text-slate-600">
              Waiting for a hospital to accept. Once one accepts,
              select it to confirm and see the ambulance's live location.
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}