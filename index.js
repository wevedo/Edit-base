const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const AdmZip = require('adm-zip');
const axios = require('axios');

// Configuration
const CONFIG_URL = 'https://raw.githubusercontent.com/wevedo/Edit-base/main/bwmxmd.json';
const ZIP_FILE_NAME = 'mega-main.zip';
const ENTRY_FILE = 'body.js'; // Your main bot file

async function downloadConfig() {
    try {
        console.log('📡 Fetching configuration...');
        const response = await axios.get(CONFIG_URL);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to download config:', error.message);
        throw error;
    }
}

async function downloadAndExtractMegaZip(megaLink) {
    try {
        console.log('⬇️ Downloading ZIP from MEGA...');
        const megaFile = File.fromURL(megaLink);
        const zipPath = path.join(__dirname, ZIP_FILE_NAME);

        // Download file
        const fileBuffer = await new Promise((resolve, reject) => {
            megaFile.download((error, data) => {
                error ? reject(error) : resolve(data);
            });
        });

        // Save to disk
        fs.writeFileSync(zipPath, fileBuffer);
        console.log('✔️ ZIP downloaded successfully');

        // Extract ZIP
        console.log('📦 Extracting files...');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(__dirname, true);

        // Clean up
        fs.unlinkSync(zipPath);
        console.log('✔️ Extraction completed');
    } catch (error) {
        console.error('❌ Error processing MEGA ZIP:', error.message);
        throw error;
    }
}

async function startBot() {
    try {
        console.log('🤖 Starting bot...');
        const botPath = path.join(__dirname, ENTRY_FILE);
        
        if (!fs.existsSync(botPath)) {
            throw new Error(`Main bot file (${ENTRY_FILE}) not found`);
        }

        require(botPath);
        console.log('✔️ Bot started successfully');
    } catch (error) {
        console.error('❌ Failed to start bot:', error.message);
        throw error;
    }
}

async function main() {
    try {
        // Step 1: Get config with MEGA link
        const config = await downloadConfig();
        
        // Step 2: Download and extract ZIP
        await downloadAndExtractMegaZip(config.zipmegalink || config.megalink);
        
        // Step 3: Start the bot
        await startBot();
    } catch (error) {
        console.error('💀 Critical error:', error.message);
        process.exit(1);
    }
}

// Start the process
main();
