const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Command for downloading audio (MP3)
adams(
  {
    nomCom: "play",
    aliases: ["song", "audio", "mp3"],
    categorie: "Search",
    reaction: "🎵",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a song name.");
    }

    const query = arg.join(" ");

    try {
      // Search for the song on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for the specified query.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoViews = firstVideo.views;
      const videoThumbnail = firstVideo.thumbnail;

      // Format the downloading message with classic symbols
      const downloadingMessage = {
        text: `
=========================
 *BWM XMD DOWNLOADER*
=========================
=========================
 *Title :* ${videoTitle}
 *Duration :* ${videoDuration}
 *Views :* ${videoViews}
=========================

> © Sir Ibrahim Adams
        `,
        contextInfo: {
          mentionedJid: [ms.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363285388090068@newsletter',
            newsletterName: "BWM-XMD",
            serverMessageId: 143,
          },
          externalAdReply: {
            title: videoTitle,
            body: "BWM XMD Downloader",
            mediaType: 1, // 1 for image
            thumbnailUrl: "https://files.catbox.moe/sd49da.jpg", // Small image for downloadingMessage
            sourceUrl: videoUrl,
            renderLargerThumbnail: false, // Ensure the image is small
            showAdAttribution: true,
          },
        },
      };
      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      // Send "Just a minute" message
      const waitMessage = await zk.sendMessage(dest, { text: "🛜 𝙹𝚞𝚜𝚝 𝚊 𝚖𝚒𝚗𝚞𝚝𝚎, 𝚢𝚘𝚞𝚛 𝚊𝚞𝚍𝚒𝚘 𝚒𝚜 𝚋𝚎𝚒𝚗𝚐 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚍..." }, { quoted: ms });

      // New API endpoint
      const api = `https://api.bwmxmd.online/api/download/ytmp3?apikey=ibraah-tech&url=${encodeURIComponent(videoUrl)}`;

      // Fetch data from the new API
      const response = await axios.get(api);
      const downloadData = response.data;

      if (!downloadData || !downloadData.success || !downloadData.result.download_url) {
        return repondre("Failed to retrieve a download link. Please try again later.");
      }

      const downloadUrl = downloadData.result.download_url;
      const audioTitle = downloadData.result.title || videoTitle;

      // Delete the "Just a minute" message
      await zk.sendMessage(dest, { delete: waitMessage.key });

      // Send the audio file
      const audioPayload = {
        audio: { url: downloadUrl },
        mimetype: "audio/mp4",
        contextInfo: {
          externalAdReply: {
            title: audioTitle,
            body: `🎶 ${audioTitle} | Duration: ${videoDuration}`,
            mediaType: 1,
            sourceUrl: videoUrl,
            thumbnailUrl: videoThumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, audioPayload, { quoted: ms });
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);


adams(
  {
    nomCom: "song",
    aliases: ["song", "audio", "mp3"],
    categorie: "Search",
    reaction: "🎵",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a song name.");
    }

    const query = arg.join(" ");

    try {
      // Search for the song on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for the specified query.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoViews = firstVideo.views;
      const videoThumbnail = firstVideo.thumbnail;

      // Format the downloading message with classic symbols
      const downloadingMessage = {
        text: `
=========================
 *BWM XMD DOWNLOADER*
=========================
=========================
 *Title :* ${videoTitle}
 *Duration :* ${videoDuration}
 *Views :* ${videoViews}
=========================

> © Sir Ibrahim Adams
        `,
        contextInfo: {
          mentionedJid: [ms.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363285388090068@newsletter',
            newsletterName: "BWM-XMD",
            serverMessageId: 143,
          },
          externalAdReply: {
            title: videoTitle,
            body: "BWM XMD Downloader",
            mediaType: 1, // 1 for image
            thumbnailUrl: "https://files.catbox.moe/sd49da.jpg", // Small image for downloadingMessage
            sourceUrl: videoUrl,
            renderLargerThumbnail: false, // Ensure the image is small
            showAdAttribution: true,
          },
        },
      };
      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      // Send "Just a minute" message
      const waitMessage = await zk.sendMessage(dest, { text: "📥 𝙹𝚞𝚜𝚝 𝚊 𝚖𝚒𝚗𝚞𝚝𝚎, 𝚢𝚘𝚞𝚛 𝚊𝚞𝚍𝚒𝚘 𝚒𝚜 𝚋𝚎𝚒𝚗𝚐 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚍..." }, { quoted: ms });

      // New API endpoint
      const api = `https://api.bwmxmd.online/api/download/ytmp3?apikey=ibraah-tech&url=${encodeURIComponent(videoUrl)}`;

      // Fetch data from the new API
      const response = await axios.get(api);
      const downloadData = response.data;

      if (!downloadData || !downloadData.success || !downloadData.result.download_url) {
        return repondre("Failed to retrieve a download link. Please try again later.");
      }

      const downloadUrl = downloadData.result.download_url;
      const audioTitle = downloadData.result.title || videoTitle;

      // Delete the "Just a minute" message
      await zk.sendMessage(dest, { delete: waitMessage.key });

      // Send the audio file
      const audioPayload = {
        audio: { url: downloadUrl },
        mimetype: "audio/mp4",
        contextInfo: {
          externalAdReply: {
            title: audioTitle,
            body: `🎶 ${audioTitle} | Duration: ${videoDuration}`,
            mediaType: 1,
            sourceUrl: videoUrl,
            thumbnailUrl: videoThumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, audioPayload, { quoted: ms });
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);


// Command for downloading video (MP4)
adams(
  {
    nomCom: "video",
    aliases: ["song", "video", "mp4"],
    categorie: "Search",
    reaction: "🎥",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a video name.");
    }

    const query = arg.join(" ");

    try {
      // Search for the video on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return repondre("No video found for the specified query.");
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoViews = firstVideo.views;
      const videoThumbnail = firstVideo.thumbnail;

      // Format the downloading message with classic symbols
      const downloadingMessage = {
        text: `
=========================
 *BWM XMD DOWNLOADER*
=========================
=========================
 *Title :* ${videoTitle}
 *Duration :* ${videoDuration}
 *Views :* ${videoViews}
=========================

> © Sir Ibrahim Adams
        `,
        contextInfo: {
          mentionedJid: [ms.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363285388090068@newsletter',
            newsletterName: "BWM-XMD",
            serverMessageId: 143,
          },
          externalAdReply: {
            title: videoTitle,
            body: "BWM XMD Downloader",
            mediaType: 1, // 1 for image
            thumbnailUrl: "https://files.catbox.moe/sd49da.jpg", // Small image for downloadingMessage
            sourceUrl: videoUrl,
            renderLargerThumbnail: false, // Ensure the image is small
            showAdAttribution: true,
          },
        },
      };
      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      // Send "Just a minute" message
      const waitMessage = await zk.sendMessage(dest, { text: "📥 𝙹𝚞𝚜𝚝 𝚊 𝚖𝚒𝚗𝚞𝚝𝚎, 𝚢𝚘𝚞𝚛 𝚟𝚒𝚍𝚎𝚘 𝚒𝚜 𝚋𝚎𝚒𝚗𝚐 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚍..." }, { quoted: ms });

      // New API endpoint for video download
      const api = `https://api.bwmxmd.online/api/download/ytmp4?apikey=ibraah-tech&url=${encodeURIComponent(videoUrl)}`;

      // Fetch data from the new API
      const response = await axios.get(api);
      const downloadData = response.data;

      if (!downloadData || !downloadData.success || !downloadData.result.download_url) {
        return repondre("Failed to retrieve a download link. Please try again later.");
      }

      const downloadUrl = downloadData.result.download_url;
      const videoTitleFinal = downloadData.result.title || videoTitle;

      // Delete the "Just a minute" message
      await zk.sendMessage(dest, { delete: waitMessage.key });

      // Send the video file
      const videoPayload = {
        video: { url: downloadUrl },
        mimetype: "video/mp4",
        caption: `🎥 *${videoTitleFinal}*\n⏳ *Duration:* ${videoDuration}`,
        contextInfo: {
          externalAdReply: {
            title: videoTitleFinal,
            body: `🎥 ${videoTitleFinal} | Duration: ${videoDuration}`,
            mediaType: 1,
            sourceUrl: videoUrl,
            thumbnailUrl: videoThumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, videoPayload, { quoted: ms });
    } catch (error) {
      console.error("Error during download process:", error.message);
      return repondre(`Download failed due to an error: ${error.message || error}`);
    }
  }
);
