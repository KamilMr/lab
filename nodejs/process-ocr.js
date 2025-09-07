import fs from 'fs'
import { execSync } from 'child_process';

function processOCRWithClaude(inputFile, outputFile, chunkSize = 500) {
    const content = fs.readFileSync(inputFile, 'utf8');
    
    // Clear output file
    fs.writeFileSync(outputFile, '');
    
    const totalChunks = Math.ceil(content.length / chunkSize);
    console.log(`Processing ${totalChunks} chunks of ${chunkSize} characters each...`);
    
    for (let i = 0; i < content.length; i += chunkSize) {
        const chunkNumber = Math.floor(i / chunkSize) + 1;
        const chunk = content.slice(i, i + chunkSize);
        const tempFile = `temp_chunk_${chunkNumber}.md`;
        
        console.log(`Processing chunk ${chunkNumber}/${totalChunks}...`);
        
        try {
            // Write chunk to temp file
            fs.writeFileSync(tempFile, chunk);
            
            // Run Claude command
            const result = execSync(`claude < ${tempFile} "Fix this OCR text:
  - Correct misspelled Polish words
  - Join words broken across lines (like 'przy-\\nwiązanie' → 'przywiązanie')
  - Fix common OCR errors (l→I, rn→m, etc)
  - Restore proper sentence structure
  - Only text as output that is from the book
  - Keep academic/technical terminology intact"`, { encoding: 'utf8' });
            
            // Append result to output file
            fs.appendFileSync(outputFile, result);
            
            // Clean up temp file
            fs.unlinkSync(tempFile);
            
        } catch (error) {
            console.error(`Error processing chunk ${chunkNumber}:`, error.message);
            // Clean up temp file on error
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
            
        }
    }
    
    console.log(`Processing complete. Output saved to ${outputFile}`);
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
    console.log('Usage: node process-ocr.js <input-file> <output-file> [chunk-size]');
    process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];
const chunkSize = args[2] ? parseInt(args[2]) : 500;

// Check if input file exists
if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' does not exist.`);
    process.exit(1);
}

// Run the processing
processOCRWithClaude(inputFile, outputFile, chunkSize);
