const { adams } = require("../Ibrahim/adams");
const moment = require("moment-timezone");
const axios = require("axios");
const s = require(__dirname + "/../config");
const readMore = String.fromCharCode(8206).repeat(4000); 
const PREFIX = s.PREFIX; // Get prefix from config

// GitHub raw audio links
const githubRawBaseUrl = "https://raw.githubusercontent.com/ibrahimaitech/bwm-xmd-music/master/tiktokmusic";
const audioFiles = Array.from({ length: 100 }, (_, i) => `sound${i + 1}.mp3`);
const getRandomAudio = () => audioFiles[Math.floor(Math.random() * audioFiles.length)];

// Menu images
const menuImages = [
    "https://bwm-xmd-files.vercel.app/bwmxmd1.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd2.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd3.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd4.jpeg",
    "https://bwm-xmd-files.vercel.app/bwmxmd5.jpeg",
];
const randomImage = () => menuImages[Math.floor(Math.random() * menuImages.length)];
const footer = `\n\n©Sir Ibrahim Adams\n\n╭━===========================\n┃  ᴛᴏ sᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs ᴛᴏɢᴇᴛʜᴇʀ ᴜsᴇ\n┃ *${PREFIX} Cmds*\n┃ *${PREFIX} Help*\n┃ *${PREFIX} list*\n┃ *${PREFIX} Commands* \n╰━===========================\n\n*For business use this*\nhttps://business.bwmxmd.online\n\n®2025 ʙᴡᴍ xᴍᴅ 🔥`;

// GitHub repo stats - Updated with correct repo path
const fetchGitHubStats = async () => {
    try {
        const owner = "ibrahimadams254"; // Updated GitHub username
        const repo = "BWM-XMD-QUANTUM"; // Repository name
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'User-Agent': 'BWM-XMD-Bot' // GitHub API requires a user-agent
            }
        });
        const forks = response.data.forks_count || 0;
        const stars = response.data.stargazers_count || 0;
        return (forks * 2) + (stars * 2);
    } catch (error) {
        console.error("Error fetching GitHub stats:", error.message);
        return Math.floor(Math.random() * 1000) + 500; // Return a random number if API fails
    }
};

// Command list storage (ensures commands are stored only once)
const commandList = {};
let commandsStored = false;

adams({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const contactName = commandeOptions?.ms?.pushName || "Unknown Contact";
    const sender = commandeOptions?.sender || (commandeOptions?.ms?.key?.remoteJid || "").replace(/@.+/, '');
    let { ms, repondre } = commandeOptions;
    let { cm } = require(__dirname + "/../Ibrahim/adams");

    // Contact message for quoted replies
    const contactMsg = {
        key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
        message: {
            contactMessage: {
                displayName: contactName,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${contactName}\nitem1.TEL;waid=${sender}:${sender}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            },
        },
    };

    // Store commands only once
    if (!commandsStored) {
        cm.forEach((com) => {
            const categoryUpper = com.categorie.toUpperCase();
            if (!commandList[categoryUpper]) commandList[categoryUpper] = [];
            commandList[categoryUpper].push(`🟢 ${com.nomCom}`);
        });
        commandsStored = true; // Prevents further storing
    }

    moment.tz.setDefault(s.TZ || "Africa/Nairobi");
    const date = moment().format("DD/MM/YYYY");
    const time = moment().format("HH:mm:ss");
    const totalUsers = await fetchGitHubStats();
    const image = randomImage();

    // Dynamic Greeting Based on Time
    const hour = moment().hour();
    let greeting = "🌙 *Good Night* 😴";
    if (hour >= 5 && hour < 12) greeting = "🌅 *Good Morning* 🤗";
    else if (hour >= 12 && hour < 18) greeting = "☀️ *Good Afternoon* 😊";
    else if (hour >= 18 && hour < 22) greeting = "🌆 *Good Evening* 🤠";

    // Custom Categories with Emojis
    const categoryGroups = {
        "🤖 AI MENU": ["AI", "TTS", "NEWS"],
        "⚽ SPORTS MENU": ["FOOTBALL", "GAMES"],
        "📥 DOWNLOAD MENU": ["NEWS", "SEARCH", "IMAGES", "DOWNLOAD"],
        "🛠️ HEROKU MENU": ["CONTROL", "STICKCMD", "TOOLS"],
        "💬 CONVERSATION MENU": ["CONVERSION", "LOGO", "MEDIA", "WEEB", "SCREENSHOTS", "IMG", "AUDIO-EDIT", "MPESA"],
        "😂 FUN MENU": ["HENTAI", "FUN", "REACTION"],
        "🌍 GENERAL MENU": ["GENERAL", "MODS", "UTILITY", "MEDIA", "TRADE"],
        "👨‍👨‍👦‍👦 GROUP MENU": ["GROUP"],
        "💻 BOT_INFO MENU": ["GITHUB", "USER", "PAIR"],
        "🔞 ADULT MENU": ["XVIDEO"],
    };

    // Create interactive buttons for categories
    const categoryKeys = Object.keys(categoryGroups);
    const buttons = categoryKeys.map((category, index) => ({
        buttonId: `category_${index + 1}`,
        buttonText: { displayText: category },
        type: 1
    }));

    // Split buttons into groups of 3 for better display
    const buttonGroups = [];
    for (let i = 0; i < buttons.length; i += 3) {
        buttonGroups.push(buttons.slice(i, i + 3));
    }

    // Send Main Menu with Interactive Buttons
    const buttonMessage = {
        image: { url: image },
        caption: `
┌─❖
│ 𝐁𝐖𝐌 𝐗𝐌𝐃    
└┬❖  
┌┤ ${greeting}
│└───────────┈⳹  
│🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: ${contactName}
│📅 ᴅᴀᴛᴇ: ${date}
│⏰ ᴛɪᴍᴇ: ${time}
│👥 ʙᴡᴍ ᴜsᴇʀs: ${totalUsers}        
└────────────────┈⳹ 

> ©Ibrahim Adams

${readMore}

📜 *ᴄʟɪᴄᴋ ᴀ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ ᴛᴏ sᴇʟᴇᴄᴛ ᴄᴀᴛᴇɢᴏʀʏ*  

${footer}
`,
        buttons: buttons,
        headerType: 4,
        contextInfo: {
            mentionedJid: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean),
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363285388090068@newsletter",
                newsletterName: "BWM-XMD",
                serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
        },
    };

    // Send the button message
    const sentMessage = await zk.sendMessage(dest, buttonMessage, { quoted: contactMsg });

    // **Button Response Listener**
    zk.ev.on("messages.upsert", async (update) => {
        const message = update.messages[0];
        
        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            const buttonMatch = buttonId.match(/category_(\d+)/);
            
            if (buttonMatch && message.key.participant === (sender ? `${sender}@s.whatsapp.net` : ms.key.remoteJid)) {
                const selectedIndex = parseInt(buttonMatch[1]);
                const selectedCategory = categoryKeys[selectedIndex - 1];
                
                if (selectedCategory) {
                    const combinedCommands = categoryGroups[selectedCategory].flatMap((cat) => commandList[cat] || []);
                    const categoryImage = randomImage();

                    await zk.sendMessage(dest, {
                        image: { url: categoryImage },
                        caption: combinedCommands.length
                            ? `
┌─❖ 
│ *${selectedCategory}*:
└┬❖
┌┤
 ${combinedCommands.join("\n\n")}\n└───────────┈⳹\n\n${footer}`
                            : `⚠️ No commands found for ${selectedCategory}.`,
                        contextInfo: {
                            mentionedJid: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean),
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363285388090068@newsletter",
                                newsletterName: "BWM-XMD",
                                serverMessageId: Math.floor(100000 + Math.random() * 900000),
                            },
                        },
                    }, { quoted: contactMsg });
                }
            }
        }
        
        // Fallback: Handle text responses (for compatibility)
        else if (message.message?.extendedTextMessage) {
            const responseText = message.message.extendedTextMessage.text.trim();
            if (
                message.message.extendedTextMessage.contextInfo &&
                message.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id
            ) {
                const selectedIndex = parseInt(responseText);

                if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > categoryKeys.length) {
                    return repondre("*❌ Invalid number. Please use the buttons or select a valid category number.*", { quoted: contactMsg });
                }

                const selectedCategory = categoryKeys[selectedIndex - 1];
                const combinedCommands = categoryGroups[selectedCategory].flatMap((cat) => commandList[cat] || []);
                const categoryImage = randomImage();

                await zk.sendMessage(dest, {
                    image: { url: categoryImage },
                    caption: combinedCommands.length
                        ? `
┌─❖ 
│ *${selectedCategory}*:
└┬❖
┌┤
 ${combinedCommands.join("\n\n")}\n└───────────┈⳹\n\n${footer}`
                        : `⚠️ No commands found for ${selectedCategory}.`,
                    contextInfo: {
                        mentionedJid: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean),
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363285388090068@newsletter",
                            newsletterName: "BWM-XMD",
                            serverMessageId: Math.floor(100000 + Math.random() * 900000),
                        },
                    },
                }, { quoted: contactMsg });
            }
        }
    });

    // Send Random Audio
    const audioUrl = `${githubRawBaseUrl}/${getRandomAudio()}`;
    await zk.sendMessage(dest, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: true,
        contextInfo: {
            mentionedJid: [sender ? `${sender}@s.whatsapp.net` : undefined].filter(Boolean),
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363285388090068@newsletter",
                newsletterName: "BWM-XMD",
                serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
        },
    }, { 
        quoted: {
            key: {
                remoteJid: ms.key.remoteJid,
                fromMe: ms.key.fromMe,
                id: ms.key.id,
                participant: ms.key.participant
            },
            message: {
                conversation: "🚀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 🚀"
            }
        }
    });
});
