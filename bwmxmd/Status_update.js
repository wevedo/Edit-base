const { createContext } = require('../Ibrahim/helper');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    setup: async (adams, { config, logger }) => {
        if (!adams || !config) return;

        const botJid = `${adams.user?.id.split('@')[0]}@s.whatsapp.net`;
        const businessLink = 'https://business.bwmxmd.online/';
        const infoLink = 'https://ibrahimadams.site/';

        // ==================== AUTO READ ====================
        if (config.AUTO_READ === "yes") {
            logger.info("[Read] Auto-read enabled for chats");
            
            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const unread = m.messages.filter(
                        msg => !msg.key.fromMe && msg.key.remoteJid !== "status@broadcast"
                    );
                    if (unread.length > 0) {
                        await adams.readMessages(unread.map(msg => msg.key));
                    }
                } catch (err) {
                    logger.error("[Read] Error:", err);
                }
            });
        }

        // ==================== STATUS READ ====================
        if (config.AUTO_READ_STATUS === "yes") {
            logger.info("[Status] Auto-read enabled for status updates");
            
            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const statusUpdates = m.messages.filter(
                        msg => msg.key?.remoteJid === "status@broadcast"
                    );
                    if (statusUpdates.length > 0) {
                        await adams.readMessages(statusUpdates.map(msg => msg.key));
                    }
                } catch (err) {
                    logger.error("[Status] Read error:", err);
                }
            });
        }


        // ==================== STATUS DOWNLOAD ====================
        if (config.AUTO_DOWNLOAD_STATUS === "yes" && config.STATUS_LOG_JID) {
            logger.info("[Status] Auto-download enabled");
            
            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const statusMessages = m.messages.filter(
                        msg => msg.key?.remoteJid === "status@broadcast"
                    );

                    for (const status of statusMessages) {
                        // Mark as read first if enabled
                        if (config.AUTO_READ_STATUS === "yes") {
                            await adams.readMessages([status.key]);
                        }

                        if (status.message?.extendedTextMessage) {
                            await adams.sendMessage(config.STATUS_LOG_JID, {
                                text: `📢 Status Update:\n${status.message.extendedTextMessage.text}\n\n` +
                                      `🔗 ${businessLink}\nℹ️ ${infoLink}`,
                                ...createContext(status.key.participant || status.key.remoteJid)
                            });
                        } 
                        else if (status.message?.imageMessage) {
                            const media = await adams.downloadMediaMessage(status.message.imageMessage);
                            await adams.sendMessage(config.STATUS_LOG_JID, {
                                image: media,
                                caption: (status.message.imageMessage.caption || "📸 Status Image") + 
                                        `\n\n🔗 ${businessLink}\nℹ️ ${infoLink}`,
                                ...createContext(status.key.participant || status.key.remoteJid)
                            });
                        }
                        else if (status.message?.videoMessage) {
                            const media = await adams.downloadMediaMessage(status.message.videoMessage);
                            await adams.sendMessage(config.STATUS_LOG_JID, {
                                video: media,
                                caption: (status.message.videoMessage.caption || "🎥 Status Video") + 
                                        `\n\n🔗 ${businessLink}\nℹ️ ${infoLink}`,
                                ...createContext(status.key.participant || status.key.remoteJid)
                            });
                        }
                    }
                } catch (err) {
                    logger.error("[Status] Download error:", err);
                }
            });
        }

        // ==================== AUTO REACT TO MESSAGES ====================
        if (config.AUTO_REACT === "yes") {
            logger.info("[React] Auto-react to messages enabled");
            
            const emojiMap = {
                "hello": ["👋", "🙂", "😊"],
                "hi": ["👋", "😄", "🤗"],
                "good morning": ["🌞", "☀️", "🌻"],
                "good night": ["🌙", "🌠", "💤"],
                "thanks": ["🙏", "❤️", "😊"],
                "welcome": ["😊", "🤗", "👌"],
                "congrats": ["🎉", "👏", "🥳"],
                "sorry": ["😔", "🙏", "🥺"]
            };
                       
            const fallbackEmojis = [
    // Positive Feedback
    "👍", "👌", "💯", "✨", "🌟", "🏆", "🎯", "✅",
    
    // Appreciation
    "🙏", "❤️", "💖", "💝", "💐", "🌹",
    
    // Neutral Positive
    "😊", "🙂", "👋", "🤝", "🫱🏻‍🫲🏽",
    
    // Celebration
    "🎉", "🎊", "🥂", "🍾", "🎈", "🎁",
    
    // Time/Seasons
    "🌞", "☀️", "🌙", "⭐", "🌈", "☕",
    
    // Nature/Travel
    "🌍", "✈️", "🗺️", "🌻", "🌸", "🌊",
    
    // Professional/Creative
    "📚", "🎨", "📝", "🔍", "💡", "⚙️",
    
    // Objects/Symbols
    "📌", "📍", "🕰️", "⏳", "📊", "📈"];

            let lastReactTime = 0;

            adams.ev.on("messages.upsert", async (m) => {
                try {
                    const { messages } = m;
                    const now = Date.now();

                    for (const message of messages) {
                        if (!message.key || message.key.fromMe || 
                            message.key.remoteJid === "status@broadcast" ||
                            now - lastReactTime < 2000) continue;

                        const msgText = (
                            message.message?.conversation || 
                            message.message?.extendedTextMessage?.text || ""
                        ).toLowerCase();

                        let emoji;
                        for (const [keyword, emojis] of Object.entries(emojiMap)) {
                            if (msgText.includes(keyword)) {
                                emoji = emojis[Math.floor(Math.random() * emojis.length)];
                                break;
                            }
                        }

                        emoji = emoji || fallbackEmojis[Math.floor(Math.random() * fallbackEmojis.length)];

                        await adams.sendMessage(message.key.remoteJid, {
                            react: {
                                text: emoji,
                                key: message.key
                            }
                        });

                        lastReactTime = now;
                        logger.info(`[React] Sent ${emoji} to ${message.key.remoteJid}`);
                        await delay(1000);
                    }
                } catch (err) {
                    logger.error("[React] Error:", err);
                }
            });
        }
    }
};
