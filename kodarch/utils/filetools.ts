import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export class FileTools {
  static ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static writeFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath);
    this.ensureDir(dir);
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  static readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  static exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  static copyFile(src: string, dest: string): void {
    const dir = path.dirname(dest);
    this.ensureDir(dir);
    fs.copyFileSync(src, dest);
  }

  static copyDir(src: string, dest: string): void {
    this.ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        this.copyFile(srcPath, destPath);
      }
    }
  }

  static listFiles(dirPath: string, recursive = true): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dirPath)) return files;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory() && recursive) {
        files.push(...this.listFiles(fullPath, recursive));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }

  static getFileTree(dirPath: string, prefix = ''): string {
    const lines: string[] = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      lines.push(`${prefix}${connector}${entry.name}`);

      if (entry.isDirectory()) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        const subPath = path.join(dirPath, entry.name);
        lines.push(this.getFileTree(subPath, newPrefix));
      }
    });

    return lines.join('\n');
  }

  static getChecksum(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  }

  static getFileSize(filePath: string): number {
    const stats = fs.statSync(filePath);
    return stats.size;
  }

  static sanitizeEnvFile(content: string): string {
    return content
      .split('\n')
      .map(line => {
        if (line.includes('=') && !line.trim().startsWith('#')) {
          const [key] = line.split('=');
          return `${key}=REPLACE_WITH_LIVE_${key.toUpperCase()}`;
        }
        return line;
      })
      .join('\n');
  }

  static deleteDir(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}
