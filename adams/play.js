const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Animation frames for loading
const LOADING_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const DOWNLOAD_STEPS = ['🔍 Searching...', '📡 Connecting...', '⬇️ Downloading...', '🧩 Processing...', '✅ Almost done...'];

// Function to send animated progress with newsletter context
async function sendProgress(zk, dest, originalMsg, initialText) {
    let progressMessage = await zk.sendMessage(
        dest,
        { 
            text: `${LOADING_FRAMES[0]} ${initialText}`,
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363285388090068@newsletter',
                    newsletterName: "BWM-XMD",
                    serverMessageId: 143,
                }
            }
        },
        { quoted: originalMsg }
    );

    let frameIndex = 0;
    const intervalId = setInterval(async () => {
        frameIndex = (frameIndex + 1) % LOADING_FRAMES.length;
        try {
            await zk.sendMessage(
                dest,
                { 
                    text: `${LOADING_FRAMES[frameIndex]} ${initialText}`,
                    edit: progressMessage.key,
                    contextInfo: {
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363285388090068@newsletter',
                            newsletterName: "BWM-XMD",
                            serverMessageId: 143,
                        }
                    }
                }
            );
        } catch (e) {
            clearInterval(intervalId);
        }
    }, 500);

    return {
        message: progressMessage,
        stop: () => clearInterval(intervalId)
    };
}

// Audio command with optimized speed and newsletter context
adams(
  {
    nomCom: "play",
    aliases: ["song", "audio", "mp3", "dlmp3", "sound"],
    categorie: "Search",
    reaction: "🎵",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) return repondre("🎵 Please provide a song name");

    const query = arg.join(" ");
    let progressTracker;

    try {
        // Start progress animation with newsletter context
        progressTracker = await sendProgress(zk, dest, ms, "Finding your song...");

        // Search YouTube
        const searchResults = await ytSearch(query);
        if (!searchResults.videos.length) throw new Error("No results found");

        const video = searchResults.videos[0];
        const videoUrl = video.url;
        const videoTitle = video.title || query;
        const videoDuration = video.timestamp || "Unknown";
        const videoThumbnail = video.thumbnail || "https://files.catbox.moe/sd49da.jpg";

        // Update progress
        await progressTracker.stop();
        progressTracker = await sendProgress(zk, dest, ms, "Preparing download...");

        const apiKey = '_0x5aff35,_0x1876stqr';
        const encodedUrl = encodeURIComponent(videoUrl);
        
        // Parallel API requests
        const audioApis = [
            `https://api.giftedtech.my.id/api/download/ytmp3?apikey=${apiKey}&url=${encodedUrl}`,
            `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodedUrl}`,
            `https://api.giftedtech.my.id/api/download/ytmusic?apikey=${apiKey}&url=${encodedUrl}`
        ];

        const apiRequests = audioApis.map(api => 
            axios.get(api).then(r => r.data).catch(() => null)
        );

        const results = await Promise.any(apiRequests.map(p => p.catch(e => null)));
        const downloadUrl = results?.result?.download_url || results?.url;

        if (!downloadUrl) throw new Error("Download failed");

        // Send with newsletter context and branding
        await sendMediaWithProgress(zk, dest, ms, {
            type: "audio",
            url: downloadUrl,
            title: videoTitle,
            duration: videoDuration,
            thumbnail: videoThumbnail,
            sourceUrl: videoUrl,
            source: "YouTube"
        });

    } catch (error) {
        console.error("Error:", error);
        await repondre({
            text: "❌ Couldn't get that song. Try again or use a different name",
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363285388090068@newsletter',
                    newsletterName: "BWM-XMD",
                    serverMessageId: 143,
                }
            }
        });
    } finally {
        if (progressTracker) await progressTracker.stop();
    }
  }
);

// Video command with newsletter context
adams(
  {
    nomCom: "video",
    aliases: ["vida", "mp4", "ytmp4", "dlmp4"],
    categorie: "Search",
    reaction: "🎥",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) return repondre("🎥 Please provide a video name");

    const query = arg.join(" ");
    let progressTracker;

    try {
        // Start progress animation with newsletter context
        progressTracker = await sendProgress(zk, dest, ms, "Searching for video...");

        // Search YouTube
        const searchResults = await ytSearch(query);
        if (!searchResults.videos.length) throw new Error("No results found");

        const video = searchResults.videos[0];
        const videoUrl = video.url;
        const videoTitle = video.title;
        const videoDuration = video.timestamp || "Unknown";
        const videoThumbnail = video.thumbnail || "https://files.catbox.moe/sd49da.jpg";

        // Update progress
        await progressTracker.stop();
        progressTracker = await sendProgress(zk, dest, ms, "Connecting to server...");

        const apiKey = '_0x5aff35,_0x1876stqr';
        const encodedUrl = encodeURIComponent(videoUrl);
        
        // Parallel API requests
        const videoApis = [
            `https://api.giftedtech.my.id/api/download/ytmp4?apikey=${apiKey}&url=${encodedUrl}`,
            `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodedUrl}`,
            `https://api.giftedtech.my.id/api/download/ytv?apikey=${apiKey}&url=${encodedUrl}`
        ];

        const apiRequests = videoApis.map(api => 
            axios.get(api).then(r => r.data).catch(() => null)
        );

        const results = await Promise.any(apiRequests.map(p => p.catch(e => null)));
        const downloadUrl = results?.result?.download_url || results?.url;

        if (!downloadUrl) throw new Error("Download failed");

        // Send with newsletter context and branding
        await sendMediaWithProgress(zk, dest, ms, {
            type: "video",
            url: downloadUrl,
            title: videoTitle,
            duration: videoDuration,
            thumbnail: videoThumbnail,
            sourceUrl: videoUrl,
            source: "YouTube"
        });

    } catch (error) {
        console.error("Error:", error);
        await repondre({
            text: "❌ Video download failed. Try again later",
            contextInfo: {
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363285388090068@newsletter',
                    newsletterName: "BWM-XMD",
                    serverMessageId: 143,
                }
            }
        });
    } finally {
        if (progressTracker) await progressTracker.stop();
    }
  }
);

// Improved media sending with progress updates and newsletter context
async function sendMediaWithProgress(zk, dest, originalMsg, options) {
    const { type, url, title, duration, thumbnail, sourceUrl, source } = options;
    
    // Step 1: Show download info with newsletter context
    const infoMsg = await zk.sendMessage(dest, {
        text: `📥 *BWM XMD DOWNLOADER*\n\n` +
              `🔹 *Title:* ${title}\n` +
              `🔹 *Source:* ${source}\n` +
              `🔹 *Duration:* ${duration}\n\n` +
              `${LOADING_FRAMES[0]} Preparing your ${type}...`,
        contextInfo: {
            mentionedJid: [originalMsg.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363285388090068@newsletter',
                newsletterName: "BWM-XMD",
                serverMessageId: 143,
            },
            externalAdReply: {
                title: `${type === 'audio' ? '🎵' : '🎥'} ${title}`,
                body: `Downloading from ${source}`,
                mediaType: 1,
                thumbnailUrl: thumbnail,
                sourceUrl: sourceUrl,
                renderLargerThumbnail: true,
                showAdAttribution: true
            }
        }
    }, { quoted: originalMsg });

    // Step 2: Animated progress with newsletter context
    let frameIndex = 0;
    const progressInterval = setInterval(async () => {
        frameIndex = (frameIndex + 1) % LOADING_FRAMES.length;
        const step = DOWNLOAD_STEPS[frameIndex % DOWNLOAD_STEPS.length];
        try {
            await zk.sendMessage(
                dest,
                { 
                    text: `${LOADING_FRAMES[frameIndex]} ${step}\n\n` +
                          `🔹 *Progress:* ${frameIndex * 20}%\n` +
                          `🔹 *ETA:* ${5 - (frameIndex % 5)}s`,
                    edit: infoMsg.key,
                    contextInfo: {
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363285388090068@newsletter',
                            newsletterName: "BWM-XMD",
                            serverMessageId: 143,
                        }
                    }
                }
            );
        } catch (e) {
            clearInterval(progressInterval);
        }
    }, 1000);

    // Step 3: Send the media with full branding
    try {
        const mediaPayload = {
            [type]: { url },
            mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
            caption: `=========================\n` +
                    ` *BWM XMD DOWNLOADER*\n` +
                    `=========================\n` +
                    ` *Title :* ${title}\n` +
                    ` *Duration :* ${duration}\n` +
                    `=========================\n\n` +
                    `> © Sir Ibrahim Adams`,
            fileName: `${title.substring(0, 50)}.${type === 'audio' ? 'mp3' : 'mp4'}`,
            contextInfo: {
                mentionedJid: [originalMsg.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363285388090068@newsletter',
                    newsletterName: "BWM-XMD",
                    serverMessageId: 143,
                },
                externalAdReply: {
                    title: title,
                    body: `Downloaded from ${source}`,
                    mediaType: 1,
                    thumbnailUrl: thumbnail,
                    sourceUrl: sourceUrl,
                    renderLargerThumbnail: true,
                    showAdAttribution: true
                }
            }
        };

        await zk.sendMessage(dest, mediaPayload, { quoted: originalMsg });
        
        // Update success message
        await zk.sendMessage(
            dest,
            { 
                text: `✅ *Download Complete!*\n\n` +
                      `🔹 *Title:* ${title}\n` +
                      `🔹 *Source:* ${source}\n` +
                      `🔹 *Duration:* ${duration}\n\n` +
                      `Enjoy your ${type}! 🎉`,
                edit: infoMsg.key,
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363285388090068@newsletter',
                        newsletterName: "BWM-XMD",
                        serverMessageId: 143,
                    }
                }
            }
        );
    } catch (e) {
        await zk.sendMessage(
            dest,
            { 
                text: `❌ *Failed to send ${type}*\n\n` +
                      `Please try again later`,
                edit: infoMsg.key,
                contextInfo: {
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363285388090068@newsletter',
                        newsletterName: "BWM-XMD",
                        serverMessageId: 143,
                    }
                }
            }
        );
    } finally {
        clearInterval(progressInterval);
    }
}
