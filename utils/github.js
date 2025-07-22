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

const analyzeRepo = async (localPath) => {
    const packageJsonPath = path.join(localPath, 'package.json');
    try {
        await fs.access(packageJsonPath);
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        return {
            buildScript: packageJson.scripts && packageJson.scripts.build,
            mainFile: packageJson.main,
        };
    } catch {
        return {};
    }
};

module.exports = {
  cloneRepo,
  findJsFile,
  getFileContent,
  analyzeRepo,
};
