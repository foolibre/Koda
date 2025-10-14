import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { FileTools } from './filetools';
import archiver from 'archiver';

export class ZipSmith {
  static async createZip(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  static async createArtifact(
    projectDir: string,
    outputDir: string,
    projectName: string,
    version: string = '0.1.0'
  ): Promise<string> {
    FileTools.ensureDir(outputDir);

    const zipName = `${projectName}-v${version}.zip`;
    const zipPath = path.join(outputDir, zipName);

    await this.createZip(projectDir, zipPath);

    return zipPath;
  }

  static getArtifactInfo(zipPath: string): { size: number; checksum: string } {
    const size = FileTools.getFileSize(zipPath);
    const checksum = FileTools.getChecksum(zipPath);

    return { size, checksum };
  }
}
