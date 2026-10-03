const fs = require('fs');
const path = require('path');

const directoryPath = 'd:\\navigators';

// Directories to skip
const ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build'];

// Extensions to process
const validExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.md', '.css', '.svg', '.mjs'];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                processDirectory(fullPath);
            }
        } else {
            const ext = path.extname(fullPath);
            if (validExtensions.includes(ext) || file === 'next.config.mjs' || file === 'next.config.ts') {
                processFile(fullPath);
            }
        }
    }
}

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Replacements
        content = content.replace(/The Navigators/g, 'The Navigators');
        content = content.replace(/THE NAVIGATORS/g, 'THE NAVIGATORS');
        content = content.replace(/The Navigators/g, 'The Navigators');
        content = content.replace(/THE NAVIGATORS/g, 'THE NAVIGATORS');
        content = content.replace(/thenavigators/g, 'thenavigators');
        content = content.replace(/thenavigatorsholidaysindia@gmail\.com/g, 'contact@thenavigators.in');
        content = content.replace(/contact@thenavigatorsholidays\.com/g, 'contact@thenavigators.in');

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated:', filePath);
        }
    } catch (e) {
        console.error('Error processing file:', filePath, e.message);
    }
}

processDirectory(directoryPath);
console.log('Done!');
