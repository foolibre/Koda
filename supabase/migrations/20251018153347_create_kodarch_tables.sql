/*
  # KodArch Database Schema

  ## Tables Created
  
  ### projects
  - `id` (uuid, primary key) - Unique project identifier
  - `user_id` (uuid) - Reference to auth.users
  - `name` (text) - Project name
  - `prompt` (text) - Original user prompt
  - `dev_plan` (jsonb) - Parsed development plan
  - `style` (text) - Build style used
  - `status` (text) - current, building, completed, failed
  - `artifact_url` (text) - URL to downloadable artifact
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### build_logs
  - `id` (uuid, primary key) - Unique log identifier
  - `project_id` (uuid) - Reference to projects table
  - `phase` (text) - Build phase name
  - `message` (text) - Log message
  - `status` (text) - success, warning, error
  - `details` (jsonb) - Additional log details
  - `created_at` (timestamptz) - Log timestamp

  ### build_artifacts
  - `id` (uuid, primary key) - Unique artifact identifier
  - `project_id` (uuid) - Reference to projects table
  - `version` (text) - Artifact version
  - `file_path` (text) - Storage path
  - `file_size` (bigint) - File size in bytes
  - `checksum` (text) - SHA256 checksum
  - `manifest` (jsonb) - Complete artifact manifest
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to access their own data
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  prompt text NOT NULL,
  dev_plan jsonb,
  style text NOT NULL DEFAULT 'hyperforge',
  status text NOT NULL DEFAULT 'pending',
  artifact_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create build_logs table
CREATE TABLE IF NOT EXISTS build_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  phase text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create build_artifacts table
CREATE TABLE IF NOT EXISTS build_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  version text NOT NULL DEFAULT '0.1.0',
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  checksum text NOT NULL,
  manifest jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_artifacts ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Build logs policies
CREATE POLICY "Users can view own build logs"
  ON build_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = build_logs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert build logs"
  ON build_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = build_logs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Build artifacts policies
CREATE POLICY "Users can view own artifacts"
  ON build_artifacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = build_artifacts.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create artifacts"
  ON build_artifacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = build_artifacts.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_build_logs_project_id ON build_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_build_artifacts_project_id ON build_artifacts(project_id);
