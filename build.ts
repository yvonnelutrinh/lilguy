// create extbuild directory for static Chrome Extension
import { glob } from 'glob'
import * as fs from 'fs';
import * as path from 'path';


// Filenames starting with "_" are reserved for use by the system. (not allowed for extensions)
const files = glob.sync('extension/**/*.html');
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const modifiedContent = content.replace(/\/_next/g, './next');
  fs.writeFileSync(file, modifiedContent, 'utf-8');
});

const sourcePath = 'extension/_next';
const destinationPath = 'extension/next';

fs.rename(sourcePath, destinationPath, (err) => {
  if (err) {
    console.error('Failed to rename "_next" directory to "next".', err);
  } else {
    console.log('Renamed "_next" directory to "next" successfully.');
  }
});




//  THIS BELOW PART IS WACKY AF, BASICALLY TRYING TO INJECT THE APP INTO POPUP
// Path to the exported index.html
const indexPath = path.join(__dirname, './extension/index.html');

// Read the file
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Extract inline scripts
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let match;
let scriptIndex = 0;

while ((match = scriptRegex.exec(htmlContent))) {
  const scriptContent = match[1].trim();
  if (scriptContent) { // Only process non-empty scripts
    // Create a new script file
    const scriptFileName = `inline-script-${scriptIndex}.js`;
    fs.writeFileSync(path.join(__dirname, './extension', scriptFileName), scriptContent);
    
    // Replace the inline script with a reference to the file
    htmlContent = htmlContent.replace(
      match[0],
      `<script src="${scriptFileName}"></script>`
    );
    
    scriptIndex++;
  }
}

// Write the modified HTML back
fs.writeFileSync(indexPath, htmlContent);

console.log(`Successfully converted ${scriptIndex} inline scripts to external files.`);
