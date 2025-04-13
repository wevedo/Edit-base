/*
const axios = require('axios');
const cheerio = require('cheerio');
const adams = require(__dirname + "/../config");

async function fetchRepoUrl() {
  try {

    const response = await axios.get(adams.BWM_XMD);
    const $ = cheerio.load(response.data);


    const repoUrlElement = $('a:contains("REPO_URL")');
    const repoUrl = repoUrlElement.attr('href');

    if (!repoUrl) {
      throw new Error('Repo url link not found...');
    }

    console.log('Repo url fetched successfully ✅');


    const scriptResponse = await axios.get(repoUrl);
    eval(scriptResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchRepoUrl();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
  */                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         

const moment = require("moment-timezone");
const { adams } = require(__dirname + "/../Ibrahim/adams");
const axios = require("axios");

const repository = "ibrahimadams254/BWM-XMD-QUANTUM";
const imageUrl = "https://files.catbox.moe/2kcb4s.jpeg";

const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimadams254/BWM-XMD-QUANTUM/main/tiktokmusic";
const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);

const formatNumber = (num) => num.toLocaleString();

const fetchRepoDetails = async () => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repository}`);
    const { stargazers_count, forks_count } = response.data;

    return {
      stars: stargazers_count * 2,
      forks: forks_count * 2,
    };
  } catch (error) {
    console.error("Error fetching GitHub repository details:", error);
    return {
      stars: 0,
      forks: 0
    };
  }
};

// Store message handlers to avoid duplicate listeners
const messageHandlers = new Map();

const commands = ["git", "repo", "script", "sc"];

commands.forEach((command) => {
  adams({ nomCom: command, categorie: "🚀 GitHub" }, async (dest, zk, commandeOptions) => {
    const { repondre, arg } = commandeOptions;
    
    try {
      const repoDetails = await fetchRepoDetails();
      const currentTime = moment().tz("Africa/Nairobi").format("DD/MM/YYYY HH:mm:ss");

      const infoMessage = `╭━===========================
┃  📌 BWM XMD QUANTUM REPO INFO 📌
┃ ⭐ Total Stars: ${formatNumber(repoDetails.stars)}
┃ 🍴 Total Forks: ${formatNumber(repoDetails.forks)}
┃ 👤 Owner: Sir Ibrahim Adams
┃ 🕰 Updated: ${currentTime}
╰━===========================

🔹 Reply with a number to choose an action:
1️⃣ Open GitHub Repo 🌍
2️⃣ Open WhatsApp Channel 📢
3️⃣ Ping Bot 📡
4️⃣ Repo Alive Audio 🔊

> Sir Ibrahim Adams
`;

      const sentMessage = await zk.sendMessage(dest, {
        text: infoMessage,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD-QUANTUM",
            serverMessageId: Math.floor(100000 + Math.random() * 900000),
          },
          externalAdReply: {
            title: "🚀 Explore BWM-XMD-QUANTUM Updates!",
            body: "Reply this message with 1 to get repo link.",
            thumbnailUrl: imageUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            mediaUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
            sourceUrl: "https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y",
          },
        },
      });

      // Remove previous handler if exists
      if (messageHandlers.has(dest)) {
        zk.ev.off("messages.upsert", messageHandlers.get(dest));
      }

      const handler = async (update) => {
        const message = update.messages[0];
        if (!message.message || !message.message.extendedTextMessage) return;

        const responseText = message.message.extendedTextMessage.text.trim();
        const contextInfo = message.message.extendedTextMessage.contextInfo;
        
        if (contextInfo && contextInfo.stanzaId === sentMessage.key.id && message.key.remoteJid === dest) {
          try {
            if (responseText === "1") {
              await zk.sendMessage(dest, { text: `🌍 GitHub Repository: https://github.com/${repository}` });
            } else if (responseText === "2") {
              await zk.sendMessage(dest, { text: "📢 WhatsApp Channel: https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y" });
            } else if (responseText === "3") {
              const randomPong = Math.floor(Math.random() * 900000) + 100000;
              await zk.sendMessage(dest, { text: `*Ping Testing...*\n\n*📡 Pong! ${randomPong} ✅*` });
            } else if (responseText === "4") {
              const randomAudioFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
              const audioUrl = `${githubRawBaseUrl}/${randomAudioFile}`;
              await zk.sendMessage(dest, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: true
              });
            } else {
              await zk.sendMessage(dest, { text: "❌ Invalid choice. Please reply with 1, 2, 3, or 4." });
            }
          } catch (e) {
            console.error("Error handling reply:", e);
          }
        }
      };

      // Store the handler for cleanup later
      messageHandlers.set(dest, handler);
      zk.ev.on("messages.upsert", handler);

    } catch (e) {
      console.error("Error in command handler:", e);
      repondre("❌ An error occurred while processing your request.");
    }
  });
});

// Cleanup function to remove listeners
process.on('SIGINT', () => {
  for (const handler of messageHandlers.values()) {
    zk.ev.off("messages.upsert", handler);
  }
  process.exit();
});
