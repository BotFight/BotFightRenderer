const fs = require('fs');
const path = require('path');

// Function to replace the path in index.html
function updateIndexHtml() {
  const indexPath = path.join(__dirname, 'out', 'index.html');

  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return;
    }

    const updatedData = data.replace(/\/_next\//g, './_next/');

    fs.writeFile(indexPath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing updated index.html:', err);
        return;
      }
    });
  });
}

// Update index.html after the build process
updateIndexHtml();
