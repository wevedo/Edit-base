const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");
const cheerio = require("cheerio");

// Random images for newsletter
const randomImages = [
  "https://files.catbox.moe/c07f3s.jpeg",
  "https://files.catbox.moe/c07f3s.jpeg",
  "https://files.catbox.moe/c07f3s.jpeg"
];

adams({
  'nomCom': "movie",
  'categorie': 'Search',
  'reaction': '🎬'
}, async (dest, zk, commandOptions) => {
  const { arg, repondre, ms } = commandOptions;
  
  if (!arg[0]) {
    return repondre("Please provide a movie name.");
  }

  const query = arg.join(" ");
  let movieData = null;
  let trailerUrl = null;
  let trailerSource = "Not found";
  let videoDownloadUrl = null;
  let youtubeTrailers = [];

  // Step 1: Get movie info from OMDB
  try {
    const omdbResponse = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(query)}&plot=full`);
    if (omdbResponse.data.Response === "True") {
      movieData = omdbResponse.data;
    }
  } catch (error) {
    console.error("OMDB API error:", error);
  }

  // Step 2: Try to find and extract IMDb trailer
  if (movieData?.imdbID) {
    try {
      const imdbPage = await axios.get(`https://www.imdb.com/title/${movieData.imdbID}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(imdbPage.data);
      const trailerElements = $("a[data-testid*='videos-slate']");
      
      if (trailerElements.length) {
        const trailerPath = trailerElements.first().attr('href');
        trailerUrl = `https://www.imdb.com${trailerPath}`;
        trailerSource = "IMDb";

        // Try to extract video from embed URL
        try {
          const embedResponse = await axios.get(`https://www.imdb.com/video/imdb/${movieData.imdbID}/imdb/embed`);
          const $$ = cheerio.load(embedResponse.data);
          const videoScript = $$('script:contains("videoUrl")').html();
          
          if (videoScript) {
            const videoMatch = videoScript.match(/"videoUrl":"(.*?)"/);
            if (videoMatch && videoMatch[1]) {
              videoDownloadUrl = videoMatch[1].replace(/\\\//g, '/');
            }
          }
        } catch (embedError) {
          console.error("IMDb embed extraction failed:", embedError);
        }
      }
    } catch (error) {
      console.error("IMDb trailer extraction error:", error);
    }
  }

  // Step 3: Search YouTube for trailers (always get multiple results)
  try {
    const searchResults = await ytSearch(`${query} official trailer`);
    youtubeTrailers = searchResults.videos.slice(0, 3); // Get top 3 results
    
    if (youtubeTrailers.length > 0 && !videoDownloadUrl) {
      // Use first YouTube trailer as fallback
      trailerUrl = youtubeTrailers[0].url;
      trailerSource = "YouTube";
      
      const apiResponse = await axios.get(
        `https://api.bwmxmd.online/api/download/ytmp4?apikey=ibraah-tech&url=${encodeURIComponent(trailerUrl)}`
      );
      
      if (apiResponse.data?.success) {
        videoDownloadUrl = apiResponse.data.result.download_url;
      }
    }
  } catch (error) {
    console.error("YouTube search error:", error);
  }

  // Step 4: Prepare and send response
  if (movieData) {
    let caption = `
╔══════════════════════╗
       *BWM XMD MOVIE SEARCH*
╚══════════════════════╝
🎬 *${movieData.Title}* (${movieData.Year})
⭐ Rating: ${movieData.imdbRating || 'N/A'} 
⏳ Runtime: ${movieData.Runtime || 'N/A'}
🎭 Genre: ${movieData.Genre || 'N/A'}
📅 Released: ${movieData.Released || 'N/A'}
📜 Plot: ${movieData.Plot || 'N/A'}

${videoDownloadUrl ? "▶️ Video trailer attached" : ""}

Download full movies in my telegram channel for free:
https://t.me/ibrahimtechai
╚══════════════════════╝
    `.trim();

    // Add trailer links section if we have them
    if (trailerUrl || youtubeTrailers.length > 0) {
      caption += "\n\n🔗 *Available Trailers:*\n";
      
      if (trailerSource === "IMDb" && trailerUrl) {
        caption += `- IMDb: ${trailerUrl}\n`;
      }
      
      youtubeTrailers.forEach((trailer, index) => {
        caption += `- YouTube ${index + 1}: ${trailer.url}\n`;
      });
    }

    const randomImage = randomImages[Math.floor(Math.random() * randomImages.length)];

    if (videoDownloadUrl) {
      // Send as video if available
      await zk.sendMessage(dest, {
        video: { url: videoDownloadUrl },
        mimetype: "video/mp4",
        caption: caption,
        contextInfo: {
          mentionedJid: [],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: Math.floor(100000 + Math.random() * 900000),
          },
          externalAdReply: {
            title: movieData.Title,
            body: `🎬 ${movieData.Year} • ${movieData.Runtime || ''}`,
            mediaType: 2,
            thumbnailUrl: movieData.Poster || randomImage,
            sourceUrl: trailerUrl || '',
            renderLargerThumbnail: true,
            showAdAttribution: true
          }
        }
      }, { quoted: ms });
    } else {
      // Send as image with links
      await zk.sendMessage(dest, {
        image: { url: movieData.Poster || randomImage },
        caption: caption,
        contextInfo: {
          mentionedJid: [],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363285388090068@newsletter",
            newsletterName: "BWM-XMD",
            serverMessageId: Math.floor(100000 + Math.random() * 900000),
          }
        }
      }, { quoted: ms });
    }
  } else {
    // No movie found response
    await zk.sendMessage(dest, {
      image: { url: randomImages[0] },
      caption: `❌ No movie found for "${query}"\n\nTry another search or check our channel for content:\nhttps://t.me/ibrahimtechai`,
      contextInfo: {
        mentionedJid: [],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363285388090068@newsletter",
          newsletterName: "BWM-XMD",
          serverMessageId: Math.floor(100000 + Math.random() * 900000),
        }
      }
    }, { quoted: ms });
  }
});
