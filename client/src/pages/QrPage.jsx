import { useEffect, useState } from 'react'; import QRCode from 'qrcode'; import { api, call } from '../api'; import { Card, Busy, Err } from '../components/ui';
export default function QrPage() {
  const [list, setL] = useState(null), [err, setErr] = useState('');
  useEffect(() => { call(api.get('/ambulances')).then(async a => setL(await Promise.all(a.map(async x => { const url = `${location.origin}/emergency?ambulance=${x.ambulanceNumber}`; return { ...x, url, img: await QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: '#1e1b4b' } }) }; })))).catch(e => setErr(e.message)); }, []);
  return <div><h1 className="text-2xl font-bold">Ambulance QR codes</h1><p className="mb-4 text-sm text-slate-600">Each ambulance has its own code. To scan with a phone, open this app via your computer's LAN address (same Wi-Fi).</p>
    <Err m={err} />{!list && !err && <Busy />}
    <div className="grid gap-4 sm:grid-cols-3">{list?.map(a => <Card key={a.id} className="text-center"><img src={a.img} alt={`QR for ${a.ambulanceNumber}`} className="mx-auto" /><div className="mt-2 font-semibold">Ambulance ID: {a.ambulanceNumber}</div><a href={a.url} className="text-sm text-indigo-700 underline">Open emergency page</a></Card>)}</div></div>;
}


