const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");
const cheerio = require("cheerio"); // For HTML parsing

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

  // Step 1: Get movie info from OMDB
  try {
    const omdbResponse = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(query)}&plot=full`);
    if (omdbResponse.data.Response === "True") {
      movieData = omdbResponse.data;
    }
  } catch (error) {
    console.error("OMDB API error:", error);
  }

  // Step 2: Try to find IMDb trailer first
  if (movieData?.imdbID) {
    try {
      const imdbPage = await axios.get(`https://www.imdb.com/title/${movieData.imdbID}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(imdbPage.data);
      const trailerElement = $("a[data-testid='videos-slate-overlay-1']");
      if (trailerElement.length) {
        trailerUrl = `https://www.imdb.com${trailerElement.attr('href')}`;
        trailerSource = "IMDb";
      }
    } catch (error) {
      console.error("IMDb page scraping error:", error);
    }
  }

  // Step 3: Fallback to YouTube if no IMDb trailer
  if (!trailerUrl) {
    try {
      const searchResults = await ytSearch(`${query} official trailer`);
      if (searchResults.videos.length > 0) {
        trailerUrl = searchResults.videos[0].url;
        trailerSource = "YouTube";
      }
    } catch (error) {
      console.error("YouTube search error:", error);
    }
  }

  // Step 4: Prepare and send response
  if (movieData) {
    let caption = `
🎬 *${movieData.Title}* (${movieData.Year})
⭐ Rating: ${movieData.imdbRating || 'N/A'} 
⏳ Runtime: ${movieData.Runtime || 'N/A'}
🎭 Genre: ${movieData.Genre || 'N/A'}
📅 Released: ${movieData.Released || 'N/A'}
📜 Plot: ${movieData.Plot || 'N/A'}

${trailerUrl ? `🎥 Trailer: ${trailerUrl} (Source: ${trailerSource})` : '⚠️ No trailer found'}
    `.trim();

    if (trailerUrl && trailerSource === "YouTube") {
      // For YouTube trailers, we can download and send as video
      try {
        const apiResponse = await axios.get(
          `https://api.bwmxmd.online/api/download/ytmp4?apikey=ibraah-tech&url=${encodeURIComponent(trailerUrl)}`
        );
        
        if (apiResponse.data?.success) {
          await zk.sendMessage(dest, {
            video: { url: apiResponse.data.result.download_url },
            mimetype: "video/mp4",
            caption: caption
          }, { quoted: ms });
          return;
        }
      } catch (error) {
        console.error("Trailer download error:", error);
      }
    }

    // Fallback to sending poster + info
    await zk.sendMessage(dest, {
      image: { url: movieData.Poster || 'https://via.placeholder.com/500x750?text=No+Poster+Available' },
      caption: caption
    }, { quoted: ms });

  } else {
    repondre(`❌ Couldn't find any information for "${query}"`);
  }
});
