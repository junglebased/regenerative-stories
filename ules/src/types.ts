export type Status = 'Pending' | 'Confirmed' | 'Disputed' | 'Resolved';
export type Tier = 'Anchor' | 'Established' | 'Contributor';

export interface Profile {
  id: string;
  name: string;
  tier: Tier;
  created_at: string;
}

export interface Entry {
  id: number;
  name: string;
  contributor_id: string;
  recipient_id: string;
  contributor?: Profile;
  recipient?: Profile;
  skill: string;
  rate: number;
  project: string;
  units: number;
  m1: number;
  m2: number;
  m3: number;
  evidence: string;
  gen: boolean;
  notes: string;
  date: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

export const SKILLS = [
  { name: 'Kurgu (Editing)',        rate: 2, cat: 'Creative'  },
  { name: 'Renk (Color Grading)',   rate: 3, cat: 'Creative'  },
  { name: 'Çekim (Cinematography)', rate: 3, cat: 'Creative'  },
  { name: 'Senaryo / Yazım',        rate: 2, cat: 'Creative'  },
  { name: 'Ses Tasarımı',           rate: 3, cat: 'Creative'  },
  { name: 'Hibe / Başvuru Yazımı',  rate: 2, cat: 'Knowledge' },
  { name: 'Notion / Sistem',        rate: 1, cat: 'Technical' },
  { name: 'Saha / Prodüksiyon',     rate: 2, cat: 'Physical'  },
] as const;

export type SkillName = typeof SKILLS[number]['name'];

export const PROJECTS = [
  'RS — Bölüm 3',
  'RS — Website',
  'Çiftçiden Eve (Client)',
  'Kültür Bakanlığı Hibe',
  'Genel / Stüdyo',
] as const;
