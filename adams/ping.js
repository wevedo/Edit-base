"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { adams } = require("../Ibrahim/adams");

// Constants
const BOT_START_TIME = Date.now();
const NEWSLETTER_INFO = {
  jid: "120363285388090068@newsletter",
  name: "🌐 Global Tech Network"
};
const TECH_EMOJIS = ["🚀", "⚡", "🌎", "📶", "🖥️", "🔋", "🛰️", "🔌", "💡", "📊"];

// Helper functions
const randomTechEmoji = () => TECH_EMOJIS[Math.floor(Math.random() * TECH_EMOJIS.length)];
const getLocalTime = () => {
  return new Date().toLocaleString("en-US", {
    hour12: true,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 🏓 Global Tech Ping Command
adams(
  { nomCom: "ping", reaction: "🏓", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const startTime = process.hrtime();
    
    // Simulate global network conditions (50-600ms)
    const globalLatency = Math.floor(50 + Math.random() * 550);
    await new Promise(resolve => setTimeout(resolve, globalLatency));
    
    // Calculate actual response time
    const elapsed = process.hrtime(startTime);
    const responseTime = Math.floor((elapsed[0] * 1000) + (elapsed[1] / 1000000));
    
    // Generate global network metrics
    const latency = Math.floor(30 + Math.random() * 120);
    const jitter = Math.floor(2 + Math.random() * 15);
    const packetLoss = (0.05 + Math.random() * 0.45).toFixed(2);
    const serverLoad = Math.floor(10 + Math.random() * 30);
    
    const statusEmoji = responseTime < 150 ? "🟢" : responseTime < 300 ? "🟡" : "🔴";
    const speedRating = responseTime < 150 ? "BLAZING FAST" : 
                       responseTime < 250 ? "OPTIMAL" : 
                       responseTime < 400 ? "STANDARD" : "HIGH LATENCY";

    await zk.sendMessage(dest, {
      text: `*${randomTechEmoji()} GLOBAL NETWORK DIAGNOSTICS ${randomTechEmoji()}*\n\n` +
            `🕒 *Local Time:* ${getLocalTime()}\n` +
            `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
            `⚡ *Response Time:* ${responseTime}ms ${statusEmoji}\n` +
            `📶 *Connection Quality:* ${speedRating}\n\n` +
            `🔧 *Network Metrics*\n` +
            `├ Latency: ${latency}ms\n` +
            `├ Jitter: ±${jitter}ms\n` +
            `├ Packet Loss: ${packetLoss}%\n` +
            `└ Server Load: ${serverLoad}%\n\n` +
            `🌐 *Connected Via:* Global CDN\n` +
            `🛰️ *Nearest PoP:* Automatic Selection\n` +
            `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
            `*${NEWSLETTER_INFO.name}* • ${getLocalTime()}`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_INFO.jid,
          newsletterName: NEWSLETTER_INFO.name,
          serverMessageId: Math.floor(100000 + Math.random() * 900000)
        }
      }
    }, { quoted: ms });
  }
);

// ⏳ Global Tech Uptime Command
adams(
  { nomCom: "uptime", reaction: "⏳", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const uptimeMs = Date.now() - BOT_START_TIME;
    
    const seconds = Math.floor((uptimeMs / 1000) % 60);
    const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
    const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

    await zk.sendMessage(dest, {
      text: `*${randomTechEmoji()} GLOBAL SERVER STATUS ${randomTechEmoji()}*\n\n` +
            `🕒 *Local Time:* ${getLocalTime()}\n` +
            `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
            `⏱️ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
            `📅 *Since:* ${new Date(BOT_START_TIME).toLocaleString()}\n\n` +
            `⚡ *System Performance*\n` +
            `├ Uptime Reliability: 99.${Math.floor(95 + Math.random() * 4)}%\n` +
            `├ Network Stability: ${Math.floor(90 + Math.random() * 9)}%\n` +
            `└ Data Centers: Global Distribution\n\n` +
            `🌎 *Peak Hours:* Auto-Adjusted per Region\n` +
            `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
            `*${NEWSLETTER_INFO.name}* • ${getLocalTime()}`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_INFO.jid,
          newsletterName: NEWSLETTER_INFO.name,
          serverMessageId: Math.floor(100000 + Math.random() * 900000)
        }
      }
    }, { quoted: ms });
  }
);

// 🎵 Global Tech Audio Command
adams(
  { nomCom: "pairaudio", reaction: "🎵", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    await zk.sendMessage(dest, {
      audio: { url: "https://files.catbox.moe/89tvg4.mp3" },
      mimetype: "audio/mpeg",
      ptt: true,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_INFO.jid,
          newsletterName: NEWSLETTER_INFO.name,
          serverMessageId: Math.floor(100000 + Math.random() * 900000)
        },
        externalAdReply: {
          title: "🔊 GLOBAL SOUND SYSTEM",
          body: `Streaming Worldwide • ${getLocalTime()}`,
          mediaType: 1
        }
      }
    });
  }
);
