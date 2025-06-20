import path from 'path';
import fs from 'fs';
import { GitService } from './services/GitService';
import { RepoCleanerService } from './services/RepoCleanerService';
import { RepoReaderService } from './services/RepoReaderService';

async function run() {
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    console.error('❌ Please provide a git repo URL as the first argument');
    process.exit(1);
  }

  const gitService = new GitService();
  const cleaner = new RepoCleanerService();

  const targetDir = path.join(__dirname, '..', 'cloned');
  await gitService.cloneRepo(repoUrl, targetDir);

  const repoName = repoUrl.split('/').pop()?.replace('.git', '')!;
  const repoPath = path.join(targetDir, repoName);

  await cleaner.cleanRepo(repoPath);

  const outputsDir = path.join(__dirname, '..', 'outputs');
  fs.mkdirSync(outputsDir, { recursive: true });

  const outputFilePath = path.join(outputsDir, `${repoName}.txt`);
  const reader = new RepoReaderService(outputFilePath);
  await reader.readRepo(repoPath);

  console.log(`✅ Repo dumped to: ${outputFilePath}`);
}

run();
