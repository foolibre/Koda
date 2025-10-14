import * as path from 'path';
import type { DevPlan, BuildStyle, ProjectStructure } from '../types';
import { FileTools } from '../utils/filetools';
import { Logger } from '../utils/logger';

export class Architect {
  private logger: Logger;
  private style: BuildStyle;
  private devPlan: DevPlan;
  private workspaceRoot: string;

  constructor(devPlan: DevPlan, style: BuildStyle, workspaceRoot: string, logger: Logger) {
    this.devPlan = devPlan;
    this.style = style;
    this.workspaceRoot = workspaceRoot;
    this.logger = logger;
  }

  async generateProject(): Promise<string> {
    this.logger.setPhase('architect');
    this.logger.info(`Starting project generation: ${this.devPlan.project}`);

    const projectPath = path.join(this.workspaceRoot, this.devPlan.project);
    FileTools.ensureDir(projectPath);

    const structure = this.designStructure();
    await this.scaffoldStructure(projectPath, structure);

    this.logger.info(`Project scaffolded at: ${projectPath}`);

    this.generateDocumentation(projectPath);
    this.logger.info('Documentation generated');

    return projectPath;
  }

  private designStructure(): ProjectStructure {
    const isFullstack = this.devPlan.stack.includes('+');
    const needsDb = this.devPlan.database.enabled;
    const needsAuth = this.devPlan.auth.enabled;

    const structure: ProjectStructure = {
      name: this.devPlan.project,
      path: '',
      type: 'directory',
      children: [
        {
          name: 'src',
          path: 'src',
          type: 'directory',
          children: this.getSourceStructure(isFullstack)
        },
        {
          name: 'public',
          path: 'public',
          type: 'directory',
          children: []
        }
      ]
    };

    if (needsDb) {
      structure.children!.push({
        name: 'supabase',
        path: 'supabase',
        type: 'directory',
        children: [
          {
            name: 'migrations',
            path: 'supabase/migrations',
            type: 'directory',
            children: []
          }
        ]
      });
    }

    if (this.style.preferences.testing !== 'minimal') {
      structure.children!.push({
        name: 'tests',
        path: 'tests',
        type: 'directory',
        children: []
      });
    }

    structure.children!.push(
      { name: 'package.json', path: 'package.json', type: 'file' },
      { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file' },
      { name: '.env.example', path: '.env.example', type: 'file' },
      { name: '.gitignore', path: '.gitignore', type: 'file' },
      { name: 'README.md', path: 'README.md', type: 'file' }
    );

    return structure;
  }

  private getSourceStructure(isFullstack: boolean): ProjectStructure[] {
    const base: ProjectStructure[] = [
      {
        name: 'components',
        path: 'src/components',
        type: 'directory',
        children: []
      },
      {
        name: 'lib',
        path: 'src/lib',
        type: 'directory',
        children: []
      },
      {
        name: 'types',
        path: 'src/types',
        type: 'directory',
        children: []
      }
    ];

    if (isFullstack) {
      base.push({
        name: 'api',
        path: 'src/api',
        type: 'directory',
        children: []
      });
    }

    return base;
  }

  private async scaffoldStructure(basePath: string, structure: ProjectStructure): Promise<void> {
    const fullPath = path.join(basePath, structure.path);

    if (structure.type === 'directory') {
      FileTools.ensureDir(fullPath);

      if (structure.children) {
        for (const child of structure.children) {
          await this.scaffoldStructure(basePath, child);
        }
      }
    } else {
      const content = this.generateFileContent(structure.name);
      FileTools.writeFile(fullPath, content);
    }
  }

  private generateFileContent(filename: string): string {
    switch (filename) {
      case 'package.json':
        return this.generatePackageJson();
      case 'tsconfig.json':
        return this.generateTsConfig();
      case '.env.example':
        return this.generateEnvExample();
      case '.gitignore':
        return this.generateGitignore();
      case 'README.md':
        return this.generateReadme();
      default:
        return '';
    }
  }

  private generatePackageJson(): string {
    const pkg = {
      name: this.devPlan.project,
      version: '0.1.0',
      private: true,
      description: this.devPlan.description,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        typecheck: 'tsc --noEmit',
        ...(this.style.preferences.testing !== 'minimal' && {
          test: this.style.toolchain.testRunner === 'vitest' ? 'vitest' : 'jest'
        })
      },
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies()
    };

    return JSON.stringify(pkg, null, 2);
  }

  private getDependencies(): Record<string, string> {
    const deps: Record<string, string> = {
      react: '^18.3.1',
      'react-dom': '^18.3.1'
    };

    if (this.devPlan.database.enabled || this.devPlan.auth.enabled) {
      deps['@supabase/supabase-js'] = '^2.57.4';
    }

    deps['lucide-react'] = '^0.344.0';

    return deps;
  }

  private getDevDependencies(): Record<string, string> {
    return {
      '@types/react': '^18.3.5',
      '@types/react-dom': '^18.3.0',
      '@vitejs/plugin-react': '^4.3.1',
      typescript: '^5.5.3',
      vite: '^5.4.2',
      tailwindcss: '^3.4.1',
      autoprefixer: '^10.4.18',
      postcss: '^8.4.35'
    };
  }

  private generateTsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ['src']
      },
      null,
      2
    );
  }

  private generateEnvExample(): string {
    const lines = ['# Environment Variables'];

    if (this.devPlan.database.enabled || this.devPlan.auth.enabled) {
      lines.push('', '# Supabase', 'VITE_SUPABASE_URL=your-project-url', 'VITE_SUPABASE_ANON_KEY=your-anon-key');
    }

    return lines.join('\n');
  }

  private generateGitignore(): string {
    return `node_modules
dist
.env
.env.local
*.log
.DS_Store
coverage
`;
  }

  private generateReadme(): string {
    return `# ${this.devPlan.project}

${this.devPlan.description}

## Built with KodArch

Created with ⚙️ KodArch — Foolibre Labs
Where code builds code.

**Build Style:** ${this.style.name}
**Stack:** ${this.devPlan.stack}

## Features

${this.devPlan.features.map(f => `- ${f}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## License

${this.devPlan.artifact.license}
`;
  }

  private generateDocumentation(projectPath: string): void {
    const whyChoicesPath = path.join(projectPath, 'why-choices.md');
    const content = this.generateWhyChoices();
    FileTools.writeFile(whyChoicesPath, content);
  }

  private generateWhyChoices(): string {
    return `# Architecture Decisions

## Build Style: ${this.style.name}

${this.style.description}

**Philosophy:** ${this.style.tagline}

## Stack Selection

${this.devPlan.stack}

**Frontend:** ${this.style.defaultStack.frontend}
- Chosen for: ${this.explainChoice('frontend')}

**Backend:** ${this.style.defaultStack.backend}
- Chosen for: ${this.explainChoice('backend')}

${this.devPlan.database.enabled ? `**Database:** ${this.devPlan.database.type}\n- Chosen for: ${this.explainChoice('database')}` : ''}

## Testing Strategy

**Level:** ${this.style.preferences.testing}
**Runner:** ${this.style.toolchain.testRunner}

## Documentation Approach

**Density:** ${this.style.preferences.docs}

## Security Posture

**Level:** ${this.style.preferences.security}

${this.devPlan.auth.enabled ? '- Authentication enabled with Supabase\n- Row Level Security policies implemented' : ''}

## Code Style

**Philosophy:** ${this.style.preferences.codeStyle}
**Package Manager:** ${this.style.toolchain.packageManager}
**Linter:** ${this.style.toolchain.linter}
**Formatter:** ${this.style.toolchain.formatter}
`;
  }

  private explainChoice(component: string): string {
    const reasons: Record<string, string> = {
      frontend: 'Modern, performant, and excellent developer experience',
      backend: 'Scalable, well-supported, and aligns with build style',
      database: 'Reliable, feature-rich, and excellent tooling'
    };

    return reasons[component] || 'Best fit for project requirements';
  }
}
