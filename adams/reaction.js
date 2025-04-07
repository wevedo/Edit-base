const axios = require('axios');
const { adams } = require("../Ibrahim/adams");
const { exec } = require("child_process");
const child_process = require('child_process');

// Sleep function
const sleep = (ms) => {
    return new Promise((resolve) => { setTimeout(resolve, ms) });
}

// Improved GIF to video buffer conversion
const GIFBufferToVideoBuffer = async (gifBuffer) => {
    return new Promise(async (resolve, reject) => {
        try {
            const filename = `${Math.random().toString(36)}`;
            
            // Write the GIF buffer to a temporary file
            await require('fs').promises.writeFile(`./${filename}.gif`, gifBuffer);
            
            // Convert to MP4
            child_process.exec(
                `ffmpeg -i ./${filename}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ./${filename}.mp4`,
                async (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    
                    await sleep(2000); // Reduced wait time
                    
                    try {
                        // Read the MP4 file
                        const videoBuffer = await require('fs').promises.readFile(`./${filename}.mp4`);
                        
                        // Clean up temporary files
                        await Promise.all([
                            require('fs').promises.unlink(`./${filename}.mp4`),
                            require('fs').promises.unlink(`./${filename}.gif`)
                        ]);
                        
                        resolve(videoBuffer);
                    } catch (cleanupError) {
                        reject(cleanupError);
                    }
                }
            );
        } catch (writeError) {
            reject(writeError);
        }
    });
};

const generateReactionCommand = (reactionName, reactionEmoji) => {
    adams({
        nomCom: reactionName,
        categorie: "Reaction",
        reaction: reactionEmoji,
    },
    async (origineMessage, zk, commandeOptions) => {
        const { auteurMessage, auteurMsgRepondu, repondre, ms, msgRepondu } = commandeOptions;

        const url = `https://api.waifu.pics/sfw/${reactionName}`;
        try {
            // Get GIF URL from API
            const response = await axios.get(url);
            const imageUrl = response.data.url;

            // Download GIF directly as buffer
            const gifResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const gifBuffer = Buffer.from(gifResponse.data, 'binary');

            // Convert to video buffer
            const videoBuffer = await GIFBufferToVideoBuffer(gifBuffer);

            // Prepare message
            let caption;
            let mentions;
            
            if (msgRepondu) {
                caption = `@${auteurMessage.split("@")[0]} ${reactionName} @${auteurMsgRepondu.split("@")[0]}`;
                mentions = [auteurMessage, auteurMsgRepondu];
            } else {
                caption = `@${auteurMessage.split("@")[0]} ${reactionName} everyone`;
                mentions = [auteurMessage];
            }

            // Send video message
            await zk.sendMessage(origineMessage, { 
                video: videoBuffer,
                gifPlayback: true,
                caption: caption,
                mentions: mentions
            }, { quoted: ms });

        } catch (error) {
            console.error('Error:', error);
            repondre('Error occurred while processing the reaction: ' + error.message);
        }
    });
};

// Generate all reaction commands
generateReactionCommand("bully", "👊");
generateReactionCommand("cuddle", "🤗");
generateReactionCommand("cry", "😢");
generateReactionCommand("hug", "😊");
generateReactionCommand("awoo", "🐺");
generateReactionCommand("kiss", "😘");
generateReactionCommand("lick", "👅");
generateReactionCommand("pat", "👋");
generateReactionCommand("smug", "😏");
generateReactionCommand("bonk", "🔨");
generateReactionCommand("yeet", "🚀");
generateReactionCommand("blush", "😊");
generateReactionCommand("smile", "😄");
generateReactionCommand("wave", "👋");
generateReactionCommand("highfive", "✋");
generateReactionCommand("handhold", "🤝");
generateReactionCommand("nom", "👅");
generateReactionCommand("bite", "🦷");
generateReactionCommand("glomp", "🤗");
generateReactionCommand("slap", "👋");
generateReactionCommand("kill", "💀");
generateReactionCommand("kick", "🦵");
generateReactionCommand("happy", "😄");
generateReactionCommand("wink", "😉");
generateReactionCommand("poke", "👉");
generateReactionCommand("dance", "💃");
generateReactionCommand("cringe", "😬");
