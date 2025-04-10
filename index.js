

/*/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱//
______     __     __     __    __        __  __     __    __     _____    
/\  == \   /\ \  _ \ \   /\ "-./  \      /\_\_\_\   /\ "-./  \   /\  __-.  
\ \  __<   \ \ \/ ".\ \  \ \ \-./\ \     \/_/\_\/_  \ \ \-./\ \  \ \ \/\ \ 
 \ \_____\  \ \__/".~\_\  \ \_\ \ \_\      /\_\/\_\  \ \_\ \ \_\  \ \____- 
  \/_____/   \/_/   \/_/   \/_/  \/_/      \/_/\/_/   \/_/  \/_/   \/____/ 
                                                                           
/▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰/*/
    



                   
                   
const { default: makeWASocket, isJidGroup, downloadMediaMessage, downloadAndSaveMediaMessage, superUser, imageMessage, CommandSystem, repondre,  verifierEtatJid, recupererActionJid, DisconnectReason, getMessageText, commandRegistry, delay, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, useMultiFileAuthState, makeInMemoryStore, jidDecode, getContentType } = require("@whiskeysockets/baileys");
const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child({});
const { createContext } = require("./Ibrahim/helper");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const conf = require("./config");
const config = require("./config");
const abu = require("./config");
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");
const https = require('https');
const FileType = require("file-type");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const evt = require("./Ibrahim/adams");
const rateLimit = new Map();
const MAX_RATE_LIMIT_ENTRIES = 100000;
const RATE_LIMIT_WINDOW = 3000; // 3 seconds
const chalk = require("chalk");
const express = require("express");
const { exec } = require("child_process");
const http = require("http");
const zlib = require('zlib');
const PREFIX = conf.PREFIX;
const { promisify } = require('util');
const stream = require('stream');
const AdmZip = require("adm-zip");
const { File } = require('megajs');
const pipeline = promisify(stream.pipeline);
const more = String.fromCharCode(8206);
const herokuAppName = process.env.HEROKU_APP_NAME || "Unknown App Name";
const herokuAppLink = process.env.HEROKU_APP_LINK || `https://dashboard.heroku.com/apps/${herokuAppName}`;
const botOwner = process.env.NUMERO_OWNER || "Unknown Owner";
const PORT = process.env.PORT || 3000;
const app = express();
let adams;
require("dotenv").config({ path: "./config.env" });
logger.level = "silent";
app.use(express.static("adams"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(PORT, () => console.log(`Bwm xmd is starting with a speed of ${PORT}ms🚀`));


//============================================================================//


function atbverifierEtatJid(jid) {
    if (!jid.endsWith('@s.whatsapp.net')) {
        console.error('Your verified by Sir Ibrahim Adams', jid);
        return false;
    }
    console.log('Welcome to bwm xmd', jid);
    return true;
}

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/adams/creds.json")) {
            console.log("Bwm xmd session connected ✅");
            // Split the session strihhhhng into header and Base64 data
            const [header, b64data] = conf.session.split(';;;'); 

            // Validate the session format
            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64'); // Decode and truncate
                let decompressedData = zlib.gunzipSync(compressedData); // Decompress session
                fs.writeFileSync(__dirname + "/adams/creds.json", decompressedData, "utf8"); // Save to file
            } else {
                throw new Error("Invalid session format");
            }
        } else if (fs.existsSync(__dirname + "/adams/creds.json") && conf.session !== "zokk") {
            console.log("Updating existing session...");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "BWM-XMD" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/adams/creds.json", decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (e) {
        console.log("Session Invalid: " + e.message);
        return;
    }
}
module.exports = { authentification };
authentification();
let zk;

//===============================================================================//

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" })
});

async function main() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/adams");
    
    const sockOptions = {
        version,
        logger: pino({ level: "silent" }),
        browser: ['BWM XMD', "safari", "1.0.0"],
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return { conversation: 'Error occurred' };
        }
    };

    adams = makeWASocket(sockOptions);
    store.bind(adams.ev);

function isRateLimited(jid) {
    // Automatic cleanup when map gets too large
    if (rateLimit.size > MAX_RATE_LIMIT_ENTRIES) {
        const now = Date.now();
        for (const [key, value] of rateLimit.entries()) {
            if (now - value > RATE_LIMIT_WINDOW) {
                rateLimit.delete(key);
            }
        }
    }

    const now = Date.now();
    if (!rateLimit.has(jid)) {
        rateLimit.set(jid, now);
        return false;
    }
    
    const lastRequestTime = rateLimit.get(jid);
    if (now - lastRequestTime < RATE_LIMIT_WINDOW) return true;
    
    rateLimit.set(jid, now);
    return false;
}

// Optimized Group Metadata Handling with memory management
const groupMetadataCache = new Map();
const MAX_CACHE_ENTRIES = 50000;
const CACHE_TTL = 60000; // 1 minute

async function getGroupMetadata(groupId) {
    // Automatic cache cleanup when it gets too large
    if (groupMetadataCache.size > MAX_CACHE_ENTRIES) {
        const now = Date.now();
        for (const [key, { timestamp }] of groupMetadataCache.entries()) {
            if (now - timestamp > CACHE_TTL) {
                groupMetadataCache.delete(key);
            }
        }
    }

    if (groupMetadataCache.has(groupId)) {
        return groupMetadataCache.get(groupId).metadata;
    }

    try {
        const metadata = await zk.groupMetadata(groupId);
        const cacheEntry = {
            metadata,
            timestamp: Date.now()
        };
        groupMetadataCache.set(groupId, cacheEntry);
        
        // Set timeout for individual entry cleanup
        setTimeout(() => {
            if (groupMetadataCache.get(groupId)?.timestamp === cacheEntry.timestamp) {
                groupMetadataCache.delete(groupId);
            }
        }, CACHE_TTL);
        
        return metadata;
    } catch (error) {
        if (error.message.includes("rate-overlimit")) {
            await new Promise(res => setTimeout(res, 5000));
            return getGroupMetadata(groupId); // Retry after delay
        }
        return null;
    }
}

// Event listener management to prevent memory leaks
function setupListeners(bot) {
    // Remove any existing listeners first
    bot.ev.removeAllListeners('messages.upsert');
    
    // Set max listeners to a higher number
    bot.ev.setMaxListeners(50);
    
    // Efficient message handler with error protection
    bot.ev.on('messages.upsert', async ({ messages }) => {
        try {
            // Process messages in batches if needed
            for (const message of messages) {
                // Your message processing logic here
            }
        } catch (error) {
            console.error('Message processing error:', error);
        }
    });
}

// Initialize with proper memory management
function initializeBot(bot) {
    setupListeners(bot);
    
    // Regular memory cleanup interval
    setInterval(() => {
        // Cleanup rate limit map
        const now = Date.now();
        for (const [key, value] of rateLimit.entries()) {
            if (now - value > RATE_LIMIT_WINDOW * 10) { // 10x the window
                rateLimit.delete(key);
            }
        }
        
        // Cleanup group metadata cache
        const cacheNow = Date.now();
        for (const [key, { timestamp }] of groupMetadataCache.entries()) {
            if (cacheNow - timestamp > CACHE_TTL * 2) { // 2x the TTL
                groupMetadataCache.delete(key);
            }
        }
    }, 300000); // Run every 5 minutes
}

// Original code format maintained below:
    // Silent Rate Limiting
    function isRateLimited(jid) {
        const now = Date.now();
        if (!rateLimit.has(jid)) {
            rateLimit.set(jid, now);
            return false;
        }
        const lastRequestTime = rateLimit.get(jid);
        if (now - lastRequestTime < 3000) return true;
        rateLimit.set(jid, now);
        return false;
    }
    async function getGroupMetadata(groupId) {
        if (groupMetadataCache.has(groupId)) {
            return groupMetadataCache.get(groupId);
        }
        try {
            const metadata = await zk.groupMetadata(groupId);
            groupMetadataCache.set(groupId, metadata);
            setTimeout(() => groupMetadataCache.delete(groupId), 60000);
            return metadata;
        } catch (error) {
            if (error.message.includes("rate-overlimit")) {
                await new Promise(res => setTimeout(res, 5000));
            }
            return null;
        }
    }


 //============================================================================//
 let ibraah = { chats: {} };
const botJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;
const botOwnerJid = `${adams.user?.id.split(':')[0]}@s.whatsapp.net`;

// Improved media processing function with better error handling
const processMediaMessage = async (deletedMessage) => {
    let mediaType, mediaInfo;
    
    const mediaTypes = {
        imageMessage: 'image',
        videoMessage: 'video',
        audioMessage: 'audio',
        stickerMessage: 'sticker',
        documentMessage: 'document'
    };

    for (const [key, type] of Object.entries(mediaTypes)) {
        if (deletedMessage.message?.[key]) {
            mediaType = type;
            mediaInfo = deletedMessage.message[key];
            break;
        }
    }

    if (!mediaType || !mediaInfo) return null;

    try {
        const mediaStream = await downloadMediaMessage(deletedMessage, { logger });
        
        const extensions = {
            image: 'jpg',
            video: 'mp4',
            audio: mediaInfo.mimetype?.includes('mpeg') ? 'mp3' : 'ogg',
            sticker: 'webp',
            document: mediaInfo.fileName?.split('.').pop() || 'bin'
        };
        
        const tempPath = path.join(__dirname, `temp_media_${Date.now()}.${extensions[mediaType]}`);
        await pipeline(mediaStream, fs.createWriteStream(tempPath));
        
        return {
            path: tempPath,
            type: mediaType,
            caption: mediaInfo.caption || '',
            mimetype: mediaInfo.mimetype,
            fileName: mediaInfo.fileName || `${mediaType}_${Date.now()}.${extensions[mediaType]}`,
            ptt: mediaInfo.ptt
        };
    } catch (error) {
        logger.error(`Media processing failed:`, error);
        return null;
    }
};

// Enhanced message forwarding function with better synchronization
const handleDeletedMessage = async (deletedMsg, key, deleter) => {
    const context = createContext(deleter, {
        title: "Anti-Delete Protection",
        body: "Deleted message detected",
        thumbnail: "https://files.catbox.moe/sd49da.jpg"
    });

    const chatInfo = key.remoteJid.includes('@g.us') ? 
        `Group: ${key.remoteJid}` : 
        `DM with @${deleter.split('@')[0]}`;

    try {
        // Handle both ANTIDELETE1 and ANTIDELETE2 in parallel for better performance
        const promises = [];
        
        if (config.ANTIDELETE1 === "yes") {
            promises.push((async () => {
                try {
                    const baseAlert = `♻️ *Anti-Delete Alert* ♻️\n\n` +
                                    `🛑 Deleted by @${deleter.split('@')[0]}\n` +
                                    `💬 In: ${chatInfo}`;

                    if (deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage?.text) {
                        const text = deletedMsg.message.conversation || 
                                    deletedMsg.message.extendedTextMessage.text;
                        
                        await adams.sendMessage(key.remoteJid, {
                            text: `${baseAlert}\n\n📝 *Content:* ${text}`,
                            mentions: [deleter],
                            ...context
                        });
                    } else {
                        // Handle media in chat
                        const media = await processMediaMessage(deletedMsg);
                        if (media) {
                            await adams.sendMessage(key.remoteJid, {
                                [media.type]: { url: media.path },
                                caption: media.caption ? 
                                    `${baseAlert}\n\n📌 *Media Caption:* ${media.caption}` : 
                                    baseAlert,
                                mentions: [deleter],
                                ...context,
                                ...(media.type === 'document' ? {
                                    mimetype: media.mimetype,
                                    fileName: media.fileName
                                } : {}),
                                ...(media.type === 'audio' ? {
                                    ptt: media.ptt,
                                    mimetype: media.mimetype
                                } : {})
                            });

                            // Cleanup temp file
                            setTimeout(() => {
                                if (fs.existsSync(media.path)) {
                                    fs.unlink(media.path, (err) => {
                                        if (err) logger.error('Cleanup failed:', err);
                                    });
                                }
                            }, 30000);
                        }
                    }
                } catch (error) {
                    logger.error('Failed to process ANTIDELETE1:', error);
                }
            })());
        }

        if (config.ANTIDELETE2 === "yes") {
            promises.push((async () => {
                try {
                    const ownerContext = {
                        ...context,
                        text: `👤 Sender: ${deleter}\n💬 Chat: ${chatInfo}`
                    };

                    if (deletedMsg.message.conversation || deletedMsg.message.extendedTextMessage?.text) {
                        const text = deletedMsg.message.conversation || 
                                    deletedMsg.message.extendedTextMessage.text;
                        
                        await adams.sendMessage(botOwnerJid, { 
                            text: `📩 *Forwarded Deleted Message*\n\n${text}\n\n${ownerContext.text}`,
                            ...context
                        });
                    } else {
                        const media = await processMediaMessage(deletedMsg);
                        if (media) {
                            await adams.sendMessage(botOwnerJid, {
                                [media.type]: { url: media.path },
                                caption: media.caption ? 
                                    `📩 *Forwarded Deleted Media*\n\n${media.caption}\n\n${ownerContext.text}` : 
                                    `📩 *Forwarded Deleted Media*\n\n${ownerContext.text}`,
                                ...context,
                                ...(media.type === 'document' ? {
                                    mimetype: media.mimetype,
                                    fileName: media.fileName
                                } : {}),
                                ...(media.type === 'audio' ? {
                                    ptt: media.ptt,
                                    mimetype: media.mimetype
                                } : {})
                            });

                            // Cleanup temp file
                            setTimeout(() => {
                                if (fs.existsSync(media.path)) {
                                    fs.unlink(media.path, (err) => {
                                        if (err) logger.error('Cleanup failed:', err);
                                    });
                                }
                            }, 30000);
                        }
                    }
                } catch (error) {
                    logger.error('Failed to process ANTIDELETE2:', error);
                    await adams.sendMessage(botOwnerJid, {
                        text: `⚠️ Failed to forward deleted message from ${deleter}\n\nError: ${error.message}`,
                        ...context
                    });
                }
            })());
        }

        await Promise.all(promises);
    } catch (error) {
        logger.error('Anti-delete handling failed:', error);
    }
};

adams.ev.on("messages.upsert", async ({ messages }) => {
    try {
        const ms = messages[0];
        if (!ms?.message) return;

        const { key } = ms;
        if (!key?.remoteJid) return;

        const sender = key.participant || key.remoteJid;
        if (sender === botJid || sender === botOwnerJid || key.fromMe) return;

        // Store message with timestamp
        if (!ibraah.chats[key.remoteJid]) ibraah.chats[key.remoteJid] = [];
        ibraah.chats[key.remoteJid].push({
            ...ms,
            timestamp: Date.now()
        });

        // Cleanup old messages (keep only last 100 messages per chat)
        if (ibraah.chats[key.remoteJid].length > 100) {
            ibraah.chats[key.remoteJid].shift();
        }

        // Check for deletion
        if (ms.message?.protocolMessage?.type === 0) {
            const deletedId = ms.message.protocolMessage.key.id;
            const deletedMsg = ibraah.chats[key.remoteJid].find(m => m.key.id === deletedId);
            if (!deletedMsg?.message) return;

            const deleter = ms.key.participant || ms.key.remoteJid;
            if (deleter === botJid || deleter === botOwnerJid) return;

            // Immediately handle the deleted message
            await handleDeletedMessage(deletedMsg, key, deleter);

            // Remove the deleted message from ibraah
            ibraah.chats[key.remoteJid] = ibraah.chats[key.remoteJid].filter(m => m.key.id !== deletedId);
        }
    } catch (error) {
        logger.error('Anti-delete system error:', error);
    }
});


// Get country code from JID (last 2 characters before @)
function getCountryCode() {
    return botOwnerJid.split('@')[0].slice(-2).toUpperCase();
}

// Enhanced date/time formatter
function getCurrentDateTime() {
    return new Intl.DateTimeFormat("en-KE", {
        timeZone: "Africa/Nairobi",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(new Date());
}

// Improved Weather fetcher with better error handling (without city name)
async function getWeatherUpdate() {
    const apiKey = "060a6bcfa19809c2cd4d97a212b19273";
    const countryCode = getCountryCode();
    
    try {
        // First try to get country capital
        const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const countryData = await countryResponse.json();
        const capital = countryData[0]?.capital?.[0] || "Nairobi"; // Fallback to Nairobi
        
        // Then get weather for capital
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${apiKey}&lang=en`);
        const weatherData = await weatherResponse.json();
        
        if (weatherData.cod !== 200) throw new Error("Weather API error");
        
        return `🌡️ ${Math.round(weatherData.main.temp)}°C | ${weatherData.weather[0].description} | 💧 ${weatherData.main.humidity}% | 🌬️ ${weatherData.wind.speed}m/s`;
    } catch (error) {
        console.error("Weather API error:", error.message);
        
        // Fallback to default city (Nairobi) if both attempts fail
        try {
            const fallbackResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Nairobi&units=metric&appid=${apiKey}&lang=en`);
            const fallbackData = await fallbackResponse.json();
            return `🌡️ ${Math.round(fallbackData.main.temp)}°C | ${fallbackData.weather[0].description} | 💧 ${fallbackData.main.humidity}% | 🌬️ ${fallbackData.wind.speed}m/s`;
        } catch (fallbackError) {
            console.error("Fallback weather also failed:", fallbackError.message);
            return null;
        }
    }
}

// Auto Bio Update System
if (conf.AUTO_BIO === "yes") {
    const updateBio = async () => {
        try {
            const weatherInfo = await getWeatherUpdate();
            const timeDate = getCurrentDateTime();
            
            const bioText = weatherInfo 
                ? `BWM XMD ONLINE 🚀\n${weatherInfo}\n📅 ${timeDate}`
                : `BWM XMD ONLINE 🚀\n📅 ${timeDate}`;
            
            await adams.updateProfileStatus(bioText);
            //console.log('Bio updated at:', new Date().toLocaleString());
        } catch (error) {
            //console.error('Bio update failed:', error.message);
        }
    };

    // Initial update after 10 seconds
    setTimeout(updateBio, 10000);
    
    // Update every 60 minutes
    setInterval(updateBio, 3600000);
}

// Silent Anti-Call System (unchanged)
if (conf.ANTICALL === 'yes') {
    adams.ev.on("call", async (callData) => {
        try {
            await adams.rejectCall(callData[0].id, callData[0].from);
            console.log('Call blocked from:', callData[0].from.slice(0, 6) + '...');
        } catch (error) {
            console.error('Call block failed:', error.message);
        }
    });
}


   const updatePresence = async (jid) => {
            try {
                // Get presence state from config
                const etat = config.ETAT || 0; // Default to 0 (unavailable) if not set
                
                // Set presence based on ETAT value
                if (etat == 1) {
                    await adams.sendPresenceUpdate("available", jid);
                } else if (etat == 2) {
                    await adams.sendPresenceUpdate("composing", jid);
                } else if (etat == 3) {
                    await adams.sendPresenceUpdate("recording", jid);
                } else {
                    await adams.sendPresenceUpdate("unavailable", jid);
                }
                
                logger.debug(`Presence updated based on ETAT: ${etat}`);
            } catch (e) {
                logger.error('Presence update failed:', e.message);
            }
        };

        // Update presence on connection
        adams.ev.on("connection.update", ({ connection }) => {
            if (connection === "open") {
                logger.info("Connection established - updating presence");
                updatePresence("status@broadcast");
            }
        });

        // Update presence when receiving a message
        adams.ev.on("messages.upsert", async ({ messages }) => {
            if (messages && messages.length > 0) {
                await updatePresence(messages[0].key.remoteJid);
            }
        });
      // Chatbot System with Integrated Identity Response


const googleTTS = require("google-tts-api");
const { createContext2 } = require("./Ibrahim/helper2");

const availableApis = [
    "https://bk9.fun/ai/jeeves-chat2?q=",
    "https://bk9.fun/ai/jeeves-chat?q=",
    "https://bk9.fun/ai/llama?q=",
    "https://bk9.fun/ai/Aoyo?q="
];

function getRandomApi() {
    return availableApis[Math.floor(Math.random() * availableApis.length)];
}

function processForTTS(text) {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/[\[\]\(\)\{\}]/g, ' ')
              .replace(/\s+/g, ' ')
              .substring(0, 190);
}

async function getAIResponse(query) {
    const identityPatterns = [
        /who\s*(made|created|built)\s*you/i,
        /who\s*is\s*your\s*(creator|developer|maker)/i,
        /what('?s| is) your name/i,
        /are\s*you\s*bwm/i,
        /you\s*called\s*bwm/i
    ];

    const isIdentityQuestion = identityPatterns.some(pattern => 
        typeof query === 'string' && pattern.test(query)
    );
    
    try {
        const apiUrl = getRandomApi();
        const response = await fetch(apiUrl + encodeURIComponent(query));
        
        // First try to parse as JSON
        try {
            const data = await response.json();
            // Handle different API response formats
            let aiResponse = data.BK9 || data.result || data.response || data.message || 
                           (data.data && (data.data.text || data.data.message)) || 
                           JSON.stringify(data);
            
            // If we got an object, stringify it
            if (typeof aiResponse === 'object') {
                aiResponse = JSON.stringify(aiResponse);
            }

            if (isIdentityQuestion) {
                aiResponse = `I'm BWM XMD, created by Ibrahim Adams! 🚀\n\n${aiResponse}`;
            }
            
            return aiResponse;
        } catch (jsonError) {
            // If JSON parse fails, try to get as text
            const textResponse = await response.text();
            return isIdentityQuestion 
                ? `I'm BWM XMD, created by Ibrahim Adams! 🚀\n\n${textResponse}`
                : textResponse;
        }
    } catch (error) {
        console.error("API Error:", error);
        return isIdentityQuestion 
            ? "I'm BWM XMD, created by Ibrahim Adams! 🚀"
            : "Sorry, I couldn't get a response right now";
    }
}

if (conf.CHATBOT === "yes" || conf.CHATBOT1 === "yes") {
    adams.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg?.message || msg.key.fromMe) return;

            const jid = msg.key.remoteJid;
            let text = '';
            
            if (msg.message.conversation) {
                text = msg.message.conversation;
            } else if (msg.message.extendedTextMessage?.text) {
                text = msg.message.extendedTextMessage.text;
            } else if (msg.message.imageMessage?.caption) {
                text = msg.message.imageMessage.caption;
            }

            if (!text || typeof text !== 'string') return;

            const aiResponse = await getAIResponse(text);

            // Text response
            if (conf.CHATBOT === "yes") {
                await adams.sendMessage(jid, { 
                    text: String(aiResponse),
                    ...createContext(jid, {
                        title: "BWM XMD Response",
                        body: "Powered by Ibrahim Adams"
                    })
                }, { quoted: msg });
            }

            // Voice response
            if (conf.CHATBOT1 === "yes") {
                const ttsText = processForTTS(String(aiResponse));
                if (ttsText) {
                    const audioUrl = googleTTS.getAudioUrl(ttsText, {
                        lang: "en",
                        slow: false,
                        host: "https://translate.google.com",
                    });

                    await adams.sendMessage(jid, {
                        audio: { url: audioUrl },
                        mimetype: "audio/mpeg",
                        ptt: true,
                        ...createContext2(jid, {
                            title: "BWM XMD Voice",
                            body: "AI Response"
                        })
                    }, { quoted: msg });
                }
            }
        } catch (error) {
            console.error("Message processing error:", error);
        }
    });
}

 const isAnyLink = (message) => {
    // Regex pattern to detect any link
    const linkPattern = /https?:\/\/[^\s]+/;
    return linkPattern.test(message);
};

adams.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];

        if (!message.message) return; // Skip empty messages

        const from = message.key.remoteJid; // Chat ID
        const sender = message.key.participant || message.key.remoteJid; // Sender ID
        const isGroup = from.endsWith('@g.us'); // Check if the message is from a group

        if (!isGroup) return; // Skip non-group messages

        const groupMetadata = await adams.groupMetadata(from); // Fetch group metadata
        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.id);

        // Check if ANTI-LINK is enabled for the group
        if (conf.GROUP_ANTILINK === 'yes') {
            const messageType = Object.keys(message.message)[0];
            const body =
                messageType === 'conversation'
                    ? message.message.conversation
                    : message.message[messageType]?.text || '';

            if (!body) return; // Skip if there's no text

            // Skip messages from admins
            if (groupAdmins.includes(sender)) return;

            // Check for any link
            if (isAnyLink(body)) {
                // Delete the message
                await adams.sendMessage(from, { delete: message.key });

                // Remove the sender from the group
                await adams.groupParticipantsUpdate(from, [sender], 'remove');

                // Send a notification to the group
                await adams.sendMessage(
                    from,
                    {
                        text: `⚠️Bwm xmd anti-link online!\n User @${sender.split('@')[0]} has been removed for sharing a link.`,
                        mentions: [sender],
                    }
                );
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});
// Listener Manager Class (Updated to load specific files only)
class ListenerManager {
    constructor() {
        this.activeListeners = new Map();
        this.targetListeners = new Set([
            'Welcome_Goodbye.js',
            'Status_update.js',
           // 'Group_antilink.js',
            'Autoreact_status.js'
        ]);
    }

    async loadListeners(adams, store, commands) {
        const listenerDir = path.join(__dirname, 'bwmxmd');
        
        // Clear existing listeners first
        this.cleanupListeners();
        
        // Load only target listeners
        const files = fs.readdirSync(listenerDir).filter(f => 
            this.targetListeners.has(f)
        );
        
        for (const file of files) {
            try {
                const listenerPath = path.join(listenerDir, file);
                const { setup } = require(listenerPath);
                
                if (typeof setup === 'function') {
                    const cleanup = await setup(adams, { 
                        store,
                        commands,
                        logger,
                        config: conf
                    });
                    
                    this.activeListeners.set(file, cleanup);
                    //console.log(`🚀 Loaded listener: ${file}`);
                }
            } catch (e) {
                console.error(`Error loading listener ${file}:`, e);
            }
        }
    }

    cleanupListeners() {
        for (const [name, cleanup] of this.activeListeners) {
            try {
                if (typeof cleanup === 'function') cleanup();
                console.log(`♻️ Cleaned up listener: ${name}`);
            } catch (e) {
                console.error(`Error cleaning up listener ${name}:`, e);
            }
        }
        this.activeListeners.clear();
    }
}

// Initialize listener manager
const listenerManager = new ListenerManager();

// Connection handler (unchanged)
adams.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') {
        listenerManager.loadListeners(adams, store, commandRegistry)
            .then(() => console.log('🚀 Enjoy quantum speed 🌎'))
            .catch(console.error);
    }
    
    if (connection === 'close') {
        listenerManager.cleanupListeners();
    }
});

// Selective hot reload - only for our target listeners
fs.watch(path.join(__dirname, 'bwmxmd'), (eventType, filename) => {
    if (eventType === 'change' && listenerManager.targetListeners.has(filename)) {
        console.log(`♻️ Reloading listener: ${filename}`);
        delete require.cache[require.resolve(path.join(__dirname, 'bwmxmd', filename))];
        listenerManager.loadListeners(adams, store, commandRegistry)
            .catch(console.error);
    }
});


 

 //============================================================================================================

console.log("lorded all commands successfully 🤗\n");
try {
    const taskflowPath = path.join(__dirname, "adams");
    fs.readdirSync(taskflowPath).forEach((fichier) => {
        if (path.extname(fichier).toLowerCase() === ".js") {
            try {
                require(path.join(taskflowPath, fichier));
              //  console.log(`✔️ ${fichier} installed successfully.`);
            } catch (e) {
                console.error(`❌ Failed to load ${fichier}: ${e.message}`);
            }
        }
    });
} catch (error) {
    console.error("❌ Error reading Taskflow folder:", error.message);
}
 //============================================================================/

adams.ev.on("messages.upsert", async ({ messages }) => {
    const ms = messages[0];
    if (!ms?.message || !ms?.key) return;

    // Helper function to safely decode and standardize JID
    function standardizeJid(jid) {
        if (!jid) return '';
        jid = typeof jid.decodeJid === 'function' ? jid.decodeJid() : String(jid);
        // Ensure proper JID format
        if (!jid.includes('@')) jid += '@s.whatsapp.net';
        return jid.toLowerCase(); // case insensitive comparison
    }

    // Extract core message information
    const origineMessage = standardizeJid(ms.key.remoteJid);
    const idBot = standardizeJid(adams.user?.id);
    const verifGroupe = origineMessage.endsWith("@g.us");
    
    // Group metadata handling
    let infosGroupe = null;
    let nomGroupe = '';
    try {
        infosGroupe = verifGroupe ? await adams.groupMetadata(origineMessage).catch(() => null) : null;
        nomGroupe = infosGroupe?.subject || '';
    } catch (err) {
        console.error("Group metadata error:", err);
    }

    // Quoted message handling
    const msgRepondu = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    const auteurMsgRepondu = standardizeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
    const mentionedJids = (ms.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).map(standardizeJid);

    // Author determination
    let auteurMessage = verifGroupe 
        ? standardizeJid(ms.key.participant || ms.participant || origineMessage)
        : origineMessage;
    if (ms.key.fromMe) auteurMessage = idBot;

    // Determine user being addressed (for mentions or quoted messages)
    const utilisateur = mentionedJids.length > 0 
        ? mentionedJids[0] 
        : msgRepondu 
            ? auteurMsgRepondu 
            : '';

    // Define SUDO numbers (without @s.whatsapp.net)
    const SUDO_NUMBERS = [
        "254710772666",
        "254106727593",
        "254727716045"
    ];

    const botJid = idBot;
    const ownerJid = standardizeJid(conf.OWNER_NUMBER);

    // Super users who can always use commands
    const superUser = [
        ownerJid,
        botJid,
        ...SUDO_NUMBERS.map(num => standardizeJid(num))
    ];

    // Check if sender is superUser
    const isSuperUser = superUser.includes(auteurMessage);

    let verifAdmin = false;
    let botIsAdmin = false;
    if (verifGroupe && infosGroupe) {
        const admins = infosGroupe.participants.filter(p => p.admin).map(p => standardizeJid(p.id));
        verifAdmin = admins.includes(auteurMessage);
        botIsAdmin = admins.includes(botJid);
    }

    // Message content processing
    const texte = ms.message?.conversation || 
                 ms.message?.extendedTextMessage?.text || 
                 ms.message?.imageMessage?.caption || 
                 '';
    const arg = typeof texte === 'string' ? texte.trim().split(/\s+/).slice(1) : [];
    const verifCom = typeof texte === 'string' && texte.startsWith(PREFIX);
    const com = verifCom ? texte.slice(PREFIX.length).trim().split(/\s+/)[0]?.toLowerCase() : null;

    if (verifCom && com) {
        const cmd = Array.isArray(evt.cm) 
            ? evt.cm.find((c) => 
                c?.nomCom === com || 
                (Array.isArray(c?.aliases) && c.aliases.includes(com))
            )
            : null;

        if (cmd) {
            // MODE check - superUser can always bypass restrictions
            if (conf.MODE?.toLowerCase() === "no" && !isSuperUser) {
                //console.log(`Command blocked for ${auteurMessage} - MODE is set to "no"`);
                return;
            }


            try {
                // Reply function with context
                const repondre = async (text, options = {}) => {
                    if (typeof text !== 'string') return;
                    try {
                        await adams.sendMessage(origineMessage, { 
                            text,
                            ...createContext(auteurMessage, {
                                title: options.title || nomGroupe || "BWM-XMD",
                                body: options.body || ""
                            })
                        }, { quoted: ms });
                    } catch (err) {
                        console.error("Reply error:", err);
                    }
                };

                // Add reaction
                if (cmd.reaction) {
                    try {
                        await adams.sendMessage(origineMessage, {
                            react: { 
                                key: ms.key, 
                                text: cmd.reaction 
                            }
                        });
                    } catch (err) {
                        console.error("Reaction error:", err);
                    }
                }

                // Prepare command context
                const context = {
                    ms,
                    arg,
                    repondre,
                    superUser,
                    verifAdmin,
                    botIsAdmin,
                    verifGroupe,
                    infosGroupe,
                    nomGroupe,
                    auteurMessage,
                    utilisateur: utilisateur || '', // Ensure it's always defined
                    membreGroupe: verifGroupe ? auteurMessage : '',
                    origineMessage,
                    msgRepondu,
                    auteurMsgRepondu: auteurMsgRepondu || '', // Ensure it's always defined
                    isSuperUser
                };

                // Execute command with full context
                await cmd.fonction(origineMessage, adams, context);

            } catch (error) {
                console.error(`Command error [${com}]:`, error);
                try {
                    await adams.sendMessage(origineMessage, {
                        text: `🚨 Command failed: ${error.message}`,
                        ...createContext(auteurMessage, {
                            title: "Error",
                            body: "Command execution failed"
                        })
                    }, { quoted: ms });
                } catch (sendErr) {
                    console.error("Error sending error message:", sendErr);
                }
            }
        }
    }
});
//===============================================================================================================

// Handle connection updates
adams.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
        console.log("Connected to WhatsApp");

        if (conf.DP.toLowerCase() === "yes") {
            const md = conf.MODE.toLowerCase() === "yes" ? "public" : "private";
            const connectionMsg = `┌─❖
│ 𝐁𝐖𝐌 𝐗𝐌𝐃 𝐎𝐍𝐋𝐈𝐍𝐄
└┬❖  
┌┤ ǫᴜᴀɴᴛᴜᴍ ᴠᴇʀsɪᴏɴ
│└────────┈ ⳹  
│ ✅ Prefix: [ ${conf.PREFIX} ] 
│ ☣️ Mode: *${md}*
└────────────┈ ⳹  
│ *ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ*
│ https://business.bwmxmd.online
│ App Name: ${herokuAppName}
└───────────────┈ ⳹  
│  ©ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs
└─────────────────┈ ⳹`;

            adams.sendMessage(
                adams.user.id,
                {
                    text: connectionMsg,
                    ...createContext("BWM XMD", {
                        title: "SYSTEM ONLINE",
                        body: "Quantum Version Activated"
                    })
                },
                {
                    disappearingMessagesInChat: true,
                    ephemeralExpiration: 600,
                }
            ).catch(err => console.error("Status message error:", err));
        }
    }
});


        
//===============================================================================================================//

// Event Handlers
adams.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "connecting") console.log("🪩 Bot scanning 🪩");
        if (connection === "open") {
            console.log("🌎 BWM XMD ONLINE 🌎");
            adams.newsletterFollow("120363285388090068@newsletter");
        }
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed, reconnecting...");
            if (shouldReconnect) main();
        }
    });

    adams.ev.on("creds.update", saveCreds);

    // Message Handling
    adams.ev.on("messages.upsert", async ({ messages }) => {
        const ms = messages[0];
        if (!ms.message) return;
        
        // Message processing logic here
    });
}

setTimeout(() => {
    main().catch(err => console.log("Initialization error:", err));
}, 5000);
