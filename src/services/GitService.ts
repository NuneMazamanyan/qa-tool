import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';
import fs from 'fs';

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async cloneRepo(repoUrl: string, targetDir: string): Promise<void> {
    const repoName = this.getRepoNameFromUrl(repoUrl);
    const fullPath = path.join(targetDir, repoName);

    // Check if it already exists
    if (fs.existsSync(fullPath)) {
      console.log(`[GitService] Repo already exists at ${fullPath}, pulling latest changes...`);
      await this.pullRepo(fullPath);
      return;
    }

    try {
      console.log(`[GitService] Cloning ${repoUrl} into ${fullPath}...`);
      await this.git.clone(repoUrl, fullPath, { '--config': 'http.postBuffer=524288000' });
      console.log(`[GitService] Clone complete.`);
    } catch (err) {
      console.error(`[GitService] Error cloning repo:`, err);
      throw err;
    }
  }

  async pullRepo(repoPath: string): Promise<void> {
    try {
      const git = simpleGit(repoPath);
      console.log(`[GitService] Pulling latest changes from ${repoPath}...`);
      await git.pull();
      console.log(`[GitService] Pull complete.`);
    } catch (err) {
      console.error(`[GitService] Error pulling repo:`, err);
    }
  }

  async cloneOrPullRepo(repoUrl: string, targetDir: string): Promise<string> {
    const repoName = this.getRepoNameFromUrl(repoUrl);
    const fullPath = path.join(targetDir, repoName);

    if (fs.existsSync(fullPath)) {
      console.log(`[GitService] Repo already exists at ${fullPath}, pulling latest changes...`);
      await this.pullRepo(fullPath);
    } else {
      try {
        console.log(`[GitService] Cloning ${repoUrl} into ${fullPath}...`);
        await this.git.clone(repoUrl, fullPath, { '--config': 'http.postBuffer=524288000' });
        console.log(`[GitService] Clone complete.`);
      } catch (err) {
        console.error(`[GitService] Error cloning repo:`, err);
        throw err;
      }
    }

    return fullPath;
  }

  private getRepoNameFromUrl(repoUrl: string): string {
    return repoUrl.split('/').pop()?.replace('.git', '') || 'unknown-repo';
  }
}
