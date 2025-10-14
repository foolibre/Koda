export interface DevPlan {
  project: string;
  description: string;
  stack: string;
  style: string;
  features: string[];
  artifact: {
    zip: boolean;
    license: string;
    deploy_targets: string[];
  };
  database: {
    enabled: boolean;
    type: string;
  };
  auth: {
    enabled: boolean;
    provider: string;
  };
}

export interface BuildStyle {
  name: string;
  description: string;
  tagline: string;
  preferences: {
    buildTempo: 'fast' | 'balanced' | 'meticulous';
    testing: 'minimal' | 'essential' | 'full' | 'rigorous';
    docs: 'minimal' | 'medium' | 'high' | 'very high';
    security: 'basic' | 'high' | 'paranoid';
    codeStyle: 'pragmatic' | 'elegant' | 'experimental' | 'strict';
  };
  defaultStack: {
    frontend: string;
    backend: string;
    database: string;
  };
  toolchain: {
    packageManager: string;
    testRunner: string;
    linter: string;
    formatter: string;
  };
}

export interface ProjectStructure {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: ProjectStructure[];
}

export interface BuildLog {
  timestamp: string;
  phase: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export interface ArtifactManifest {
  project: string;
  version: string;
  createdAt: string;
  createdBy: string;
  devPlan: DevPlan;
  buildStyle: string;
  files: {
    path: string;
    size: number;
    checksum: string;
  }[];
  buildLogs: BuildLog[];
  deployTargets: string[];
}

export interface TemplateConfig {
  name: string;
  type: string;
  files: {
    [key: string]: string;
  };
  dependencies: {
    [key: string]: string;
  };
  devDependencies?: {
    [key: string]: string;
  };
  scripts: {
    [key: string]: string;
  };
}
