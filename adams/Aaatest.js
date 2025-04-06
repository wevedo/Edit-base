const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");

// GitHub raw audio links
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);
const getRandomAudio = () => audioFiles[Math.floor(Math.random() * audioFiles.length)];

// Menu images
const menuImages = [
    "https://bwm-xmd-files.vercel.app/bwmxmd_lzgu8w.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_9s9jr8.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_psaclm.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_1tksj5.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_v4jirh.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd_d8cv2v.png",
    "https://files.catbox.moe/jwwjd3.jpeg",
    "https://files.catbox.moe/3k35q4.jpeg",
    "https://files.catbox.moe/sgl022.jpeg",
    "https://files.catbox.moe/xx6ags.jpeg",
];
const randomImage = () => menuImages[Math.floor(Math.random() * menuImages.length)];
const footer = `\n\n╭─❖ 𓆩 ⚡ 𓆪 ❖─╮
       © 𝕾𝖎𝖗 𝕴𝖇𝖗𝖆𝖍𝖎𝖒 𝕬𝖉𝖆𝖒𝖘    
╰─❖ 𓆩 ⚡ 𓆪 ❖─╯  
🔗 https://shorturl.at/z3b8v\n\n®𝟮𝟬𝟮𝟱 𝗕𝗪𝗠 𝗫𝗠𝗗 𝗩𝟲.𝟬.𝟯 🔥`;

// GitHub repo stats
const fetchGitHubStats = async () => {
    try {
        const repo = "devibraah/BWM-XMD";
        const response = await axios.get(`https://api.github.com/repos/${repo}`);
        const forks = response.data.forks_count || 0;
        const stars = response.data.stargazers_count || 0;
        return (forks * 2) + (stars * 2);
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return 0;
    }
};

// Command list storage
const commandList = {};
let commandsStored = false;

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { nomAuteurMessage, ms, repondre } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");

    // Store commands only once
    if (!commandsStored) {
        cm.forEach((com) => {
            const categoryUpper = com.categorie.toUpperCase();
            if (!commandList[categoryUpper]) commandList[categoryUpper] = [];
            commandList[categoryUpper].push(`✨ ${com.nomCom}`);
        });
        commandsStored = true;
    }

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const totalUsers = await fetchGitHubStats();
    const image = randomImage();

    // Dynamic Greeting
    const hour = moment().hour();
    let greeting = "🌙 *ɢᴏᴏᴅ ɴɪɢʜᴛ! sʟᴇᴇᴘ ᴡᴇʟʟ!*";
    if (hour >= 5 && hour < 12) greeting = "🌅 *ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ! ʜᴀᴠᴇ ᴀ ɢʀᴇᴀᴛ ᴅᴀʏ!*";
    else if (hour >= 12 && hour < 18) greeting = "☀️ *ɢᴏᴏᴅ ᴀғᴛᴇʀɴᴏᴏɴ! sᴛᴀʏ ᴘʀᴏᴅᴜᴄᴛɪᴠᴇ!*";
    else if (hour >= 18 && hour < 22) greeting = "🌆 *ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ! ᴛɪᴍᴇ ᴛᴏ ʀᴇʟᴀx!*";

    // Category Groups with new emojis
    const categoryGroups = {
        "🤖 𝙰𝙸 𝙼𝙴𝙽𝚄": ["ABU"],
        "🎵 𝙰𝚄𝚃𝙾 𝙴𝙳𝙸𝚃": ["AUDIO-EDIT"],
        "📥 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝚂": ["BMW PICS", "SEARCH", "DOWNLOAD"],
        "🛠️ 𝙲𝙾𝙽𝚃𝚁𝙾𝙻𝚂": ["CONTROL", "STICKCMD", "TOOLS"],
        "💬 𝙲𝙷𝙰𝚃 𝚃𝙾𝙾𝙻𝚂": ["CONVERSION", "MPESA"],
        "😂 𝙵𝚄𝙽 𝚃𝙸𝙼𝙴": ["HENTAI", "FUN", "REACTION"],
        "🎮 𝙶𝙰𝙼𝙴𝚂": ["GAMES"],
        "🌍 𝙶𝙴𝙽𝙴𝚁𝙰𝙻": ["GENERAL"],
        "👥 𝙶𝚁𝙾𝚄𝙿 𝚃𝙾𝙾𝙻𝚂": ["GROUP"],
        "💻 �𝙍𝙊𝙂𝚁𝙰𝙼𝙈𝙄𝙉𝙂": ["GITHUB"],
        "🖼️ 𝙸𝙼𝙰𝙶𝙴 �𝙳𝙸𝚃": ["IMAGE-EDIT"],
        "🔤 𝙻𝙾𝙶𝙾 𝙼𝙰𝙺𝙴𝚁": ["LOGO"],
        "🛑 𝙼𝙾𝙳𝚂": ["MODS"],
        "📰 𝙽𝙴𝚆𝚂": ["NEWS", "AI"],
        "🔗 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙾𝚁𝚂": ["PAIR", "USER"],
        "🔍 𝚂𝙴𝙰𝚁𝙲𝙷": ["NEWS", "IA"],
        "🗣️ 𝚃𝚃𝚂": ["TTS"],
        "⚙️ 𝚄𝚃𝙸𝙻𝚂": ["UTILITY"],
        "🎌 𝙰𝙽𝙸𝙼𝙴": ["WEEB"],
    };

    // Main Menu with Newsletter Context
    const BWM_XMD_TEXT = `
╭─❖ 𓆩 ⚡ 𓆪 ❖─╮
       𝗕𝗪𝗠 𝗫𝗠𝗗 𝗩𝟲    
╰─❖ 𓆩 ⚡ 𓆪 ❖─╯  
╭─❖
┃👤 �sᴇʀ: ${nomAuteurMessage}
┃📅 𝚍ᴀᴛᴇ: ${date}
┃⏰ 𝚝ɪᴍᴇ: ${time}
┃👥 𝚞sᴇʀs: 1${totalUsers}  
╰─❖

${greeting}

📜 *𝚁𝙴𝙿𝙻𝚈 𝚆𝙸𝚃𝙷 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈 𝙽𝚄𝙼𝙱𝙴𝚁*  

${Object.keys(categoryGroups).map((cat, index) => `🔹 ${index + 1} ${cat}`).join("\n")}${footer}
`;

    const sentMessage = await zk.sendMessage(dest, {
        image: { url: image },
        caption: BWM_XMD_TEXT,
        contextInfo: {
            mentionedJid: [nomAuteurMessage],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363285388090068@newsletter",
                newsletterName: "BWM-XMD UPDATES",
                serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
        },
    }, { quoted: ms });

    // Category Selection Listener
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        if (!message.message || !message.message.extendedTextMessage) return;

        const responseText = message.message.extendedTextMessage.text.trim();
        if (
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id
        ) {
            const selectedIndex = parseInt(responseText);
            const categoryKeys = Object.keys(categoryGroups);

            if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > categoryKeys.length) {
                return await zk.sendMessage(dest, { 
                    text: "*❌ 𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝚂𝙴𝙻𝙴𝙲𝚃𝙸𝙾𝙽! 𝙿𝙻𝙴𝙰𝚂𝙴 𝚁𝙴𝙿𝙻𝚈 𝚆𝙸𝚃𝙷 𝙰 𝙽𝚄𝙼𝙱𝙴𝚁*",
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363285388090068@newsletter",
                            newsletterName: "BWM-XMD UPDATES",
                            serverMessageId: Math.floor(100000 + Math.random() * 900000),
                        },
                    }
                }, { quoted: message });
            }

            const selectedCategory = categoryKeys[selectedIndex - 1];
            const combinedCommands = categoryGroups[selectedCategory].flatMap((cat) => commandList[cat] || []);
            const categoryImage = randomImage();

            await zk.sendMessage(dest, {
                image: { url: categoryImage },
                caption: combinedCommands.length
                    ? `📜 *${selectedCategory}*:\n\n${combinedCommands.join("\n")}\n\n${footer}`
                    : `⚠️ *𝙽𝙾 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂 𝙵𝙾𝚄𝙽𝙳 �𝙾𝚁 ${selectedCategory}*`,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363285388090068@newsletter",
                        newsletterName: "BWM-XMD UPDATES",
                        serverMessageId: Math.floor(100000 + Math.random() * 900000),
                    },
                },
            }, { quoted: message });
        }
    });

    // Send Random Audio with Newsletter Context
    const audioUrl = `${githubRawBaseUrl}/${getRandomAudio()}`;
    await zk.sendMessage(dest, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: true,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363285388090068@newsletter",
                newsletterName: "BWM-XMD UPDATES",
                serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
        },
    });
});
