const simpleGit = require('simple-git');
const fs = require('fs/promises');
const path = require('path');

const cloneRepo = async (repoUrl) => {
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  const localPath = path.join(__dirname, '..', 'temp', repoName);
  await fs.rm(localPath, { recursive: true, force: true });
  const git = simpleGit();
  await git.clone(repoUrl, localPath);
  return localPath;
};

const findJsFile = async (dir) => {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      const result = await findJsFile(fullPath);
      if (result) return result;
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      return fullPath;
    }
  }
  return null;
};

const getFileContent = async (filePath) => {
  return fs.readFile(filePath, 'utf8');
};

module.exports = {
  cloneRepo,
  findJsFile,
  getFileContent,
};
