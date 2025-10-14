# KodArch

**⚙️ Koda Arch: Self-Programming Program**

An autonomous builder that turns text prompts into complete, production-ready software projects.

Created with ⚙️ KodArch — Foolibre Labs
Where code builds code.

## Overview

KodArch is an open-source, modular framework that:

- 📝 Parses natural language prompts into structured DevPlans
- 🏗️ Generates complete project scaffolds with best practices
- 🧪 Runs builds and tests automatically
- 📦 Packages everything into self-deployable artifacts (ZIP)
- 🎨 Supports multiple Build Styles for different project personalities

## Build Styles

Each mode has a unique personality that alters behavior:

| Mode | Description | Stack | Testing | Docs |
|------|-------------|-------|---------|------|
| **artisan** | Handcrafted, elegant builds | SvelteKit / FastAPI | Full | High |
| **hyperforge** | Speed + scalability | Next.js / Node / Postgres | Essential | Medium |
| **liminal** | Experimental, creative | Vite / Deno / SQLite | Minimal | Medium |
| **daemon** | Automation / meta-builders | Python CLI / LangChain | Strict | High |
| **genesis** | Framework-level builds | Rust / WASM / Axum | Rigorous | Very High |

## Architecture

```
/kodarch
  /modules
    prompt_parser.ts    - Converts prompts to DevPlan
    architect.ts        - Generates project structure
    runner.ts          - Executes build/test pipeline
    artifactizer.ts    - Creates deployment artifacts
  /styles              - Build style definitions
  /templates           - Project templates
  /utils               - File tools, logging, ZIP creation
  /examples            - Demo builds
  index.ts             - Main orchestrator
```

## Quick Start

```typescript
import { KodArch } from './kodarch';

const kodarch = new KodArch();

const zipPath = await kodarch.build(`
  Create an AI-powered drone delivery prototype.
  style:hyperforge
  stack:Next.js + Node + Postgres
`);

console.log(`Artifact created: ${zipPath}`);
```

## Prompt Syntax

Use inline tags to control build behavior:

```
Create a real-time chat application

style:artisan
stack:SvelteKit + Deno + Postgres
db:postgres
deploy:vercel,docker
license:MIT
```

Supported tags:
- `style:` - Build mode (artisan, hyperforge, liminal, daemon, genesis)
- `stack:` - Technology stack
- `db:` - Database type
- `deploy:` - Deployment targets
- `license:` - License type

## Artifact Contents

Every ZIP includes:

```
/src                    - Full source code
/BUILD_LOGS            - Build outputs and reports
BUILD_SUMMARY.md       - Project overview
DEPLOY_PLAYBOOK.md     - Step-by-step deployment guide
SECURITY_NOTES.md      - Security considerations
LICENSE                - License file
artifact_manifest.json - Complete build manifest
why-choices.md         - Architecture decisions
README.md              - Project README
```

## Module Details

### PromptParser

Extracts structured data from natural language:

```typescript
const parser = new PromptParser();
const devPlan = parser.parse(prompt);
```

Output:
```json
{
  "project": "drone-drop",
  "description": "AI-driven delivery prototype",
  "stack": "Next.js + Node + Postgres",
  "style": "hyperforge",
  "features": ["Authentication", "Real-time Updates", "API"],
  "artifact": {
    "zip": true,
    "license": "MIT",
    "deploy_targets": ["vercel", "docker", "fly.io"]
  }
}
```

### Architect

Generates project structure based on DevPlan and Style:

- Creates folder hierarchy
- Scaffolds configuration files
- Applies style preferences
- Generates documentation

### Runner

Executes build pipeline:

- Installs dependencies
- Runs build process
- Executes tests (if configured)
- Generates reports

### Artifactizer

Creates deployment-ready artifacts:

- Sanitizes secrets
- Generates comprehensive documentation
- Creates deployment playbooks
- Packages into ZIP with manifest

## Examples

### Drone Delivery System

```bash
ts-node kodarch/examples/drone-drop.ts
```

This builds a complete AI-powered drone delivery system with:
- Fleet management dashboard
- Real-time tracking
- Authentication
- API for drone communication
- Full deployment documentation

## Configuration

### DevPlan Schema

Structured plan generated from prompts. See `DevPlan.schema.json`.

### Style Schema

Build personality configuration. See `style.schema.json`.

### Config Schema

KodArch system configuration. See `config.schema.json`.

## Security

- All secrets automatically sanitized
- Replaced with `REPLACE_WITH_LIVE_*` placeholders
- Row Level Security enabled for database tables
- Comprehensive security notes in every artifact

## Deployment

Artifacts include deployment instructions for:

- **Vercel** - Frontend hosting
- **Netlify** - Static sites
- **Docker** - Containerized deployment
- **Fly.io** - Full-stack hosting
- **Railway** - Quick deployment
- **DigitalOcean** - VPS hosting

## Build Logs

Every build generates:

- `build.log` - Build output
- `tests-report.html` - Test results
- `file-tree.txt` - Project structure
- `dependency_report.json` - Dependency analysis

## Toolchain

KodArch uses industry-standard OSS tools:

- **Codegen:** OpenAI / Local LLMs (integration ready)
- **Build:** pnpm, poetry, cargo
- **Testing:** Jest, Pytest, Vitest
- **Docs:** Markdown-based
- **Package:** Custom zipsmith
- **Container:** Docker

## Philosophy

KodArch embodies:

1. **Modularity** - Clean separation of concerns
2. **Style-driven** - Personality shapes output
3. **Safe by default** - Security built-in
4. **Self-documenting** - Rich documentation included
5. **Production-ready** - Not just scaffolds, complete systems

## API

### Main Class

```typescript
class KodArch {
  constructor(workspaceRoot?: string, artifactDir?: string)

  async build(prompt: string): Promise<string>
  getDevPlan(prompt: string): DevPlan
  getBuildLogs(): string
}
```

### Convenience Function

```typescript
async function forge(prompt: string): Promise<string>
```

## Contributing

KodArch is open-source and welcomes contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Credits

Created with ⚙️ KodArch — Foolibre Labs
Where code builds code.

Color scheme: Noir blue + plasma pink gradient
Font: JetBrains Mono

---

**KODARCH BUILD SUCCESSFUL.**
**ARTIFACT READY.**
**FOOLIBRE LABS — THE MACHINE NOW BUILDS ITSELF.**
