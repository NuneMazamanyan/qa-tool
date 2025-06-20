import fs from 'fs';
import path from 'path';

export class RepoReaderService {
  private outputFilePath: string;

  constructor(outputFilePath: string) {
    this.outputFilePath = outputFilePath;
    fs.writeFileSync(this.outputFilePath, '');
  }

  async readRepo(repoPath: string): Promise<void> {
    console.log(`[RepoReader] Reading cleaned repo at ${repoPath}`);
    this.readRecursive(repoPath);
    console.log(`[RepoReader] Output written to ${this.outputFilePath}`);
  }

  private readRecursive(currentPath: string): void {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Skip .git folders
        if (item === '.git') {
          continue;
        }
        this.readRecursive(fullPath);
      } else if (stats.isFile()) {
        // Skip .gitignore files
        if (item === '.gitignore') {
          continue;
        }
        this.appendFileToOutput(fullPath);
      }
    }
  }

  private appendFileToOutput(filePath: string): void {
    const relativePath = path.relative(process.cwd(), filePath);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const header = `\n\n// === FILE: ${relativePath} ===\n\n`;
    fs.appendFileSync(this.outputFilePath, header + fileContent);
  }
}
