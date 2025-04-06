const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const AdmZip = require('adm-zip');
const axios = require('axios');

const CONFIG_URL = 'https://raw.githubusercontent.com/wevedo/megalorder/refs/heads/main/bwmxmd.json';
const ZIP_NAME = 'mega-main.zip';
const MAIN_FILE = 'body.js'; // Changed from index.js to body.js

async function downloadAndExtractZip(megaLink) {
    return new Promise((resolve, reject) => {
        try {
            console.log('🔽 Downloading ZIP from MEGA...');
            const megaFile = File.fromURL(megaLink);
            const zipPath = path.join(__dirname, ZIP_NAME);

            megaFile.download(async (error, fileBuffer) => {
                if (error) return reject(error);

                try {
                    // Save ZIP file
                    fs.writeFileSync(zipPath, fileBuffer);
                    
                    // Extract ZIP
                    console.log('📦 Extracting files...');
                    const zip = new AdmZip(zipPath);
                    zip.extractAllTo(__dirname, true);
                    
                    // Clean up
                    fs.unlinkSync(zipPath);
                    console.log('✅ Extraction completed');
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

async function findMainFile() {
    // First try the direct path
    const directPath = path.join(__dirname, MAIN_FILE);
    if (fs.existsSync(directPath)) return directPath;

    // Recursive search if not found
    const searchFiles = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                const found = searchFiles(fullPath);
                if (found) return found;
            } else if (file.toLowerCase() === MAIN_FILE.toLowerCase()) {
                return fullPath;
            }
        }
        return null;
    };

    return searchFiles(__dirname);
}

async function main() {
    try {
        console.log('📡 Fetching configuration...');
        const { data } = await axios.get(CONFIG_URL);
        const megaLink = data.zipmegalink || data.megalink;

        if (!megaLink) throw new Error('No MEGA link found in config');

        await downloadAndExtractZip(megaLink);

        console.log('🔍 Locating main file...');
        const mainFilePath = await findMainFile();
        
        if (!mainFilePath) {
            // Show directory structure for debugging
            console.log('📂 Directory structure:');
            console.log(fs.readdirSync(__dirname));
            throw new Error(`${MAIN_FILE} not found after extraction`);
        }

        console.log(`🚀 Starting bot from: ${mainFilePath}`);
        require(mainFilePath);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
