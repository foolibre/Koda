import * as path from 'path';
import type { DevPlan, BuildStyle, ProjectStructure } from '../types';
import { FileTools } from '../utils/filetools';
import { Logger } from '../utils/logger';

interface TemplateManifest {
  name: string;
  type: 'frontend' | 'backend' | 'fullstack';
  description: string;
  files: Record<string, string>;
  directories?: string[];
}

export class Architect {
  private logger: Logger;
  private style: BuildStyle;
  private devPlan: DevPlan;
  private workspaceRoot: string;
  private templatesDir: string;

  constructor(devPlan: DevPlan, style: BuildStyle, workspaceRoot: string, logger: Logger) {
    this.devPlan = devPlan;
    this.style = style;
    this.workspaceRoot = workspaceRoot;
    this.logger = logger;
    this.templatesDir = path.join(__dirname, '..', 'templates');
  }

  async generateProject(): Promise<string> {
    this.logger.setPhase('architect');
    this.logger.info(`Starting project generation: ${this.devPlan.project}`);

    const projectPath = path.join(this.workspaceRoot, this.devPlan.project);
    FileTools.ensureDir(projectPath);

    await this.scaffoldFromTemplate(projectPath);

    this.logger.info(`Project scaffolded at: ${projectPath}`);

    this.generateDocumentation(projectPath);
    this.logger.info('Documentation generated');

    return projectPath;
  }

  private async scaffoldFromTemplate(projectPath: string): Promise<void> {
    const templateDir = path.join(this.templatesDir, this.style.name);
    const manifestPath = path.join(templateDir, 'template.json');

    if (!FileTools.exists(manifestPath)) {
      this.logger.error(`Template manifest not found for style: ${this.style.name}`);
      return;
    }

    const manifest: TemplateManifest = JSON.parse(FileTools.readFile(manifestPath));

    // Create directories
    if (manifest.directories) {
      for (const dir of manifest.directories) {
        FileTools.ensureDir(path.join(projectPath, dir));
      }
    }

    // Create files
    for (const [targetPath, sourceFile] of Object.entries(manifest.files)) {
      const sourcePath = path.join(templateDir, sourceFile);
      const destPath = path.join(projectPath, targetPath);

      let content = FileTools.readFile(sourcePath);
      content = this.replacePlaceholders(content);

      FileTools.ensureDir(path.dirname(destPath));
      FileTools.writeFile(destPath, content);
    }
  }

  private replacePlaceholders(content: string): string {
    return content
      .replace(/{{PROJECT_NAME}}/g, this.devPlan.project)
      .replace(/{{PROJECT_DESCRIPTION}}/g, this.devPlan.description);
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