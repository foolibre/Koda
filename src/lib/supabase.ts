import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Project {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  dev_plan: DevPlan;
  style: string;
  status: 'pending' | 'building' | 'completed' | 'failed';
  artifact_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevPlan {
  project: string;
  description: string;
  stack: string;
  style: string;
  features: string[];
  database: {
    enabled: boolean;
    type: string;
  };
  auth: {
    enabled: boolean;
    provider: string;
  };
}

export interface BuildLog {
  id: string;
  project_id: string;
  phase: string;
  message: string;
  status: 'success' | 'warning' | 'error';
  details: any;
  created_at: string;
}

export interface BuildArtifact {
  id: string;
  project_id: string;
  version: string;
  file_path: string;
  file_size: number;
  checksum: string;
  manifest: any;
  created_at: string;
}
