import * as path from 'path';
import * as fs from 'fs';
import { PromptParser } from './modules/prompt_parser';
import { Architect } from './modules/architect';
import { Runner } from './modules/runner';
import { Artifactizer } from './modules/artifactizer';
import { Logger } from './utils/logger';
import { FileTools } from './utils/filetools';
import type { DevPlan, BuildStyle } from './types';

export class KodArch {
  private workspaceRoot: string;
  private artifactDir: string;
  private logger: Logger;
  private stylesDir: string;

  constructor(workspaceRoot: string = './workspace', artifactDir: string = './artifacts') {
    this.workspaceRoot = path.resolve(workspaceRoot);
    this.artifactDir = path.resolve(artifactDir);
    this.stylesDir = path.join(__dirname, 'styles');
    this.logger = new Logger();

    FileTools.ensureDir(this.workspaceRoot);
    FileTools.ensureDir(this.artifactDir);
  }

  async build(prompt: string): Promise<string> {
    this.logger.clear();
    this.logger.setPhase('init');
    this.logger.info('KodArch build initiated');
    this.logger.info(`Prompt: ${prompt.substring(0, 100)}...`);

    const parser = new PromptParser();
    const devPlan = parser.parse(prompt);

    this.logger.info(`Project: ${devPlan.project}`);
    this.logger.info(`Style: ${devPlan.style}`);
    this.logger.info(`Stack: ${devPlan.stack}`);

    const style = this.loadStyle(devPlan.style);

    const architect = new Architect(devPlan, style, this.workspaceRoot, this.logger);
    const projectPath = await architect.generateProject();

    const runner = new Runner(projectPath, style, this.logger);
    await runner.runAll();

    const artifactizer = new Artifactizer(projectPath, devPlan, style, this.logger);
    const zipPath = await artifactizer.createArtifact(this.artifactDir);

    this.logger.setPhase('complete');
    this.logger.info('KODARCH BUILD SUCCESSFUL');
    this.logger.info('ARTIFACT READY');
    this.logger.info('FOOLIBRE LABS — THE MACHINE NOW BUILDS ITSELF');

    return zipPath;
  }

  private loadStyle(styleName: string): BuildStyle {
    const stylePath = path.join(this.stylesDir, `${styleName}.json`);

    if (!fs.existsSync(stylePath)) {
      this.logger.warn(`Style not found: ${styleName}, using hyperforge`);
      return this.loadStyle('hyperforge');
    }

    const content = fs.readFileSync(stylePath, 'utf-8');
    return JSON.parse(content) as BuildStyle;
  }

  getDevPlan(prompt: string): DevPlan {
    const parser = new PromptParser();
    return parser.parse(prompt);
  }

  getBuildLogs(): string {
    return this.logger.getLogsAsText();
  }
}

export async function forge(prompt: string): Promise<string> {
  const kodarch = new KodArch();
  return await kodarch.build(prompt);
}
