
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { adams } = require("../Ibrahim/adams");
const axios = require("axios");

const githubRawBaseUrl =
  "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";

const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);

const botStartTime = Date.now(); // Track uptime

const getUserProfilePic = async (zk, userJid) => {
  try {
    return await zk.profilePictureUrl(userJid, "image");
  } catch {
    return "https://files.catbox.moe/sd49da.jpg"; // Default profile pic
  }
};

// 🏓 PING COMMAND
adams(
  { nomCom: "ping", reaction: "🏓", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;
    const userJid = ms?.sender || dest;

    const randomPingValue = Math.floor(100 + Math.random() * 900); // Generates a random number (100-999ms)
    
    await repondre({
      text: `📶 Ping Results:\n\n` +
            `• Response Time: ${randomPingValue}ms\n` +
            `• Server: XMD-Core\n` +
            `• Status: Stable`,
      mentions: [userJid]
    });
  }
);



adams(
  { nomCom: "pairaudio", reaction: "🎵", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms } = commandeOptions;
    const userJid = ms?.sender || dest;

    await zk.sendMessage(dest, {
      audio: { url: "https://files.catbox.moe/89tvg4.mp3" },
      mimetype: "audio/mpeg",
      ptt: true,
      contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000),
        },
      },
    });
  }
);

// ⏳ UPTIME COMMAND
adams(
  { nomCom: "uptime", reaction: "⏳", nomFichier: __filename },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;
    const userJid = ms?.sender || dest;

    // Send "Calculating..." message
    const calculatingMessage = await zk.sendMessage(dest, { text: "Calculating uptime..." }, { quoted: ms });

    const profilePic = await getUserProfilePic(zk, userJid);

    const uptimeMs = Date.now() - botStartTime;
    const uptimeSeconds = Math.floor((uptimeMs / 1000) % 60);
    const uptimeMinutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
    const uptimeHours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
    const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

    const uptimeString = `⏳ Bot has been running for: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

    const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
    const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;

    // Delete the "Calculating..." message
    await zk.sendMessage(dest, { delete: calculatingMessage.key });

    // Send the uptime result
    await zk.sendMessage(dest, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      ptt: true,
      contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000), // Random big number
        },
        externalAdReply: {
          title: "⏳ Uptime Check",
          body: uptimeString,
          thumbnailUrl: profilePic,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: false,
        },
      },
    });
  }
);
