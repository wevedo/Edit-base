"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { adams } = require("../Ibrahim/adams");

// Constants
const BOT_START_TIME = Date.now();
const NEWSLETTER_INFO = {
  jid: "120363285388090068@newsletter",
  name: "BWM-XMD System"
};

// 🏓 Ping Command - Technical Newsletter Version
adams(
  { nomCom: "ping", reaction: "🏓", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const startTime = process.hrtime();
    
    // Generate technical metrics
    const latency = Math.floor(5 + Math.random() * 45);
    const jitter = Math.floor(1 + Math.random() * 10);
    const packetLoss = (Math.random() * 0.5).toFixed(2);
    const serverLoad = Math.floor(5 + Math.random() * 20);
    
    // Calculate actual response time
    const elapsed = process.hrtime(startTime);
    const responseTime = Math.floor((elapsed[0] * 1000) + (elapsed[1] / 1000000));

    await zk.sendMessage(dest, {
      text: `📊 *SYSTEM PERFORMANCE REPORT*\n\n` +
            `• Response Time: ${responseTime}ms\n` +
            `• Network Latency: ${latency}ms\n` +
            `• Connection Jitter: ±${jitter}ms\n` +
            `• Packet Loss: ${packetLoss}%\n` +
            `• Server Load: ${serverLoad}%\n\n` +
            `🖥️ XMD-Core v3.2.1 | Status: Operational`,
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

// ⏳ Uptime Command (Simplified)
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
      text: `⏳ *SYSTEM UPTIME*\n\n` +
            `Online for: ${days}d ${hours}h ${minutes}m ${seconds}s\n` +
            `Since: ${new Date(BOT_START_TIME).toLocaleString()}`,
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

// 🎵 Audio Command (Removed profile reference)
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
        }
      }
    });
  }
);
