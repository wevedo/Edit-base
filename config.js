//═══════[ 𝙎𝙀𝙏𝙏𝙄𝙉𝙂𝙎 & 𝘾𝙊𝙉𝙁𝙄𝙂 ]═══════✧//
const fs = require('fs-extra');
const path = require("path");

// Load environment variables
if (fs.existsSync('config.env')) {
    require('dotenv').config({ path: __dirname + '/config.env' });
}

//═══════[ 𝘽𝙊𝙏 𝘾𝙊𝙉𝙁𝙄𝙂𝙐𝙍𝘼𝙏𝙄𝙊𝙉 ]═══════✧//
module.exports = {
    //═══════[ 𝘾𝙊𝙍𝙀 𝘾𝙊𝙉𝙁𝙄𝙂 ]═══════✧//
    session: process.env.SESSION_ID || '',
    PREFIX: process.env.PREFIX || "",
    MODE: (process.env.PUBLIC_MODE || "yes").toLowerCase(),
    
    //═══════[ 𝙊𝙒𝙉𝙀𝙍 𝘿𝙀𝙏𝘼𝙄𝙇𝙎 ]═══════✧//
    OWNER_NAME: process.env.OWNER_NAME || "Ibrahim Adams",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "254106727593,254727716045,254710772666",
    
    //═══════[ 𝘽𝙊𝙏 𝙋𝙍𝙊𝙁𝙄𝙇𝙀 ]═══════✧//
    BOT: process.env.BOT_NAME || '⚡ BWM-XMD',
    URL: process.env.BOT_IMAGE || 'https://files.catbox.moe/h2ydge.jpg',
    DP: (process.env.STARTING_BOT_MESSAGE || "yes").toLowerCase(),
    
    //═══════[ 𝙋𝙍𝙀𝙎𝙀𝙉𝘾𝙀 & 𝘼𝙐𝙏𝙊𝙈𝘼𝙏𝙄𝙊𝙉 ]═══════✧//
    ETAT: process.env.PRESENCE || '',
    AUTO_READ: (process.env.AUTO_READ || "no").toLowerCase(),
    AUTO_READ_STATUS: (process.env.AUTO_READ_STATUS || "yes").toLowerCase(),
    AUTO_DOWNLOAD_STATUS: (process.env.AUTO_DOWNLOAD_STATUS || "no").toLowerCase(),
    
    //═══════[ 𝘾𝙃𝘼𝙏 𝙁𝙀𝘼𝙏𝙐𝙍𝙀𝙎 ]═══════✧//
    CHATBOT: (process.env.CHATBOT || "no").toLowerCase(),
    CHATBOT1: (process.env.AUDIO_CHATBOT || "no").toLowerCase(),
     
    //═══════[ 𝙂𝙍𝙊𝙐𝙋 𝙎𝙀𝘾𝙐𝙍𝙄𝙏𝙔 ]═══════✧//
    GROUP_ANTILINK: (process.env.GROUPANTILINK || "yes").toLowerCase(),
    GROUP_ANTILINK2: (process.env.GROUPANTILINK_DELETE_ONLY || "no").toLowerCase(),
    ANTIDELETE1: (process.env.ANTIDELETE_SENT_INBOX || "yes").toLowerCase(),
    ANTIDELETE2: (process.env.ANTIDELETE_RECOVER_CONVENTION || "no").toLowerCase(),
        
    //═══════[ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 𝙃𝘼𝙉𝘿𝙇𝙄𝙉𝙂 ]═══════✧//
    STATUS_REACT_EMOJIS: process.env.STATUS_REACT_EMOJIS || "🚀,🌎",
    WELCOME_MESSAGE: (process.env.WELCOME_MESSAGE || "no").toLowerCase(),
    GOODBYE_MESSAGE: (process.env.GOODBYE_MESSAGE || "no").toLowerCase(),
    
    //═══════[ 𝙀𝙀𝙍𝙊𝙆𝙐 𝘾𝙊𝙉𝙁𝙄𝙂 ]═══════✧//
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
    HEROKU_API_KEY: process.env.HEROKU_API_KEY,
    
    //═══════[ 𝘼𝙐𝙏𝙊 𝙍𝙀𝘼𝘾𝙏𝙄𝙊𝙉𝙎 ]═══════✧//
    AUTO_REACT: (process.env.AUTO_REACT || "no").toLowerCase(),
    AUTO_REACT_STATUS: (process.env.AUTO_REACT_STATUS || "yes").toLowerCase(),    
    ANTICALL : (process.env.AUTO_REJECT_CALL || "no").toLowerCase(),
    AUTO_BIO: (process.env.AUTO_BIO || "yes").toLowerCase(),    
    
    //═══════[ 𝘿𝘼𝙏𝘼𝘽𝘼𝙎𝙀 ]═══════✧//
    DATABASE: process.env.DATABASE_URL || "sqlite://./database.db",
    BWM_XMD: 'https://raw.githubusercontent.com/wevedo/Edit-base/refs/heads/main/index.html',
    GURL: 'https://whatsapp.com/channel/0029VaZuGSxEawdxZK9CzM0Y',
};

//═══════[ 𝘾𝙊𝙉𝙁𝙄𝙂 𝙒𝘼𝙏𝘾𝙃𝙀𝙍 ]═══════✧//
let configFile = require.resolve(__filename);
fs.watchFile(configFile, () => {
    fs.unwatchFile(configFile);
    console.log(`♻️  Config file updated: ${__filename}`);
    delete require.cache[configFile];
    require(configFile);
});
