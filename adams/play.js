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
    let waitMessage = null;

    try {
      // Send initial message
      waitMessage = await zk.sendMessage(
        dest, 
        { text: "🔍 Searching for your song..." }, 
        { 
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );

      // 1. First try YouTube (fastest)
      try {
        const searchResults = await ytSearch(query);
        if (searchResults.videos.length > 0) {
          const video = searchResults.videos[0];
          const videoUrl = video.url;
          const videoTitle = video.title || query;
          const videoDuration = video.timestamp || "Unknown";
          const videoThumbnail = video.thumbnail || "https://files.catbox.moe/sd49da.jpg";

          await zk.sendMessage(
            dest, 
            { 
              text: "⬇️ Downloading from YouTube...",
              edit: waitMessage.key 
            },
            {
              disappearingMessagesInChat: true,
              ephemeralExpiration: 24*60*60
            }
          );

          const ytApi = `https://api.bwmxmd.online/api/download/ytmp3?apikey=ibraah-tech&url=${encodeURIComponent(videoUrl)}`;
          const ytResponse = await axios.get(ytApi);
          
          if (ytResponse.data?.success && ytResponse.data?.result?.download_url) {
            await sendAudio(
              ytResponse.data.result.download_url,
              videoTitle,
              videoDuration,
              videoThumbnail,
              videoUrl,
              "YouTube"
            );
            return;
          }
        }
      } catch (ytError) {
        console.log("YouTube download failed, trying SoundCloud...");
      }

      // 2. Try SoundCloud if YouTube fails
      try {
        await zk.sendMessage(
          dest, 
          { 
            text: "🔍 Searching SoundCloud...",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );

        // Search SoundCloud
        const scSearch = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`);
        
        if (scSearch.data?.status && scSearch.data?.result?.result?.length > 0) {
          const track = scSearch.data.result.result[0];
          const trackUrl = track.url;
          const trackTitle = track.title || query;
          const trackDuration = track.timestamp || "Unknown";
          const trackThumbnail = track.thumb || "https://files.catbox.moe/sd49da.jpg";
          const artist = track.artist || "Unknown Artist";

          await zk.sendMessage(
            dest, 
            { 
              text: "⬇️ Downloading from SoundCloud...",
              edit: waitMessage.key 
            },
            {
              disappearingMessagesInChat: true,
              ephemeralExpiration: 24*60*60
            }
          );

          // Get download URL from SoundCloud
          const scDownload = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(trackUrl)}`);
          
          if (scDownload.data?.result?.downloadUrl) {
            await sendAudio(
              scDownload.data.result.downloadUrl,
              `${trackTitle} - ${artist}`,
              trackDuration,
              trackThumbnail,
              trackUrl,
              "SoundCloud"
            );
            return;
          }
        }
      } catch (scError) {
        console.log("SoundCloud download failed, trying Spotify...", scError);
      }

      // 3. Try Spotify as last resort
      try {
        await zk.sendMessage(
          dest, 
          { 
            text: "🔍 Searching Spotify...",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );

        // Using the Spotify API from your example
        const spotifyResponse = await axios.get(`https://api.dreaded.site/api/spotifydl?title=${encodeURIComponent(query)}`);
        
        if (spotifyResponse.data?.success) {
          await sendAudio(
            spotifyResponse.data.result.downloadLink,
            spotifyResponse.data.result.title || query,
            "Unknown",
            "https://files.catbox.moe/sd49da.jpg",
            `https://open.spotify.com/search/${encodeURIComponent(query)}`,
            "Spotify"
          );
          return;
        }
      } catch (spotifyError) {
        console.log("Spotify download failed", spotifyError);
      }

      // If all methods fail
      throw new Error("All download methods failed");

    } catch (error) {
      console.error("Error during download process:", error.message);
      
      await zk.sendMessage(
        dest, 
        { 
          text: "❌ Failed to download. Please try a different song or try again later." 
        },
        {
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );
    }

    async function sendAudio(url, title, duration, thumbnail, sourceUrl, source) {
      // Ensure all values are properly set
      title = title || "Unknown Track";
      duration = duration || "Unknown";
      thumbnail = thumbnail || "https://files.catbox.moe/sd49da.jpg";
      sourceUrl = sourceUrl || "https://example.com";

      const downloadingMessage = {
        text: `
=========================
 *BWM XMD DOWNLOADER*
=========================
 *Source :* ${source}
=========================
 *Title :* ${title}
 *Duration :* ${duration}
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
            title: title,
            body: `Downloaded from ${source}`,
            mediaType: 1,
            thumbnailUrl: thumbnail,
            sourceUrl: sourceUrl,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      const audioPayload = {
        audio: { url },
        mimetype: "audio/mpeg",
        fileName: `${title.substring(0, 50)}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: `🎶 ${title} | Source: ${source}`,
            mediaType: 1,
            sourceUrl: sourceUrl,
            thumbnailUrl: thumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, audioPayload, { quoted: ms });
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
    let waitMessage = null;

    try {
      // Send initial message
      waitMessage = await zk.sendMessage(
        dest, 
        { text: "🔍 Searching for your song..." }, 
        { 
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );

      // 1. First try YouTube (fastest)
      try {
        const searchResults = await ytSearch(query);
        if (searchResults.videos.length > 0) {
          const video = searchResults.videos[0];
          const videoUrl = video.url;
          const videoTitle = video.title || query;
          const videoDuration = video.timestamp || "Unknown";
          const videoThumbnail = video.thumbnail || "https://files.catbox.moe/sd49da.jpg";

          await zk.sendMessage(
            dest, 
            { 
              text: "⬇️ Downloading from YouTube...",
              edit: waitMessage.key 
            },
            {
              disappearingMessagesInChat: true,
              ephemeralExpiration: 24*60*60
            }
          );

          const ytApi = `https://api.bwmxmd.online/api/download/ytmp3?apikey=ibraah-tech&url=${encodeURIComponent(videoUrl)}`;
          const ytResponse = await axios.get(ytApi);
          
          if (ytResponse.data?.success && ytResponse.data?.result?.download_url) {
            await sendAudio(
              ytResponse.data.result.download_url,
              videoTitle,
              videoDuration,
              videoThumbnail,
              videoUrl,
              "YouTube"
            );
            return;
          }
        }
      } catch (ytError) {
        console.log("YouTube download failed, trying SoundCloud...");
      }

      // 2. Try SoundCloud if YouTube fails
      try {
        await zk.sendMessage(
          dest, 
          { 
            text: "🔍 Searching SoundCloud...",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );

        // Search SoundCloud
        const scSearch = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`);
        
        if (scSearch.data?.status && scSearch.data?.result?.result?.length > 0) {
          const track = scSearch.data.result.result[0];
          const trackUrl = track.url;
          const trackTitle = track.title || query;
          const trackDuration = track.timestamp || "Unknown";
          const trackThumbnail = track.thumb || "https://files.catbox.moe/sd49da.jpg";
          const artist = track.artist || "Unknown Artist";

          await zk.sendMessage(
            dest, 
            { 
              text: "⬇️ Downloading from SoundCloud...",
              edit: waitMessage.key 
            },
            {
              disappearingMessagesInChat: true,
              ephemeralExpiration: 24*60*60
            }
          );

          // Get download URL from SoundCloud
          const scDownload = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(trackUrl)}`);
          
          if (scDownload.data?.result?.downloadUrl) {
            await sendAudio(
              scDownload.data.result.downloadUrl,
              `${trackTitle} - ${artist}`,
              trackDuration,
              trackThumbnail,
              trackUrl,
              "SoundCloud"
            );
            return;
          }
        }
      } catch (scError) {
        console.log("SoundCloud download failed, trying Spotify...", scError);
      }

      // 3. Try Spotify as last resort
      try {
        await zk.sendMessage(
          dest, 
          { 
            text: "🔍 Searching Spotify...",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );

        // Using the Spotify API from your example
        const spotifyResponse = await axios.get(`https://api.dreaded.site/api/spotifydl?title=${encodeURIComponent(query)}`);
        
        if (spotifyResponse.data?.success) {
          await sendAudio(
            spotifyResponse.data.result.downloadLink,
            spotifyResponse.data.result.title || query,
            "Unknown",
            "https://files.catbox.moe/sd49da.jpg",
            `https://open.spotify.com/search/${encodeURIComponent(query)}`,
            "Spotify"
          );
          return;
        }
      } catch (spotifyError) {
        console.log("Spotify download failed", spotifyError);
      }

      // If all methods fail
      throw new Error("All download methods failed");

    } catch (error) {
      console.error("Error during download process:", error.message);
      
      await zk.sendMessage(
        dest, 
        { 
          text: "❌ Failed to download. Please try a different song or try again later." 
        },
        {
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );
    }

    async function sendAudio(url, title, duration, thumbnail, sourceUrl, source) {
      // Ensure all values are properly set
      title = title || "Unknown Track";
      duration = duration || "Unknown";
      thumbnail = thumbnail || "https://files.catbox.moe/sd49da.jpg";
      sourceUrl = sourceUrl || "https://example.com";

      const downloadingMessage = {
        text: `
=========================
 *BWM XMD DOWNLOADER*
=========================
 *Source :* ${source}
=========================
 *Title :* ${title}
 *Duration :* ${duration}
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
            title: title,
            body: `Downloaded from ${source}`,
            mediaType: 1,
            thumbnailUrl: thumbnail,
            sourceUrl: sourceUrl,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, downloadingMessage, { quoted: ms });

      const audioPayload = {
        audio: { url },
        mimetype: "audio/mpeg",
        fileName: `${title.substring(0, 50)}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: `🎶 ${title} | Source: ${source}`,
            mediaType: 1,
            sourceUrl: sourceUrl,
            thumbnailUrl: thumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, audioPayload, { quoted: ms });
    }
  }
);





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
