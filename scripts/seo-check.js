import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const directories = ['./', './dist']; // Scan root and build folder
const extensions = ['.html'];

const checkSEO = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    const errors = [];
    const warnings = [];

    // 1. Check Title
    const title = document.querySelector('title');
    if (!title || !title.textContent.trim()) {
        errors.push('Missing or empty <title> tag');
    } else if (title.textContent.length < 30) {
        warnings.push(`Title is very short (${title.textContent.length} chars): "${title.textContent}"`);
    }

    // 2. Check Meta Description
    const description = document.querySelector('meta[name="description"]');
    if (!description || !description.getAttribute('content').trim()) {
        errors.push('Missing or empty <meta name="description"> tag');
    }

    // 3. Check Alt attributes on images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
        const alt = img.getAttribute('alt');
        const src = img.getAttribute('src');
        if (alt === null) {
            errors.push(`Image missing alt attribute: ${src || 'index ' + index}`);
        } else if (alt.trim() === '') {
            warnings.push(`Image has empty alt attribute: ${src || 'index ' + index}`);
        }
    });

    // 4. Check H1
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
        errors.push('Missing <h1> tag');
    } else if (h1s.length > 1) {
        warnings.push(`Multiple <h1> tags found (${h1s.length})`);
    }

    return { errors, warnings };
};

const main = () => {
    let totalErrors = 0;
    const filesToScan = [];

    const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                    walk(fullPath);
                }
            } else if (extensions.includes(path.extname(file))) {
                filesToScan.push(fullPath);
            }
        });
    };

    directories.forEach(walk);

    console.log('--- SEO Analysis Report ---\n');

    filesToScan.forEach(file => {
        const { errors, warnings } = checkSEO(file);
        if (errors.length > 0 || warnings.length > 0) {
            console.log(`File: ${file}`);
            errors.forEach(err => {
                console.log(`  [ERROR] ${err}`);
                totalErrors++;
            });
            warnings.forEach(warn => {
                console.log(`  [WARN]  ${warn}`);
            });
            console.log('');
        }
    });

    if (totalErrors > 0) {
        console.log(`Total Critical Errors: ${totalErrors}`);
        process.exit(1); // Fail the CI if there are critical errors
    } else {
        console.log('SEO quality check passed with 0 critical errors.');
    }
};

main();
