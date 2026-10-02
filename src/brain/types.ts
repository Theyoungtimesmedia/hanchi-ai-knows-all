export type BrainLayer = "high_signal" | "context_rot";
export type BrainRecordType = "fact" | "inference" | "decision" | "event" | "source_chunk";

export interface BrainRecord {
  id: string;
  user_id: string;
  layer: BrainLayer;
  record_type: BrainRecordType;
  title: string;
  content: string;
  domain: string | null;
  project: string | null;
  person: string | null;
  company: string | null;
  status: string | null;
  source_name: string | null;
  source_type: string | null;
  provenance: string | null;
  event_date: string | null;
  captured_at: string | null;
  confidence_score: number | null;
  superseded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BrainSeedRecord {
  title: string;
  content: string;
  domain: string;
  project?: string;
  record_type: BrainRecordType;
  status: "current" | "needs_verification";
  confidence_score: number;
  source_name: string;
  source_type: string;
  provenance: string;
}