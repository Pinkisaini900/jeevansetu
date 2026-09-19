// Maps the crew's *suspected* emergency type to the hospital specialities that are relevant.
// This is a simple keyword match for the demo - it is NOT a medical triage or diagnosis.
export const EMERGENCY_TYPES = ['TRAUMA', 'CARDIAC', 'STROKE', 'RESPIRATORY', 'PREGNANCY', 'BURNS', 'BLEEDING', 'OTHER'];

const RELEVANT = {
  TRAUMA: ['Trauma', 'Orthopedics'],
  CARDIAC: ['Cardiology'],
  STROKE: ['Neurology', 'Neurosurgery'],
  RESPIRATORY: ['Pulmonology', 'Critical Care'],
  PREGNANCY: ['Maternity'],
  BURNS: ['Burns', 'Plastic Surgery'],
  BLEEDING: ['Trauma', 'Surgery'],
  OTHER: [],
};

export const splitList = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

export function matchHospital(hospital, type) {
  if (type === 'OTHER') return { suitable: true, relevantSpecialties: ['General emergency care'] };
  const relevantSpecialties = splitList(hospital.specialties).filter((s) => RELEVANT[type].includes(s));
  return { suitable: relevantSpecialties.length > 0, relevantSpecialties };
}
