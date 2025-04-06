require("dotenv").config(); // Load environment variables
const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

adams(
  {
    nomCom: "mo1",
    categorie: "Download",
    reaction: "🎬",
  },
  async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg } = commandeOptions;
    if (!arg[0]) return repondre("Please insert a movie name.");

    // Step 1: Search for the movie
    const movie = await searchLegalMovie(arg.join(" "));
    if (!movie) return repondre("No free legal movie found. Try another name.");

    // Show the movie info
    await zk.sendMessage(
      dest,
      {
        image: { url: movie.thumbnail },
        caption: `🎬 *BWM XMD MOVIES*\n\n` +
          `*Title:* ${movie.title}\n` +
          `*Year:* ${movie.year}\n` +
          `*Source:* ${movie.source}\n` +
          `*Download Link:* ${movie.downloadLink}`,
      },
      { quoted: ms }
    );

    // Step 2: Check file size before downloading
    repondre("*Checking movie size...*");
    const fileSize = await getFileSize(movie.downloadLink);

    if (fileSize && fileSize <= 2 * 1024 * 1024 * 1024) { // ≤ 2GB
      repondre("*Downloading your movie...*");
      
      // Step 3: Download and send movie
      const moviePath = await downloadMovie(movie.downloadLink, movie.title);
      if (moviePath) {
        await zk.sendMessage(
          dest,
          {
            video: fs.readFileSync(moviePath),
            mimetype: "video/mp4",
            caption: `🎬 *Here is your movie:* ${movie.title}\n\n*© Ibrahim Adams*`,
          },
          { quoted: ms }
        );
        fs.unlinkSync(moviePath); // Delete file after sending
      } else {
        repondre("❌ Failed to download the movie.");
      }
    } else {
      repondre(`📥 *Movie is too large to send (Size: ${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB).* Please download manually: ${movie.downloadLink}`);
    }
  }
);

// Function to search for legal movies
async function searchLegalMovie(movieName) {
  try {
    const query = encodeURIComponent(movieName);
    const url = `https://archive.org/advancedsearch.php?q=${query}&fl[]=title,year,identifier&output=json`;
    
    const response = await axios.get(url);
    const docs = response.data.response.docs;
    
    if (docs.length === 0) return null;

    const movie = docs[0];
    return {
      title: movie.title,
      year: movie.year,
      source: "Internet Archive",
      thumbnail: `https://archive.org/services/img/${movie.identifier}`,
      downloadLink: `https://archive.org/download/${movie.identifier}/${movie.identifier}.mp4`,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Function to get file size
async function getFileSize(url) {
  try {
    const response = await axios.head(url);
    return parseInt(response.headers["content-length"], 10);
  } catch (error) {
    console.error("Error fetching file size:", error);
    return null;
  }
}

// Function to download movie
async function downloadMovie(url, title) {
  try {
    const filePath = path.join(__dirname, `${title}.mp4`);
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filePath));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading movie:", error);
    return null;
  }
}
