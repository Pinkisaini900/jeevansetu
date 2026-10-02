import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '../components/ui';

const ambulances = [
  { id: 1, ambulanceNumber: 'JS101' },
  { id: 2, ambulanceNumber: 'JS102' },
  { id: 3, ambulanceNumber: 'JS103' }
];

function QrPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    async function generateQRs() {
      const generated = [];

      for (const ambulance of ambulances) {
        const url =
          window.location.origin +
          '/emergency?ambulance=' +
          ambulance.ambulanceNumber;

        const img = await QRCode.toDataURL(url, {
          width: 220,
          margin: 1
        });

        generated.push({
          id: ambulance.id,
          ambulanceNumber: ambulance.ambulanceNumber,
          url: url,
          img: img
        });
      }

      setList(generated);
    }

    generateQRs();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Ambulance QR Codes
      </h1>

      <p className="mb-4 text-sm text-slate-600">
        Scan an ambulance QR code to start emergency assistance.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {list.map((ambulance) => (
          <Card key={ambulance.id} className="text-center">
            <img
              src={ambulance.img}
              alt={'QR for ' + ambulance.ambulanceNumber}
              className="mx-auto"
            />

            <div className="mt-2 font-semibold">
              Ambulance ID: {ambulance.ambulanceNumber}
            </div>

            <a
              href={ambulance.url}
              className="text-sm text-indigo-700 underline"
            >
              Open emergency page
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default QrPage;