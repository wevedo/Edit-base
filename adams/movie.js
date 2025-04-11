const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");
const cheerio = require("cheerio");

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
      // Get the video page URL
      const imdbPage = await axios.get(`https://www.imdb.com/title/${movieData.imdbID}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(imdbPage.data);
      const trailerElement = $("a[data-testid='videos-slate-overlay-1']");
      if (trailerElement.length) {
        const trailerPath = trailerElement.attr('href');
        trailerUrl = `https://www.imdb.com${trailerPath}`;
        trailerSource = "IMDb";

        // Step 3: Extract embed URL and download video
        const trailerPage = await axios.get(trailerUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        const $$ = cheerio.load(trailerPage.data);
        const embedScript = $$('script[type="application/ld+json"]').html();
        
        if (embedScript) {
          const embedData = JSON.parse(embedScript);
          if (embedData.embedUrl) {
            // Use a proxy service to download the video
            try {
              const proxyResponse = await axios.get(`https://imdb-video.vercel.app/api/download?url=${encodeURIComponent(embedData.embedUrl)}`);
              if (proxyResponse.data?.videoUrl) {
                videoDownloadUrl = proxyResponse.data.videoUrl;
              }
            } catch (proxyError) {
              console.error("Proxy download error:", proxyError);
            }
          }
        }
      }
    } catch (error) {
      console.error("IMDb trailer extraction error:", error);
    }
  }

  // Step 4: Fallback to YouTube if no IMDb trailer or download failed
  if (!videoDownloadUrl) {
    try {
      const searchResults = await ytSearch(`${query} official trailer`);
      if (searchResults.videos.length > 0) {
        trailerUrl = searchResults.videos[0].url;
        trailerSource = "YouTube";
        
        // Download YouTube video using your API
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
  }

  // Step 5: Prepare and send response
  if (movieData) {
    let caption = `
🎬 *${movieData.Title}* (${movieData.Year})
⭐ Rating: ${movieData.imdbRating || 'N/A'} 
⏳ Runtime: ${movieData.Runtime || 'N/A'}
🎭 Genre: ${movieData.Genre || 'N/A'}
📅 Released: ${movieData.Released || 'N/A'}
📜 Plot: ${movieData.Plot || 'N/A'}

${trailerUrl ? `🎥 Trailer Source: ${trailerSource}` : '⚠️ No trailer found'}
    `.trim();

    if (videoDownloadUrl) {
      // Send as video if we have a download URL
      await zk.sendMessage(dest, {
        video: { url: videoDownloadUrl },
        mimetype: "video/mp4",
        caption: caption,
        contextInfo: {
          externalAdReply: {
            title: movieData.Title,
            body: `🎬 ${movieData.Year} • ${movieData.Runtime || ''}`,
            mediaType: 2,
            thumbnailUrl: movieData.Poster || '',
            sourceUrl: trailerUrl,
            renderLargerThumbnail: true,
            showAdAttribution: true
          }
        }
      }, { quoted: ms });
    } else {
      // Fallback to sending poster + info
      await zk.sendMessage(dest, {
        image: { url: movieData.Poster || 'https://via.placeholder.com/500x750?text=No+Poster+Available' },
        caption: caption + (trailerUrl ? `\n\n🔗 Trailer Link: ${trailerUrl}` : '')
      }, { quoted: ms });
    }
  } else {
    repondre(`❌ Couldn't find any information for "${query}"`);
  }
});
