import fs from 'fs';
import path from 'path';

export class RepoCleanerService {
  private ignoreDirs = new Set(['node_modules', 'dist', 'coverage', 'assets', 'images']);
  private ignoreFileExts = new Set([
    '.css',
    '.scss',
    '.sass',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.webp',
    '.gitignore',
    'package-lock.json',
  ]);

  async cleanRepo(repoPath: string): Promise<void> {
    console.log(`[RepoCleaner] Cleaning ${repoPath}...`);
    this.cleanRecursive(repoPath);
    console.log(`[RepoCleaner] Cleanup complete.`);
  }

  private cleanRecursive(currentPath: string): void {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        if (this.ignoreDirs.has(item)) {
          this.deleteFolderRecursive(fullPath);
          console.log(`[RepoCleaner] Deleted directory: ${fullPath}`);
        } else {
          this.cleanRecursive(fullPath);
        }
      } else if (stats.isFile()) {
        if (this.shouldDeleteFile(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`[RepoCleaner] Deleted file: ${fullPath}`);
        }
      }
    }

    // Remove empty folders after processing all items
    this.removeEmptyFolders(currentPath);
  }

  private shouldDeleteFile(filePath: string): boolean {
    const fileName = path.basename(filePath).toLowerCase();
    const ext = path.extname(filePath).toLowerCase();
    
    // Check for .config.* files
    if (fileName.includes('.config.')) {
      return true;
    }
    
    // Check for other ignored extensions
    return this.ignoreFileExts.has(ext);
  }

  private removeEmptyFolders(dirPath: string): void {
    try {
      const items = fs.readdirSync(dirPath);
      
      // If directory is empty, remove it
      if (items.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`[RepoCleaner] Removed empty directory: ${dirPath}`);
      }
    } catch (error) {
      // Directory might have been deleted already or doesn't exist
      console.log(`[RepoCleaner] Could not check/remove directory: ${dirPath}`);
    }
  }

  private deleteFolderRecursive(dir: string): void {
    if (!fs.existsSync(dir)) return;

    fs.readdirSync(dir).forEach(file => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        this.deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });

    fs.rmdirSync(dir);
  }
}
