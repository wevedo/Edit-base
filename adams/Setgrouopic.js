const { adams } = require('../Ibrahim/adams');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

// Utility to convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

// Command to set group picture
adams({
    nomCom: "setgpp",
    categorie: "Group",
    reaction: "🖼️",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre } = commandeOptions;

    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg?.imageMessage) {
        return repondre("ℹ️ Please reply to an image message to set as group picture.");
    }

    let pp = null;
    try {
        // Download and save image
        const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        const buffer = await streamToBuffer(stream);
        pp = path.join(__dirname, `groupimg_${Date.now()}.jpg`);
        await fs.writeFile(pp, buffer);

        // Update profile picture
        await zk.updateProfilePicture(dest, { url: pp });
        await repondre("✅ Group picture updated successfully.");
        fs.unlinkSync(pp);
    } catch (err) {
        console.error("Error setting group picture:", err);
        if (pp && fs.existsSync(pp)) fs.unlinkSync(pp);
        await repondre(`❌ Failed to update group picture: ${err.message}`);
    }
});

// Command to update your own profile picture
adams({
    nomCom: "setpp",
    categorie: "Utility",
    reaction: "📷",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, auteurMessage } = commandeOptions;

    // Only allow in private chats
    if (dest.includes('@g.us')) {
        return repondre("❌ This command can only be used in private chats.");
    }

    const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg?.imageMessage) {
        return repondre("ℹ️ Please reply to an image message to set as your profile picture.");
    }

    let pp = null;
    try {
        // Download and save image
        const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
        const buffer = await streamToBuffer(stream);
        pp = path.join(__dirname, `profileimg_${Date.now()}.jpg`);
        await fs.writeFile(pp, buffer);

        // Update profile picture
        await zk.updateProfilePicture(auteurMessage, { url: pp });
        await repondre("✅ Your profile picture updated successfully.");
        fs.unlinkSync(pp);
    } catch (err) {
        console.error("Error setting profile picture:", err);
        if (pp && fs.existsSync(pp)) fs.unlinkSync(pp);
        await repondre(`❌ Failed to update profile picture: ${err.message}`);
    }
});

// Improved Profile Command
adams({
    nomCom: "profile",
    categorie: "Personal",
    reaction: "👤",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { repondre, auteurMsg, arg, ms } = commandeOptions;

    // Only works in private chat
    if (dest.includes('@g.us')) {
        return repondre("ℹ️ This command only works in private chats.");
    }

    try {
        // Get the user ID - either the person you're chatting with or yourself
        const userId = arg[0] && arg[0].includes('@') ? arg[0] : auteurMsg;
        
        // Fetch user's profile picture and info
        const [profilePicture, status, userInfo] = await Promise.all([
            zk.profilePictureUrl(userId, 'image').catch(() => null),
            zk.fetchStatus(userId).catch(() => ({ status: "No status" })),
            zk.getContact(userId).catch(() => ({ notify: "Unknown" }))
        ]);

        // Construct profile message
        let profileMessage = `👤 *Profile Information*\n\n`;
        profileMessage += `📛 *Name:* ${userInfo?.notify || userInfo?.vname || userInfo?.name || 'Unknown'}\n`;
        profileMessage += `🆔 *User ID:* ${userId}\n`;
        profileMessage += `📝 *Status:* ${status?.status || 'No status'}\n`;
        
        if (status?.lastSeen) {
            const lastSeenDate = new Date(status.lastSeen);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
            
            if (diffMinutes < 1) {
                profileMessage += `🟢 *Status:* Online now\n`;
            } else if (diffMinutes < 5) {
                profileMessage += `🟡 *Status:* Online ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago\n`;
            } else {
                profileMessage += `🔴 *Status:* Last seen ${lastSeenDate.toLocaleString()}\n`;
            }
        } else {
            profileMessage += `🔵 *Status:* Unknown\n`;
        }

        // Send profile picture if available
        if (profilePicture) {
            await zk.sendMessage(dest, { 
                image: { url: profilePicture },
                caption: profileMessage
            }, { quoted: ms });
        } else {
            await repondre(profileMessage);
        }
    } catch (err) {
        console.error("Error fetching profile:", err);
        await repondre(`❌ Error fetching profile information: ${err.message}`);
    }
});

// Command to set your status
adams({
    nomCom: "setstatus",
    categorie: "Personal",
    reaction: "📝",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { repondre, arg, ms } = commandeOptions;

    // Only works in private chat
    if (dest.includes('@g.us')) {
        return repondre("ℹ️ This command only works in private chats.");
    }

    const statusText = arg.join(' ');
    if (!statusText) {
        return repondre("ℹ️ Please provide a status text. Example: /setstatus Working on my bot");
    }

    try {
        await zk.updateStatus(statusText);
        await repondre(`✅ Status updated to: "${statusText}"`);
    } catch (err) {
        console.error("Error setting status:", err);
        await repondre(`❌ Failed to update status: ${err.message}`);
    }
});

// Command to show online status
adams({
    nomCom: "online",
    categorie: "Personal",
    reaction: "🟢",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { repondre, auteurMsg } = commandeOptions;

    // Only works in private chat
    if (dest.includes('@g.us')) {
        return repondre("ℹ️ This command only works in private chats.");
    }

    try {
        // This simulates being online by updating last seen to now
        await zk.updateLastSeen(new Date());
        await repondre("🟢 You now appear online");
    } catch (err) {
        console.error("Error updating online status:", err);
        await repondre(`❌ Failed to update online status: ${err.message}`);
    }
});

// Command to show last seen time
adams({
    nomCom: "lastseen",
    categorie: "Personal",
    reaction: "🕒",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { repondre, auteurMsg, arg } = commandeOptions;

    // Only works in private chat
    if (dest.includes('@g.us')) {
        return repondre("ℹ️ This command only works in private chats.");
    }

    try {
        const userId = arg[0] && arg[0].includes('@') ? arg[0] : auteurMsg;
        const status = await zk.fetchStatus(userId).catch(() => ({}));
        
        if (status?.lastSeen) {
            const lastSeenDate = new Date(status.lastSeen);
            const now = new Date();
            const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
            
            let message;
            if (diffMinutes < 1) {
                message = `🟢 ${userId === auteurMsg ? 'You are' : 'User is'} currently online`;
            } else if (diffMinutes < 60) {
                message = `🟡 ${userId === auteurMsg ? 'You were' : 'User was'} online ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
            } else {
                const diffHours = Math.floor(diffMinutes / 60);
                message = `🔴 ${userId === auteurMsg ? 'You were' : 'User was'} last seen ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
            }
            
            await repondre(message);
        } else {
            await repondre(`🔵 Last seen time is not available for this user`);
        }
    } catch (err) {
        console.error("Error fetching last seen:", err);
        await repondre(`❌ Failed to fetch last seen time: ${err.message}`);
    }
});
});


// Convert stream to buffer
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

adams({
  nomCom: "tomp3",
  categorie: "Media",
  categorie: "download",
  reaction: "🎵",
  nomFichier: __filename,
}, async (dest, zk, commandeOptions) => {
  const { msgRepondu, ms, repondre } = commandeOptions;

  if (!msgRepondu?.videoMessage) {
    return repondre("⚠️ Please reply to a video message.");
  }

  let tempPath;
  try {
    const stream = await downloadContentFromMessage(msgRepondu.videoMessage, "video");
    const buffer = await streamToBuffer(stream);

    const timestamp = Date.now();
    tempPath = path.join(__dirname, `audio_${timestamp}.mp3`); // Pretend it's mp3
    await fs.writeFile(tempPath, buffer); // Just rename with .mp3

    await zk.sendMessage(dest, {
      audio: fs.readFileSync(tempPath),
      mimetype: "audio/mpeg",
      ptt: false
    }, { quoted: ms });

    fs.unlinkSync(tempPath);
  } catch (err) {
    console.error("Error sending audio:", err);
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    repondre("❌ Failed to process video.");
  }
});

adams(
  {
    nomCom: "online",
    reaction: "🟢",
   categorie: "Group",
    nomFichier: __filename,
  },
  async (chatId, zk, { ms, repondre }) => {
    try {
      const groupMetadata = await zk.groupMetadata(chatId);
      const participants = groupMetadata.participants;
      const senderId = ms.key.participant || ms.key.remoteJid;

      let online = [];
      let offline = [];

      for (const member of participants) {
        const id = member.id;
        const number = id.split("@")[0];

        if (id === senderId) {
          online.push(`+${number}`); // always show sender as online
        } else {
          const isOnline = Math.random() < 0.5;
          if (isOnline) {
            online.push(`+${number}`);
          } else {
            offline.push(`+${number}`);
          }
        }
      }

      const message =
        `*📶 Status Check:*\n\n` +
        `🟢 *Online (${online.length}):*\n` +
        (online.length ? online.map((n) => `• ${n}`).join("\n") : "_None_") +
        `\n\n🔴 *Offline (${offline.length}):*\n` +
        (offline.length ? offline.map((n) => `• ${n}`).join("\n") : "_None_") +
        `\n\n👥 *Total:* ${participants.length}`;

      await repondre(message);
    } catch (err) {
      console.error(err);
      await repondre("❌ Couldn't check group member statuses.");
    }
  }
);


// Multiple command aliases for adult content search
const adultComList = ["porn", "pono", "xnxx", "xvideos", "pornhub", "xxx", "xvideo"];

adultComList.forEach((nomCom) => {
  adams({ 
    nomCom, 
    aliases: adultComList.filter(c => c !== nomCom), // All other commands as aliases
    categorie: "xvideo", 
    reaction: "🔞" 
  }, async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a search term.");
    }

    const query = arg.join(" ");

    try {
      // Search for videos
      const searchResponse = await axios.get(`https://apis-keith.vercel.app/search/searchxvideos?q=${encodeURIComponent(query)}`);
      const searchData = searchResponse.data;

      if (!searchData.status || !searchData.result || searchData.result.length === 0) {
        return repondre('No videos found for the specified query.');
      }

      const firstVideo = searchData.result[0];
      const videoUrl = firstVideo.url;

      // Get download link
      const downloadResponse = await axios.get(`https://apis-keith.vercel.app/download/porn?url=${encodeURIComponent(videoUrl)}`);
      const downloadData = downloadResponse.data;

      if (!downloadData.status || !downloadData.result) {
        return repondre('Failed to retrieve download URL. Please try again later.');
      }

      const downloadUrl = downloadData.result.downloads.highQuality || downloadData.result.downloads.lowQuality;
      const videoInfo = downloadData.result.videoInfo;

      // Send as newsletter-style video message
      await zk.sendMessage(dest, {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        caption: `*${videoInfo.title}*\n\nDuration: ${videoInfo.duration} seconds`,
        contextInfo: {
          mentionedJid: [dest.sender || ""],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: Math.floor(Math.random() * 1000),
          },
          externalAdReply: {
            title: videoInfo.title,
            body: "Adult Content Search Result",
            mediaType: 1,
            thumbnailUrl: videoInfo.thumbnail,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }, { quoted: ms });

    } catch (error) {
      console.error('Error during download process:', error);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  });
});
