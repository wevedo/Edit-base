const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

// Audio command configuration
adams(
  {
    nomCom: "play",
    aliases: ["song", "audio", "mp3", "dlmp3", "sound"],
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
        { text: "🔍 Finding your song... Please wait" }, 
        { 
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );

      // 1. First try YouTube
      try {
        const searchResults = await ytSearch(query);
        if (searchResults.videos.length > 0) {
          const video = searchResults.videos[0];
          const videoUrl = video.url;
          const videoTitle = video.title || query;
          const videoDuration = video.timestamp || "Unknown";
          const videoThumbnail = video.thumbnail || "https://files.catbox.moe/sd49da.jpg";

          // Update message smoothly
          await zk.sendMessage(
            dest, 
            { 
              text: "⬇️ Getting your audio ready...",
              edit: waitMessage.key 
            },
            {
              disappearingMessagesInChat: true,
              ephemeralExpiration: 24*60*60
            }
          );

          const apiKey = '_0x5aff35,_0x1876stqr';
          const encodedUrl = encodeURIComponent(videoUrl);
          
          const audioApis = [
            `https://api.giftedtech.my.id/api/download/ytmusic?apikey=${apiKey}&url=${encodedUrl}`,
            `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodedUrl}`,
            `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodedUrl}`
          ];

          let downloadUrl = null;
          
          // Try each API until one works
          for (const api of audioApis) {
            try {
              const response = await axios.get(api, { timeout: 10000 });
              if (response.data?.result?.download_url || response.data?.url) {
                downloadUrl = response.data.result?.download_url || response.data.url;
                break;
              }
            } catch (e) {
              console.log(`API ${api} failed, trying next one...`);
            }
          }

          if (downloadUrl) {
            // Send the audio with newsletter context
            const audioPayload = {
              audio: { url: downloadUrl },
              mimetype: "audio/mpeg",
              fileName: `${videoTitle.substring(0, 50)}.mp3`,
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
                  body: `🎶 ${videoTitle}`,
                  mediaType: 1,
                  sourceUrl: videoUrl,
                  thumbnailUrl: videoThumbnail,
                  renderLargerThumbnail: true,
                  showAdAttribution: true,
                },
              },
            };

            await zk.sendMessage(dest, audioPayload, { quoted: ms });
            
            // Final update
            await zk.sendMessage(
              dest, 
              { 
                text: "✅ Your audio is ready!",
                edit: waitMessage.key 
              },
              {
                disappearingMessagesInChat: true,
                ephemeralExpiration: 24*60*60
              }
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
            text: "🔍 Checking another source...",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );

        // Search SoundCloud
        const scSearch = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`, { timeout: 10000 });
        
        if (scSearch.data?.status && scSearch.data?.result?.result?.length > 0) {
          const track = scSearch.data.result.result[0];
          const trackUrl = track.url;
          const trackTitle = track.title || query;
          const trackThumbnail = track.thumb || "https://files.catbox.moe/sd49da.jpg";
          const artist = track.artist || "Unknown Artist";

          // Get download URL from SoundCloud
          const scDownload = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(trackUrl)}`, { timeout: 10000 });
          
          if (scDownload.data?.result?.downloadUrl) {
            // Send the audio with newsletter context
            const audioPayload = {
              audio: { url: scDownload.data.result.downloadUrl },
              mimetype: "audio/mpeg",
              fileName: `${trackTitle.substring(0, 50)}.mp3`,
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
                  title: trackTitle,
                  body: `🎶 ${trackTitle} - ${artist}`,
                  mediaType: 1,
                  sourceUrl: trackUrl,
                  thumbnailUrl: trackThumbnail,
                  renderLargerThumbnail: true,
                  showAdAttribution: true,
                },
              },
            };

            await zk.sendMessage(dest, audioPayload, { quoted: ms });
            
            // Final update
            await zk.sendMessage(
              dest, 
              { 
                text: "✅ Your audio is ready!",
                edit: waitMessage.key 
              },
              {
                disappearingMessagesInChat: true,
                ephemeralExpiration: 24*60*60
              }
            );
            return;
          }
        }
      } catch (scError) {
        console.log("SoundCloud download failed, trying Spotify...");
      }

      // 3. Try Spotify as last resort
      try {
        await zk.sendMessage(
          dest, 
          { 
            text: "🔍 Looking for your song...",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );

        const spotifyResponse = await axios.get(`https://api.dreaded.site/api/spotifydl?title=${encodeURIComponent(query)}`, { timeout: 10000 });
        
        if (spotifyResponse.data?.success) {
          // Send the audio with newsletter context
          const audioPayload = {
            audio: { url: spotifyResponse.data.result.downloadLink },
            mimetype: "audio/mpeg",
            fileName: `${spotifyResponse.data.result.title || query}.mp3`,
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
                title: spotifyResponse.data.result.title || query,
                body: `🎶 From Spotify`,
                mediaType: 1,
                sourceUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
                thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                renderLargerThumbnail: true,
                showAdAttribution: true,
              },
            },
          };

          await zk.sendMessage(dest, audioPayload, { quoted: ms });
          
          // Final update
          await zk.sendMessage(
            dest, 
            { 
              text: "✅ Your audio is ready!",
              edit: waitMessage.key 
            },
            {
              disappearingMessagesInChat: true,
              ephemeralExpiration: 24*60*60
            }
          );
          return;
        }
      } catch (spotifyError) {
        console.log("Spotify download failed");
      }

      // If all methods fail
      await zk.sendMessage(
        dest, 
        { 
          text: "😢 Sorry, I couldn't get that song. Please try a different one.",
          edit: waitMessage.key 
        },
        {
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );
    } catch (error) {
      console.error("Error during download process:", error.message);
      
      await zk.sendMessage(
        dest, 
        { 
          text: "😢 Sorry, I couldn't get that song. Please try a different one." 
        },
        {
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );
    }
  }
);

// Video command configuration
adams(
  {
    nomCom: "video",
    aliases: ["vida", "mp4", "ytmp4", "dlmp4"],
    categorie: "Search",
    reaction: "🎥",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms, repondre } = commandOptions;

    if (!arg[0]) {
      return repondre("Please provide a video name.");
    }

    const query = arg.join(" ");
    let waitMessage = null;

    try {
      // Send initial message
      waitMessage = await zk.sendMessage(
        dest, 
        { text: "🔍 Finding your video... Please wait" }, 
        { 
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );

      // Search for the video on YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        await zk.sendMessage(
          dest, 
          { 
            text: "No video found for your search.",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );
        return;
      }

      const firstVideo = searchResults.videos[0];
      const videoUrl = firstVideo.url;
      const videoTitle = firstVideo.title;
      const videoDuration = firstVideo.timestamp;
      const videoViews = firstVideo.views;
      const videoThumbnail = firstVideo.thumbnail;

      // Update message
      await zk.sendMessage(
        dest, 
        { 
          text: "⬇️ Preparing your video...",
          edit: waitMessage.key 
        },
        {
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );

      const apiKey = '_0x5aff35,_0x1876stqr';
      const encodedUrl = encodeURIComponent(videoUrl);
      
      const videoApis = [
        `https://api.giftedtech.my.id/api/download/ytmp4?apikey=${apiKey}&url=${encodedUrl}`,
        `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodedUrl}`,
        `https://api.giftedtech.my.id/api/download/ytv?apikey=${apiKey}&url=${encodedUrl}`,
        `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodedUrl}`,
        `https://api.giftedtech.my.id/api/download/ytvideo?apikey=${apiKey}&url=${encodedUrl}`
      ];

      let downloadUrl = null;
      
      // Try each API until one works
      for (const api of videoApis) {
        try {
          const response = await axios.get(api, { timeout: 10000 });
          if (response.data?.result?.download_url || response.data?.url) {
            downloadUrl = response.data.result?.download_url || response.data.url;
            break;
          }
        } catch (e) {
          console.log(`API ${api} failed, trying next one...`);
        }
      }

      if (!downloadUrl) {
        await zk.sendMessage(
          dest, 
          { 
            text: "Sorry, couldn't download the video. Please try again later.",
            edit: waitMessage.key 
          },
          {
            disappearingMessagesInChat: true,
            ephemeralExpiration: 24*60*60
          }
        );
        return;
      }

      // Send the video with newsletter context
      const videoPayload = {
        video: { url: downloadUrl },
        mimetype: "video/mp4",
        caption: `🎥 *${videoTitle}*\n⏳ *Duration:* ${videoDuration}`,
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
            body: `🎥 ${videoTitle}`,
            mediaType: 1,
            sourceUrl: videoUrl,
            thumbnailUrl: videoThumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: true,
          },
        },
      };

      await zk.sendMessage(dest, videoPayload, { quoted: ms });
      
      // Final update
      await zk.sendMessage(
        dest, 
        { 
          text: "✅ Your video is ready!",
          edit: waitMessage.key 
        },
        {
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );
    } catch (error) {
      console.error("Error during download process:", error.message);
      
      await zk.sendMessage(
        dest, 
        { 
          text: "Oops! Something went wrong. Please try again.",
          edit: waitMessage?.key 
        },
        {
          quoted: ms,
          disappearingMessagesInChat: true,
          ephemeralExpiration: 24*60*60
        }
      );
    }
  }
);
