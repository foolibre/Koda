import * as path from 'path';
import type { DevPlan, BuildStyle, ArtifactManifest } from '../types';
import { FileTools } from '../utils/filetools';
import { ZipSmith } from '../utils/zipsmith';
import { Logger } from '../utils/logger';
import { createHash } from 'crypto';

export class Artifactizer {
  private projectPath: string;
  private devPlan: DevPlan;
  private style: BuildStyle;
  private logger: Logger;
  private version: string;

  constructor(
    projectPath: string,
    devPlan: DevPlan,
    style: BuildStyle,
    logger: Logger,
    version: string = '0.1.0'
  ) {
    this.projectPath = projectPath;
    this.devPlan = devPlan;
    this.style = style;
    this.logger = logger;
    this.version = version;
  }

  async createArtifact(outputDir: string): Promise<string> {
    this.logger.setPhase('artifactize');
    this.logger.info('Creating artifact...');

    await this.prepareArtifactContents();
    this.sanitizeSecrets();
    this.generateDocumentation();

    const manifest = this.createManifest();
    const manifestPath = path.join(this.projectPath, 'artifact_manifest.json');
    FileTools.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    this.logger.info('Packaging artifact...');

    const zipPath = await ZipSmith.createArtifact(
      this.projectPath,
      outputDir,
      this.devPlan.project,
      this.version
    );

    const { size, checksum } = ZipSmith.getArtifactInfo(zipPath);

    this.logger.info(`Artifact created: ${path.basename(zipPath)}`);
    this.logger.info(`Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
    this.logger.info(`Checksum: ${checksum}`);

    return zipPath;
  }

  private async prepareArtifactContents(): Promise<void> {
    const logsDir = path.join(this.projectPath, 'BUILD_LOGS');
    FileTools.ensureDir(logsDir);

    const buildLogPath = path.join(logsDir, 'build.log');
    if (!FileTools.exists(buildLogPath)) {
      FileTools.writeFile(buildLogPath, 'Build log not available');
    }
  }

  private sanitizeSecrets(): void {
    this.logger.info('Sanitizing secrets...');

    const envPath = path.join(this.projectPath, '.env');
    if (FileTools.exists(envPath)) {
      const content = FileTools.readFile(envPath);
      const sanitized = FileTools.sanitizeEnvFile(content);
      FileTools.writeFile(envPath, sanitized);
    }

    const envExamplePath = path.join(this.projectPath, '.env.example');
    if (FileTools.exists(envExamplePath)) {
      const content = FileTools.readFile(envExamplePath);
      const sanitized = FileTools.sanitizeEnvFile(content);
      FileTools.writeFile(envExamplePath, sanitized);
    }
  }

  private generateDocumentation(): void {
    this.logger.info('Generating artifact documentation...');

    this.generateBuildSummary();
    this.generateDeployPlaybook();
    this.generateSecurityNotes();
    this.generateLicense();
  }

  private generateBuildSummary(): void {
    const content = `# Build Summary

## Project Information

**Name:** ${this.devPlan.project}
**Description:** ${this.devPlan.description}
**Version:** ${this.version}
**Build Date:** ${new Date().toISOString()}

## Build Configuration

**Style:** ${this.style.name} - ${this.style.description}
**Stack:** ${this.devPlan.stack}
**Build Tempo:** ${this.style.preferences.buildTempo}
**Testing Level:** ${this.style.preferences.testing}
**Documentation:** ${this.style.preferences.docs}

## Features Implemented

${this.devPlan.features.map(f => `- ${f}`).join('\n')}

## Technology Stack

**Frontend:** ${this.style.defaultStack.frontend}
**Backend:** ${this.style.defaultStack.backend}
${this.devPlan.database.enabled ? `**Database:** ${this.devPlan.database.type}` : ''}
${this.devPlan.auth.enabled ? `**Authentication:** ${this.devPlan.auth.provider}` : ''}

## Toolchain

**Package Manager:** ${this.style.toolchain.packageManager}
**Test Runner:** ${this.style.toolchain.testRunner}
**Linter:** ${this.style.toolchain.linter}
**Formatter:** ${this.style.toolchain.formatter}

## Build Logs

See \`BUILD_LOGS/\` directory for detailed logs:
- \`build.log\` - Build output
- \`test.log\` - Test results
- \`file-tree.txt\` - Project structure
- \`dependency_report.json\` - Dependency analysis

## Next Steps

1. Review DEPLOY_PLAYBOOK.md for deployment instructions
2. Check SECURITY_NOTES.md for security considerations
3. Configure environment variables from .env.example
4. Run local development: \`npm install && npm run dev\`

---

Created with ⚙️ KodArch — Foolibre Labs
Where code builds code.
`;

    const summaryPath = path.join(this.projectPath, 'BUILD_SUMMARY.md');
    FileTools.writeFile(summaryPath, content);
  }

  private generateDeployPlaybook(): void {
    const content = `# Deployment Playbook

## Prerequisites

- Node.js 18+ installed
- Package manager (${this.style.toolchain.packageManager})
${this.devPlan.database.enabled ? '- Supabase account (for database)' : ''}
${this.devPlan.auth.enabled ? '- Supabase project configured' : ''}

## Local Development

### 1. Install Dependencies

\`\`\`bash
${this.style.toolchain.packageManager} install
\`\`\`

### 2. Configure Environment

Copy \`.env.example\` to \`.env\` and fill in the required values:

\`\`\`bash
cp .env.example .env
\`\`\`

${this.generateEnvInstructions()}

### 3. Run Development Server

\`\`\`bash
${this.style.toolchain.packageManager === 'npm' ? 'npm run dev' : `${this.style.toolchain.packageManager} dev`}
\`\`\`

Visit http://localhost:5173

## Production Deployment

${this.generateDeploymentInstructions()}

## Troubleshooting

### Build Fails

1. Clear node_modules: \`rm -rf node_modules && ${this.style.toolchain.packageManager} install\`
2. Check Node version: \`node --version\` (should be 18+)
3. Review BUILD_LOGS/build.log

### Environment Variables

Ensure all REPLACE_WITH_LIVE_* placeholders are filled with actual values.

### Database Issues

${this.devPlan.database.enabled ? `
1. Verify Supabase project URL and keys
2. Check database migrations in supabase/migrations
3. Ensure RLS policies are configured
` : 'No database configured'}

## Rollback

To rollback a deployment:

1. Restore previous artifact version
2. Re-deploy using the same steps above
3. Verify environment variables match

## Support

Check BUILD_LOGS/ for detailed error information.
Review SECURITY_NOTES.md for security best practices.

---

Created with ⚙️ KodArch — Foolibre Labs
`;

    const playbookPath = path.join(this.projectPath, 'DEPLOY_PLAYBOOK.md');
    FileTools.writeFile(playbookPath, content);
  }

  private generateEnvInstructions(): string {
    if (!this.devPlan.database.enabled && !this.devPlan.auth.enabled) {
      return 'No environment variables required.';
    }

    return `
Required variables:

- \`VITE_SUPABASE_URL\`: Your Supabase project URL
- \`VITE_SUPABASE_ANON_KEY\`: Your Supabase anonymous key

Get these from: https://supabase.com/dashboard/project/_/settings/api
`;
  }

  private generateDeploymentInstructions(): string {
    const targets = this.devPlan.artifact.deploy_targets;
    const sections = [];

    if (targets.includes('vercel')) {
      sections.push(`### Vercel

\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

Environment variables will be requested during deployment.`);
    }

    if (targets.includes('netlify')) {
      sections.push(`### Netlify

\`\`\`bash
npm install -g netlify-cli
netlify deploy --prod
\`\`\`

Configure environment variables in Netlify dashboard.`);
    }

    if (targets.includes('docker')) {
      sections.push(`### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]
\`\`\`

Build and run:

\`\`\`bash
docker build -t ${this.devPlan.project} .
docker run -p 4173:4173 ${this.devPlan.project}
\`\`\``);
    }

    if (targets.includes('fly.io')) {
      sections.push(`### Fly.io

\`\`\`bash
fly launch
fly deploy
\`\`\`

Set secrets: \`fly secrets set KEY=VALUE\``);
    }

    return sections.join('\n\n');
  }

  private generateSecurityNotes(): void {
    const content = `# Security Notes

## Secret Management

⚠️ **CRITICAL:** All secrets in this artifact have been sanitized.

Replace all \`REPLACE_WITH_LIVE_*\` placeholders with actual values:

${this.devPlan.database.enabled || this.devPlan.auth.enabled ? `
- \`REPLACE_WITH_LIVE_VITE_SUPABASE_URL\`
- \`REPLACE_WITH_LIVE_VITE_SUPABASE_ANON_KEY\`
` : ''}

## Security Posture: ${this.style.preferences.security}

${this.getSecurityRecommendations()}

${this.devPlan.auth.enabled ? `
## Authentication

- Supabase Auth is configured
- Row Level Security (RLS) enabled
- Session management handled by Supabase

## Best Practices

1. Never commit .env files
2. Use environment variables for all secrets
3. Rotate keys regularly
4. Monitor authentication logs
` : ''}

${this.devPlan.database.enabled ? `
## Database Security

- Enable Row Level Security on all tables
- Use prepared statements (handled by Supabase SDK)
- Limit database permissions to minimum required
- Regular backups enabled by Supabase
` : ''}

## Recommended Security Audits

1. Run \`npm audit\` regularly
2. Keep dependencies updated
3. Review Supabase RLS policies
4. Enable Supabase security alerts

## Reporting Security Issues

Do not open public issues for security vulnerabilities.
Contact: [your-security-email]

---

Created with ⚙️ KodArch — Foolibre Labs
`;

    const securityPath = path.join(this.projectPath, 'SECURITY_NOTES.md');
    FileTools.writeFile(securityPath, content);
  }

  private getSecurityRecommendations(): string {
    switch (this.style.preferences.security) {
      case 'paranoid':
        return `
### Paranoid Security Mode

- All inputs sanitized
- Strict Content Security Policy
- Rate limiting recommended
- Security headers enforced
- Regular penetration testing advised
`;
      case 'high':
        return `
### High Security Mode

- Input validation enabled
- HTTPS enforced
- Security headers configured
- Regular security updates
`;
      case 'basic':
      default:
        return `
### Basic Security Mode

- Standard security practices applied
- Consider upgrading for production use
`;
    }
  }

  private generateLicense(): void {
    const license = this.devPlan.artifact.license;
    let content = '';

    if (license === 'MIT') {
      content = `MIT License

Copyright (c) ${new Date().getFullYear()} ${this.devPlan.project}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

Built with KodArch — Foolibre Labs
`;
    }

    const licensePath = path.join(this.projectPath, 'LICENSE');
    FileTools.writeFile(licensePath, content);
  }

  private createManifest(): ArtifactManifest {
    const files = FileTools.listFiles(this.projectPath, true)
      .filter(f => !f.includes('node_modules') && !f.includes('.git'))
      .map(f => ({
        path: path.relative(this.projectPath, f),
        size: FileTools.getFileSize(f),
        checksum: FileTools.getChecksum(f)
      }));

    return {
      project: this.devPlan.project,
      version: this.version,
      createdAt: new Date().toISOString(),
      createdBy: 'KodArch',
      devPlan: this.devPlan,
      buildStyle: this.style.name,
      files,
      buildLogs: this.logger.getLogs(),
      deployTargets: this.devPlan.artifact.deploy_targets
    };
  }
}
