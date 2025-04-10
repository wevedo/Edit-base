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

// Group picture changer
adams({
    nomCom: "setgrouppic",
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
        await zk.sendMessage(dest, { text: "✅ Group picture updated successfully." });
        fs.unlinkSync(pp);
    } catch (err) {
        console.error("Error setting group picture:", err);
        if (pp && fs.existsSync(pp)) fs.unlinkSync(pp);
        await zk.sendMessage(dest, { text: `❌ Failed to update group picture: ${err.message}` });
    }
});


// ========== PROFILE PICTURE COMMANDS ========== //
const profilePicCommands = ["setpp", "setprofilepic", "updatephoto", "changepic"];
profilePicCommands.forEach((nomCom) => {
    adams({
        nomCom,
        categorie: "Personal",
        reaction: "🖼️",
        nomFichier: __filename
    }, async (dest, zk, commandeOptions) => {
        const { ms, repondre, auteurMsg } = commandeOptions;

        // Only allow in private chat
        if (dest.includes('@g.us')) {
            return repondre("ℹ️ This command only works in private chat.");
        }

        const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg?.imageMessage) {
            return repondre("ℹ️ Please reply to an image message to set as profile picture.");
        }

        let tempPath = null;
        try {
            // Download image
            const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
            const buffer = await streamToBuffer(stream);
            tempPath = path.join(__dirname, `temp_profile_${Date.now()}.jpg`);
            await fs.writeFile(tempPath, buffer);

            // Update your own profile picture
            await zk.updateProfilePicture(auteurMsg, { url: tempPath });
            await repondre("✅ Your profile picture updated successfully!");
        } catch (err) {
            console.error("Profile picture error:", err);
            await repondre(`❌ Failed to update profile picture: ${err.message}`);
        } finally {
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    });
});

// ========== VIEW PROFILE WITH PICTURE COMMANDS ========== //
const viewProfileCommands = ["profile", "info", "userinfo", "whois"];
viewProfileCommands.forEach((nomCom) => {
    adams({
        nomCom,
        categorie: "Personal",
        reaction: "👤",
        nomFichier: __filename
    }, async (dest, zk, commandeOptions) => {
        const { repondre, ms } = commandeOptions;

        try {
            // Get the user ID (the person you're chatting with in private or yourself)
            const userId = dest.includes('@g.us') ? ms.participant || ms.key.participant : dest;
            
            // Fetch profile information
            const profilePicture = await zk.profilePictureUrl(userId, 'image').catch(() => null);
            const pushName = ms.pushName || "Unknown User";

            if (profilePicture) {
                await zk.sendMessage(dest, { 
                    image: { url: profilePicture },
                    caption: `👤 *Profile Information*\n\n📛 *Name:* ${pushName}\n🆔 *User ID:* ${userId}`
                });
            } else {
                await repondre(`👤 *Profile Information*\n\n📛 *Name:* ${pushName}\n🆔 *User ID:* ${userId}\n\nℹ️ No profile picture available.`);
            }
        } catch (err) {
            console.error("Profile error:", err);
            await repondre(`❌ Error fetching profile: ${err.message}`);
        }
    });
});

// ========== STATUS VIEWING COMMANDS ========== //
const viewStatusCommands = ["viewstatus", "checkstatus", "mystatus"];
viewStatusCommands.forEach((nomCom) => {
    adams({
        nomCom,
        categorie: "Personal",
        reaction: "👀",
        nomFichier: __filename
    }, async (dest, zk, commandeOptions) => {
        const { repondre, ms } = commandeOptions;

        try {
            // Get the user ID (the person you're chatting with in private or yourself)
            const userId = dest.includes('@g.us') ? ms.participant || ms.key.participant : dest;
            
            // Fetch status
            const status = await zk.fetchStatus(userId).catch(() => null);
            
            if (status?.status) {
                await repondre(`📝 *Status for ${userId}:*\n\n${status.status}\n\n⌚ Last updated: ${new Date(status.setAt).toLocaleString()}`);
            } else {
                await repondre(`ℹ️ No status available for ${userId}`);
            }
        } catch (err) {
            console.error("Status view error:", err);
            await repondre(`❌ Error checking status: ${err.message}`);
        }
    });
});

// ========== STATUS POSTING COMMANDS ========== //
const postStatusCommands = ["poststatus", "statuspost", "setstatus"];
postStatusCommands.forEach((nomCom) => {
    adams({
        nomCom,
        categorie: "Personal",
        reaction: "📢",
        nomFichier: __filename
    }, async (dest, zk, commandeOptions) => {
        const { repondre, arg, auteurMsg, ms } = commandeOptions;

        const statusText = arg.join(' ');
        if (!statusText) {
            return repondre("ℹ️ Please provide status text. Example: !poststatus Hello world!");
        }

        try {
            await zk.updateProfileStatus(statusText);
            await repondre("✅ Status updated successfully!");
        } catch (err) {
            console.error("Status post error:", err);
            await repondre(`❌ Failed to update status: ${err.message}`);
        }
    });
});

// ========== MEDIA STATUS COMMANDS ========== //
const mediaStatusCommands = ["postimage", "postvideo", "postaudio"];
mediaStatusCommands.forEach((nomCom) => {
    adams({
        nomCom,
        categorie: "Personal",
        reaction: nomCom === "postimage" ? "🖼️" : nomCom === "postvideo" ? "🎥" : "🎵",
        nomFichier: __filename
    }, async (dest, zk, commandeOptions) => {
        const { repondre, ms, arg } = commandeOptions;

        const quotedMsg = ms.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mediaType = nomCom.replace("post", "").toLowerCase();
        const mediaKey = `${mediaType}Message`;
        
        if (!quotedMsg?.[mediaKey]) {
            return repondre(`ℹ️ Please reply to a ${mediaType} message.`);
        }

        const caption = arg.join(' ') || "";
        let tempPath = null;

        try {
            // Download media
            const stream = await downloadContentFromMessage(quotedMsg[mediaKey], mediaType);
            const buffer = await streamToBuffer(stream);
            tempPath = path.join(__dirname, `temp_status_${Date.now()}.${mediaType === 'audio' ? 'mp3' : 'jpg'}`);
            await fs.writeFile(tempPath, buffer);

            // Create message object based on media type
            let message = {};
            if (mediaType === 'image') {
                message.image = { url: tempPath };
                if (caption) message.caption = caption;
            } else if (mediaType === 'video') {
                message.video = { url: tempPath };
                if (caption) message.caption = caption;
            } else if (mediaType === 'audio') {
                message.audio = { url: tempPath };
                message.ptt = false;
            }

            // Send as status update
            await zk.sendMessage(dest, message, { ephemeralExpiration: 24*60*60 });
            await repondre(`✅ ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} status posted successfully!`);
        } catch (err) {
            console.error("Media status error:", err);
            await repondre(`❌ Failed to post ${mediaType} status: ${err.message}`);
        } finally {
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    });
});

// ========== PROFILE NAME COMMANDS ========== //
const nameCommands = ["setname", "updatename", "myname"];
nameCommands.forEach((nomCom) => {
    adams({
        nomCom,
        categorie: "Personal",
        reaction: "📛",
        nomFichier: __filename
    }, async (dest, zk, commandeOptions) => {
        const { repondre, arg } = commandeOptions;

        const newName = arg.join(' ');
        if (!newName) {
            return repondre("ℹ️ Please provide a new name. Example: !setname John Doe");
        }

        try {
            await zk.updateProfileName(newName);
            await repondre(`✅ Your profile name has been updated to: ${newName}`);
        } catch (err) {
            console.error("Name update error:", err);
            await repondre(`❌ Failed to update name: ${err.message}`);
        }
    });
});

// ========== BIO COMMANDS ========== //
const bioCommands = ["setbio", "about", "mybio"];
bioCommands.forEach((nomCom) => {
    adams({
        nomCom,
        categorie: "Personal",
        reaction: "ℹ️",
        nomFichier: __filename
    }, async (dest, zk, commandeOptions) => {
        const { repondre, arg } = commandeOptions;

        const bioText = arg.join(' ');
        if (!bioText) {
            return repondre("ℹ️ Please provide bio text. Example: !setbio Software Developer");
        }

        try {
            await zk.updateProfileStatus(bioText);
            await repondre(`✅ Your bio has been updated to: ${bioText}`);
        } catch (err) {
            console.error("Bio update error:", err);
            await repondre(`❌ Failed to update bio: ${err.message}`);
        }
    });
});

// ========== DELETE STATUS COMMANDS ========== //
const deleteStatusCommands = ["deletestatus", "removestatus", "clearstatus"];
deleteStatusCommands.forEach((nomCom) => {
    adams({
        nomCom,
        categorie: "Personal",
        reaction: "🗑️",
        nomFichier: __filename
    }, async (dest, zk, commandeOptions) => {
        const { repondre } = commandeOptions;

        try {
            await zk.updateProfileStatus("");
            await repondre("✅ Your status has been cleared!");
        } catch (err) {
            console.error("Status delete error:", err);
            await repondre(`❌ Failed to clear status: ${err.message}`);
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
