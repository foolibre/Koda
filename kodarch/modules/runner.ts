import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { FileTools } from '../utils/filetools';
import { Logger } from '../utils/logger';
import type { BuildStyle } from '../types';

const execAsync = promisify(exec);

interface CommandMap {
  install: string;
  build: string;
  test: string;
}

export class Runner {
  private projectPath: string;
  private logger: Logger;
  private style: BuildStyle;
  private logsDir: string;
  private commandMap: CommandMap;

  constructor(projectPath: string, style: BuildStyle, logger: Logger) {
    this.projectPath = projectPath;
    this.style = style;
    this.logger = logger;
    this.logsDir = path.join(projectPath, 'BUILD_LOGS');
    this.commandMap = this.getCommandMap();
    FileTools.ensureDir(this.logsDir);
  }

  private getCommandMap(): CommandMap {
    const pm = this.style.toolchain.packageManager;
    switch (pm) {
      case 'pnpm':
        return { install: 'pnpm install', build: 'pnpm build', test: 'pnpm test' };
      case 'poetry':
        return { install: 'poetry install', build: 'poetry run build', test: 'poetry run test' };
      case 'cargo':
        return { install: 'cargo build', build: 'cargo build --release', test: 'cargo test' };
      case 'npm':
      default:
        return { install: 'npm install', build: 'npm run build', test: 'npm test' };
    }
  }

  async runAll(): Promise<void> {
    await this.install();
    await this.build();

    if (this.style.preferences.testing !== 'minimal') {
      await this.test();
    }

    await this.generateReports();
  }

  private async install(): Promise<void> {
    this.logger.setPhase('install');
    this.logger.info('Installing dependencies...');

    try {
      const { stdout, stderr } = await execAsync(this.commandMap.install, {
        cwd: this.projectPath,
        timeout: 300000
      });

      const logPath = path.join(this.logsDir, 'install.log');
      FileTools.writeFile(logPath, `${stdout}\n${stderr}`);

      this.logger.info('Dependencies installed successfully');
    } catch (error: any) {
      this.logger.error('Failed to install dependencies', error.message);
      const logPath = path.join(this.logsDir, 'install.log');
      FileTools.writeFile(logPath, `ERROR:\n${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`);
    }
  }

  private async build(): Promise<void> {
    this.logger.setPhase('build');
    this.logger.info('Building project...');

    try {
      const { stdout, stderr } = await execAsync(this.commandMap.build, {
        cwd: this.projectPath,
        timeout: 300000
      });

      const logPath = path.join(this.logsDir, 'build.log');
      FileTools.writeFile(logPath, `${stdout}\n${stderr}`);

      this.logger.info('Build completed successfully');
    } catch (error: any) {
      this.logger.warn('Build encountered issues', error.message);
      const logPath = path.join(this.logsDir, 'build.log');
      FileTools.writeFile(logPath, `WARNING:\n${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`);
    }
  }

  private async test(): Promise<void> {
    this.logger.setPhase('test');
    this.logger.info('Running tests...');

    try {
      const { stdout, stderr } = await execAsync(this.commandMap.test, {
        cwd: this.projectPath,
        timeout: 300000
      });

      const logPath = path.join(this.logsDir, 'test.log');
      FileTools.writeFile(logPath, `${stdout}\n${stderr}`);

      this.logger.info('Tests completed');
    } catch (error: any) {
      this.logger.warn('Tests not configured or failed', error.message);
      const logPath = path.join(this.logsDir, 'test.log');
      FileTools.writeFile(logPath, `INFO: Tests not available or failed\n${error.message}`);
    }
  }

  private async generateReports(): Promise<void> {
    this.logger.setPhase('reports');
    this.logger.info('Generating reports...');

    const fileTreePath = path.join(this.logsDir, 'file-tree.txt');
    const fileTree = FileTools.getFileTree(this.projectPath);
    FileTools.writeFile(fileTreePath, fileTree);

    const depReportPath = path.join(this.logsDir, 'dependency_report.json');
    const packageJsonPath = path.join(this.projectPath, 'package.json');

    if (FileTools.exists(packageJsonPath)) {
      const packageJson = JSON.parse(FileTools.readFile(packageJsonPath));
      const report = {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        totalCount: Object.keys(packageJson.dependencies || {}).length + Object.keys(packageJson.devDependencies || {}).length
      };
      FileTools.writeFile(depReportPath, JSON.stringify(report, null, 2));
    }

    const testReportPath = path.join(this.logsDir, 'tests-report.html');
    const testReport = this.generateTestReportHtml();
    FileTools.writeFile(testReportPath, testReport);

    this.logger.info('Reports generated');
  }

  private generateTestReportHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report</title>
  <style>
    body {
      font-family: 'JetBrains Mono', monospace;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #0a0a0a;
      color: #e0e0e0;
    }
    h1 {
      background: linear-gradient(135deg, #1e3a8a, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .status {
      padding: 10px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .info {
      background: #1e3a8a;
    }
  </style>
</head>
<body>
  <h1>KodArch Test Report</h1>
  <div class="status info">
    <p>Testing level: ${this.style.preferences.testing}</p>
    <p>See test.log for detailed results</p>
  </div>
</body>
</html>`;
  }
}