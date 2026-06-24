// Domain types for the Ophélie knowledge base — ported from ophelieV2's shared
// model, trimmed to what the MVP screens render. The frontend owns the seed
// here (no backend), so these are the only source of truth for the Library.

export type ConsultantStatus =
  | "available"
  | "rolling-off"
  | "staffed"
  | "unavailable";

export type Grade =
  | "Principal"
  | "Senior Manager"
  | "Manager"
  | "Senior Consultant"
  | "Consultant";

export interface PastExperience {
  role: string;
  company: string;
  years: string;
}

export interface Consultant {
  id: string;
  name: string;
  email: string;
  initials: string;
  title: string; // role headline, e.g. "Principal · Cloud Architecture"
  grade: Grade;
  location: string;
  mobility: string;
  languages: string[];
  status: ConsultantStatus;
  statusDetail: string;
  rate: string;
  bio: string;
  skills: string[];
  industries: string[];
  certifications: string[];
  education: string[];
  yearsExp: number;
  yearsAtFirm: number;
  missionIds: string[]; // → Reference.id
  pastExperience: PastExperience[];
  hiringDate: string;
}

export interface Reference {
  id: string;
  name: string;
  client: string;
  industry: string;
  duration: string;
  size: string;
  team: number;
  role: string;
  summary: string;
  skills: string[];
  consultants: string[]; // → Consultant.id
  outcomes: string[];
}

export interface Client {
  id: string; // stable slug derived from the name, e.g. "cl-bnp-paribas"
  name: string;
  industry: string;
}
