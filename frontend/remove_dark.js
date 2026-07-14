const fs = require('fs');

['src/features/admin/templates/AdminTemplates.jsx', 'src/features/admin/templates/AdminTemplateEdit.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // replace all dark:xxxx classes
  content = content.replace(/dark:[\w-]+\/?\d*/g, '');
  // fix multiple spaces that might result from removal inside className strings
  content = content.replace(/ className="([^"]+)"/g, (match, classes) => {
    return ` className="${classes.replace(/\s+/g, ' ').trim()}"`;
  });
  fs.writeFileSync(file, content);
});

console.log('Removed dark mode classes');
