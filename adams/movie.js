const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const ytSearch = require("yt-search");

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
  let trailerData = null;

  // Step 1: Try to get movie info from OMDB API
  try {
    const omdbResponse = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(query)}&plot=full`);
    if (omdbResponse.data.Response === "True") {
      movieData = omdbResponse.data;
    }
  } catch (error) {
    console.error("OMDB API error:", error);
  }

  // Step 2: Try to find trailer on YouTube
  try {
    const searchResults = await ytSearch(`${query} official trailer`);
    if (searchResults.videos.length > 0) {
      trailerData = searchResults.videos[0];
      
      // Get download link from your API
      const apiResponse = await axios.get(
        `https://api.bwmxmd.online/api/download/ytmp4?apikey=ibraah-tech&url=${encodeURIComponent(trailerData.url)}`
      );
      
      if (apiResponse.data?.success) {
        trailerData.downloadUrl = apiResponse.data.result.download_url;
      }
    }
  } catch (error) {
    console.error("YouTube search error:", error);
  }

  // Step 3: Send the best available response
  if (trailerData?.downloadUrl && movieData) {
    // Case 1: Both trailer and movie info available
    const movieInfo = `
🎬 *${movieData.Title}* (${movieData.Year})
⭐ Rating: ${movieData.imdbRating || 'N/A'} • ${movieData.Rated || 'N/A'}
⏳ Runtime: ${movieData.Runtime || 'N/A'}
🎭 Genre: ${movieData.Genre || 'N/A'}
📅 Released: ${movieData.Released || 'N/A'}
🎥 Director: ${movieData.Director || 'N/A'}
👨‍👩‍👧‍👦 Actors: ${movieData.Actors || 'N/A'}
📜 Plot: ${movieData.Plot || 'N/A'}

🔗 IMDB: ${movieData.imdbID ? `https://www.imdb.com/title/${movieData.imdbID}/` : 'N/A'}
    `.trim();

    await zk.sendMessage(dest, {
      video: { url: trailerData.downloadUrl },
      mimetype: "video/mp4",
      caption: movieInfo,
      contextInfo: {
        externalAdReply: {
          title: movieData.Title,
          body: `🎬 ${movieData.Year} • ${movieData.Runtime || ''}`,
          mediaType: 2,
          thumbnailUrl: movieData.Poster || trailerData.thumbnail,
          sourceUrl: trailerData.url,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: ms });

  } else if (trailerData?.downloadUrl) {
    // Case 2: Only trailer available
    await zk.sendMessage(dest, {
      video: { url: trailerData.downloadUrl },
      mimetype: "video/mp4",
      caption: `🎥 *${trailerData.title}*\n⏳ Duration: ${trailerData.timestamp}\n\nCouldn't find detailed info for "${query}"`,
      contextInfo: {
        externalAdReply: {
          title: trailerData.title,
          body: `🎥 ${query} Trailer`,
          mediaType: 2,
          thumbnailUrl: trailerData.thumbnail,
          sourceUrl: trailerData.url,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: ms });

  } else if (movieData) {
    // Case 3: Only movie info available
    const movieInfo = `
🎬 *${movieData.Title}* (${movieData.Year})
⭐ Rating: ${movieData.imdbRating || 'N/A'} • ${movieData.Rated || 'N/A'}
⏳ Runtime: ${movieData.Runtime || 'N/A'}
🎭 Genre: ${movieData.Genre || 'N/A'}
📅 Released: ${movieData.Released || 'N/A'}
🎥 Director: ${movieData.Director || 'N/A'}
👨‍👩‍👧‍👦 Actors: ${movieData.Actors || 'N/A'}
📜 Plot: ${movieData.Plot || 'N/A'}

🔗 IMDB: ${movieData.imdbID ? `https://www.imdb.com/title/${movieData.imdbID}/` : 'N/A'}

⚠️ Couldn't find a trailer for this movie
    `.trim();

    await zk.sendMessage(dest, {
      image: { url: movieData.Poster || 'https://via.placeholder.com/500x750?text=No+Poster+Available' },
      caption: movieInfo
    }, { quoted: ms });

  } else {
    // Case 4: Nothing found
    repondre(`❌ Couldn't find any information or trailer for "${query}"`);
  }
});
