

const { adams } = require('../Ibrahim/adams');
const axios = require('axios');
const fs = require('fs-extra');
const { mediafireDl } = require("../Ibrahim/Function");
const { igdl } = require("ruhend-scraper");
const getFBInfo = require("@xaviabot/fb-downloader");
const { downloadTiktok } = require('@mrnima/tiktok-downloader');
const { facebook } = require('@mrnima/facebook-downloader');  
const conf = require(__dirname + "/../config");
const ffmpeg = require("fluent-ffmpeg");
const gis = require('g-i-s');
const traduire = require("../Ibrahim/traduction") ;
const ai = require('unlimited-ai');
adams({
  nomCom: "twitter",
  aliases: ["xdl", "tweet"],
  desc: "to download Twitter",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Twitter video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/twitter?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9.HD) {
      const videoUrl = response.data.BK9.HD;
      const username = response.data.BK9.username;
      const caption = response.data.BK9.caption;
      const thumbnailUrl = response.data.BK9.thumbnail;

      await zk.sendMessage(dest, {
        image: { url: thumbnailUrl },
        caption: `Username: ${username}\nCaption: ${caption}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: 'Twitter video by bwm xmd',
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});

adams({
  nomCom: "like",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Likee video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/likee?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.withoutwatermark;
      const title = response.data.BK9.title;
      const thumbnailUrl = response.data.BK9.thumbnail;

      await zk.sendMessage(dest, {
        image: { url: thumbnailUrl },
        caption: `Title: ${title}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: "Bwm xmd",
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


adams({
  nomCom: "capcut",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a CapCut video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/capcut?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.video;
      const title = response.data.BK9.title || "CapCut Video";
      const description = response.data.BK9.description || "No description provided.";
      const usage = response.data.BK9.usage || "No usage information provided.";

      await zk.sendMessage(dest, {
        text: `Title: ${title}\nDescription: ${description}\nUsage: ${usage}`,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: "Bwm xmd",
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});


adams({
  nomCom: "pinterest",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a Pinterest video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/pinterest?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9[0].url;
      const imageUrl = response.data.BK9[1].url;

      await zk.sendMessage(dest, {
        image: { url: imageUrl },
        caption: conf.BOT,
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: "Bwm xmd Pinterest",
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});

adams({
  nomCom: "tiktok",
  aliases: ["tiktokdl2", "tikdl2"],
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const link = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a TikTok video link.');
  }

  try {
    const response = await axios.get(`https://bk9.fun/download/tiktok?url=${encodeURIComponent(link)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.BK9;
      const description = response.data.BK9.desc;
      const commentCount = response.data.BK9.comment_count;
      const likesCount = response.data.BK9.likes_count;
      const uid = response.data.BK9.uid;
      const nickname = response.data.BK9.nickname;
      const musicTitle = response.data.BK9.music_info.title;

      await zk.sendMessage(dest, {
        text: "Dowloding...!",
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        caption: `TikTok video by Bwm xmd\n About: ${description}\n Name: ${nickname}`,
        gifPlayback: false
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});





adams({
  nomCom: "xnxx",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  const videoLink = arg.join(' ');

  if (!arg[0]) {
    return repondre('Please insert a video link.');
  }

  try {
    const response = await axios.get(`https://api.davidcyriltech.my.id/xvideo?url=${encodeURIComponent(videoLink)}`);

    if (response.data.success) {
      const title = response.data.title;
      const thumbnail = response.data.thumbnail;
      const downloadUrl = response.data.download_url;

      await zk.sendMessage(dest, {
        video: { url: downloadUrl },
        caption: title,
        contextInfo: {
          externalAdReply: {
            title: "Video Downloader",
            body: title,
            thumbnailUrl: thumbnail,
            sourceUrl: "Bwm xmd xvideo",
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      }, { quoted: ms });

    } else {
      repondre('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    repondre(`An error occurred during download: ${e.message}`);
  }
});




adams({
  'nomCom': 'apk',
  'aliases': ['app', 'playstore'],
  'reaction': 'ðŸ—‚',
  'categorie': 'Download'
}, async (groupId, client, context) => {
  const { repondre, arg, ms } = context;

  try {
    // Check if app name is provided
    const appName = arg.join(" ");
    if (!appName) {
      return repondre("Please provide an app name.");
    }

    // Fetch app search results from the BK9 API
    const searchResponse = await axios.get(`https://bk9.fun/search/apk?q=${appName}`);
    const searchData = searchResponse.data;

    // Check if any results were found
    if (!searchData.BK9 || searchData.BK9.length === 0) {
      return repondre("No app found with that name, please try again.");
    }

    // Fetch the APK details for the first result
    const appDetailsResponse = await axios.get(`https://bk9.fun/download/apk?id=${searchData.BK9[0].id}`);
    const appDetails = appDetailsResponse.data;

    // Check if download link is available
    if (!appDetails.BK9 || !appDetails.BK9.dllink) {
      return repondre("Unable to find the download link for this app.");
    }

    // Send the APK file to the group
    await client.sendMessage(
      groupId,
      {
        document: { url: appDetails.BK9.dllink },
        fileName: `${appDetails.BK9.name}.apk`,
        mimetype: "application/vnd.android.package-archive",
        caption: "BWM-XMD"
      },
      { quoted: ms }
    );

  } catch (error) {
    // Catch any errors and notify the user
    console.error("Error during APK download process:", error);
    repondre("APK download failed. Please try again later.");
  }
});


adams(
  {
    nomCom: "img",
    categorie: "Search",
    reaction: "ðŸ“·"
  },
  async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg } = commandeOptions;

    if (!arg[0]) {
      return repondre('Which image? Please provide a search term!');
    }

    const searchTerm = arg.join(" ");
    repondre(`Bwm xmd searching your images: "${searchTerm}"...`);

    try {
      gis(searchTerm, async (error, results) => {
        if (error) {
          console.error("Image search error:", error);
          return repondre('Oops! An error occurred while searching for images.');
        }

        if (!results || results.length === 0) {
          return repondre('No images found for your search term.');
        }

        // Limit the number of images sent to avoid overloading the bot or WhatsApp.
        const maxImages = 10; // Adjust the limit as needed
        const imagesToSend = results.slice(0, maxImages);

        for (const image of imagesToSend) {
          try {
            await zk.sendMessage(
              dest,
              { image: { url: image.url }, caption: `Bwm xmd result: "${searchTerm}"` },
              { quoted: ms }
            );
          } catch (sendError) {
            console.error("Error sending image:", sendError);
          }
        }
      });
    } catch (mainError) {
      console.error("Main error:", mainError);
      repondre('An unexpected error occurred. Please try again.');
    }
  }
);


adams({
  nomCom: "gpt",
  aliases: ["gpt4", "ai"],
  reaction: '🤔',
  categorie: "ai"
}, async (context, message, params) => {
  const { repondre, arg } = params;  
  const alpha = arg.join(" ").trim(); 

  if (!alpha) return repondre("Please provide text.");

  let conversationData = [];

  try {
    const rawData = fs.readFileSync('store.json', 'utf8');
    if (rawData) {
      conversationData = JSON.parse(rawData);
      if (!Array.isArray(conversationData)) {
        conversationData = [];
      }
    }
  } catch (err) {
    console.log('No previous conversation found, starting new one.');
  }

  const model = 'gpt-4-turbo-2024-04-09';
  const userMessage = { role: 'user', content: alpha };  
  const systemMessage = { role: 'system', content: 'Your called bwm xmd. You were made by Ibrahim adams. You respond to user commands.' };

  // Ensure that the conversationData is an array before pushing
  conversationData.push(userMessage);
  conversationData.push(systemMessage);

  try {
    const aiResponse = await ai.generate(model, conversationData);

    // Append AI response to the conversation
    conversationData.push({ role: 'assistant', content: aiResponse });

    // Save the conversation to file
    fs.writeFileSync('store.json', JSON.stringify(conversationData, null, 2));

    await repondre(aiResponse);
  } catch (error) {
    console.error("Error with AI generation: ", error);
    await repondre("Sorry, there was an error generating the response.");
  }
});
