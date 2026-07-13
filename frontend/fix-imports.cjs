const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.jsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const targetFile = path.resolve('src/shared/store/useAuth.js');
const jsxFiles = walkSync(path.resolve('src'));

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import { useAuth }')) {
    const relPath = path.relative(path.dirname(file), targetFile).replace(/\\/g, '/');
    const newImportPath = relPath.startsWith('.') ? relPath : './' + relPath;
    const modulePath = newImportPath.replace('.js', '');
    content = content.replace(/import \{ useAuth \} from ['.\/A-Za-z0-9_-]+';/, `import { useAuth } from '${modulePath}';`);
    fs.writeFileSync(file, content);
    console.log('Fixed:', file, modulePath);
  }
});
