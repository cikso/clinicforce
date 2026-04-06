export type VerticalKey = 'vet' | 'dental' | 'gp' | 'chiro';

export interface VerticalConfig {
  key: VerticalKey;
  label: string;
  pluralLabel: string;
  tagline: string;
  patientLabel: string;
  ownerLabel: string;
  agentDescription: string;
  urgencyCategories: string[];
  handoverFields: string[];
  accentColor: string;
  icon: string;
}

export const VERTICALS: Record<VerticalKey, VerticalConfig> = {
  vet: {
    key: 'vet',
    label: 'Veterinary Clinic',
    pluralLabel: 'Veterinary Clinics',
    tagline: 'Built for vet clinics',
    patientLabel: 'Pet Name',
    ownerLabel: 'Pet Owner',
    agentDescription: 'AI receptionist for veterinary clinics',
    urgencyCategories: ['Breathing difficulty', 'Suspected poisoning', 'Trauma / injury', 'Seizure', 'Collapse', 'Uncontrolled bleeding'],
    handoverFields: ['Species', 'Breed', 'Age', 'Weight', 'Presenting complaint', 'Owner name', 'Callback number'],
    accentColor: '#2DD4BF',
    icon: '🐾',
  },
  dental: {
    key: 'dental',
    label: 'Dental Practice',
    pluralLabel: 'Dental Practices',
    tagline: 'Built for dental practices',
    patientLabel: 'Patient',
    ownerLabel: 'Patient',
    agentDescription: 'AI receptionist for dental practices',
    urgencyCategories: ['Severe / acute pain', 'Facial swelling / abscess', 'Trauma / broken tooth', 'Uncontrolled bleeding', 'Lost crown or filling', 'Dental emergency post-op'],
    handoverFields: ['Chief complaint', 'Pain scale (1–10)', 'Affected tooth / area', 'Last visit date', 'Health fund', 'Callback number'],
    accentColor: '#60A5FA',
    icon: '🦷',
  },
  gp: {
    key: 'gp',
    label: 'GP Clinic',
    pluralLabel: 'GP Clinics',
    tagline: 'Built for GP clinics',
    patientLabel: 'Patient',
    ownerLabel: 'Patient',
    agentDescription: 'AI receptionist for GP medical clinics',
    urgencyCategories: ['Chest pain', 'Difficulty breathing', 'Severe allergic reaction', 'High fever (child)', 'Mental health crisis', 'Uncontrolled bleeding'],
    handoverFields: ['Chief complaint', 'Symptoms duration', 'Medicare number', 'Regular GP', 'Urgency level', 'Callback number'],
    accentColor: '#A78BFA',
    icon: '🩺',
  },
  chiro: {
    key: 'chiro',
    label: 'Chiropractic Clinic',
    pluralLabel: 'Chiropractic Clinics',
    tagline: 'Built for chiropractic clinics',
    patientLabel: 'Patient',
    ownerLabel: 'Patient',
    agentDescription: 'AI receptionist for chiropractic clinics',
    urgencyCategories: ['Acute nerve pain', 'Numbness / tingling in limbs', 'Severe back / neck trauma', 'Post-adjustment complication', 'Sudden loss of mobility'],
    handoverFields: ['Chief complaint', 'Pain location', 'Pain scale (1–10)', 'Injury cause', 'Health fund', 'Callback number'],
    accentColor: '#F59E0B',
    icon: '🦴',
  },
};

export function getVertical(key: string): VerticalConfig {
  return VERTICALS[key as VerticalKey] ?? VERTICALS.vet;
}
