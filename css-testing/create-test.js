#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get test name from command line arguments
const testName = process.argv[2];

if (!testName) {
    console.error('❌ Please provide a test name: pnpm create [test-name]');
    process.exit(1);
}

// Validate test name (only letters, numbers, hyphens, underscores)
if (!/^[a-zA-Z0-9-_]+$/.test(testName)) {
    console.error('❌ Test name can only contain letters, numbers, hyphens, and underscores');
    process.exit(1);
}

const testDir = path.join(__dirname, testName);

// Check if directory already exists
if (fs.existsSync(testDir)) {
    console.error(`❌ Test directory "${testName}" already exists`);
    process.exit(1);
}

// Create directory
fs.mkdirSync(testDir);

// Create HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${testName} - CSS Testing</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="title">${testName}</h1>
            <a href="../index.html" class="back-link">← Back to Hub</a>
        </header>

        <main class="main">
            <section class="test-section">
                <h2 class="section-title">Test Section</h2>
                <div class="content">
                    <p>This is your ${testName} test page. Edit the HTML, CSS, and JavaScript files to test your styles.</p>

                    <div class="sample-element">
                        <h3>Sample Element</h3>
                        <p>Add your test content here</p>
                        <button class="btn">Test Button</button>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>`;

// Create CSS file
const cssContent = `/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e0e0e0;
}

.title {
    font-size: 2.5rem;
    color: #2c3e50;
}

.back-link {
    color: #3498db;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.back-link:hover {
    color: #2980b9;
}

/* Main content */
.main {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
    font-size: 1.8rem;
    color: #34495e;
    margin-bottom: 1.5rem;
}

.content {
    color: #555;
}

.sample-element {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 4px solid #3498db;
}

.sample-element h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    transition: background-color 0.3s ease;
}

.btn:hover {
    background: #2980b9;
}

/* Add your custom styles below this line */`;

// Create JavaScript file
const jsContent = `// ${testName} JavaScript file
// Add your JavaScript code here

console.log('${testName} page loaded');

// Example: Add click event to button
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.querySelector('.btn');
    if (btn) {
        btn.addEventListener('click', function() {
            alert('Button clicked!');
        });
    }
});`;

// Write files
fs.writeFileSync(path.join(testDir, 'index.html'), htmlContent);
fs.writeFileSync(path.join(testDir, 'styles.css'), cssContent);
fs.writeFileSync(path.join(testDir, 'script.js'), jsContent);

// Update main index.html to include the new test
const mainIndexPath = path.join(__dirname, 'index.html');
let mainIndexContent = fs.readFileSync(mainIndexPath, 'utf8');

// Find the test-links div and add the new link
const testLinksRegex = /<div class="test-links">([\s\S]*?)<\/div>/;
const match = mainIndexContent.match(testLinksRegex);

if (match) {
    const newLink = `            <a href="${testName}/index.html" class="test-link">
                <h2>${testName}</h2>
                <p>${testName} test page</p>
            </a>
`;

    const updatedTestLinks = match[0].replace('</div>', newLink + '        </div>');
    mainIndexContent = mainIndexContent.replace(testLinksRegex, updatedTestLinks);

    fs.writeFileSync(mainIndexPath, mainIndexContent);
}

console.log(`✅ Created ${testName} test page successfully!`);
console.log(`📁 Directory: ${testDir}`);
console.log(`🌐 Files created:`);
console.log(`   - ${testName}/index.html`);
console.log(`   - ${testName}/styles.css`);
console.log(`   - ${testName}/script.js`);
console.log(`🔗 Added link to main index.html`);
console.log(`\n🚀 Run 'pnpm dev' to start the development server`);