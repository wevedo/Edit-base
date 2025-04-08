const { adams } = require('../Ibrahim/adams');
const { default: axios } = require('axios');
const pkg = require('@whiskeysockets/baileys');
const { generateWAMessageFromContent, prepareWAMessageMedia } = pkg;

// Unified Rent/Code Command with multiple API endpoints
const nomComList = ["rent", "code", "pair", "link"]; // Base commands

nomComList.forEach((nomCom) => {
  // Register base command (without suffix)
  adams({ nomCom, reaction: "🚘", categorie: "User" }, async (dest, zk, commandeOptions) => {
    await handleCodeRequest(dest, zk, commandeOptions, "https://bwm-xmd-xmd.onrender.com");
  });

  // Register command with suffix 1
  adams({ nomCom: `${nomCom}1`, reaction: "🚘", categorie: "User" }, async (dest, zk, commandeOptions) => {
    await handleCodeRequest(dest, zk, commandeOptions, "https://bwm-xmd-xmd-9kig.onrender.com");
  });

  // Register command with suffix 2
  adams({ nomCom: `${nomCom}2`, reaction: "🚘", categorie: "User" }, async (dest, zk, commandeOptions) => {
    await handleCodeRequest(dest, zk, commandeOptions, "https://bwm-xmd-scanner-s211.onrender.com");
  });
});

async function handleCodeRequest(dest, zk, commandeOptions, apiUrl) {
  const { repondre, arg, ms } = commandeOptions;

  try {
    if (!arg || arg.length === 0) {
      return repondre(`Example Usage: .${commandeOptions.nomCom} 254xxxxxxxx`);
    }

    await repondre('ɢᴇɴᴇʀᴀᴛɪɴɢ ʏᴏᴜʀ ᴄᴏᴅᴇ.........');
    const text = encodeURIComponent(arg.join(' '));
    const fullApiUrl = `${apiUrl}/code?number=${text}`;

    const response = await axios.get(fullApiUrl);
    const result = response.data;

    if (result && result.code) {
      const getsess = result.code;

      // First message with just the code
      const codeMessage = generateWAMessageFromContent(dest, {
        extendedTextMessage: {
          text: `\`\`\`${getsess}\`\`\``
        }
      }, {});

      await zk.relayMessage(dest, codeMessage.message, {
        messageId: codeMessage.key.id
      });

      // Second message with additional information
      const captionMessage = generateWAMessageFromContent(dest, {
        extendedTextMessage: {
          text: '*ᴄᴏᴘʏ ᴛʜᴇ ᴀʙᴏᴠᴇ ᴄᴏᴅᴇ ᴀɴᴅ ʟɪɴᴋ ɪᴛ ᴛᴏ ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ*\n\n🌐 ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ\nhttps://business.bwmxmd.online\n\n*ᴍᴀᴅᴇ ʙʏ ɪʙʀᴀʜɪᴍ ᴀᴅᴀᴍs*'
        }
      }, {});

      await zk.relayMessage(dest, captionMessage.message, {
        messageId: captionMessage.key.id
      });

    } else {
      throw new Error('Invalid response from API.');
    }
  } catch (error) {
    console.error('Error getting API response:', error.message);
    repondre('Error getting response from API.');
  }
}
// Scan Command
adams({ nomCom: "scan", reaction: "🔍", categorie: "pair" }, async (dest, zk, commandeOptions) => {
  const { repondre } = commandeOptions;

  try {
    const instructions = `
*📖 HOW TO GET BWM XMD SESSION:*

1️⃣ **Open the link below**

> https://www.ibrahimadams.site/scanner

2️⃣ **Enter Your WhatsApp Number**  

   👉 Type your WhatsApp number with your country code without (+) (e.g., 254xxxxxxxx) and tap **Submit**.  

3️⃣ **Receive a Code**  

   👉 Ibrahim Tech will send a short code, Copy it to your keyboard.  

4️⃣ **Check WhatsApp Notification**  

   👉 WhatsApp will notify you. Tap on the notification and enter the code sent by Ibrahim Tech.  

5️⃣ **Wait for the Session**  

   👉 After loading, it will link then Ibrahim Tech will send a session to your WhatsApp number.  

6️⃣ **Copy and Share the Session**  

   👉 Copy the long session and send it to me.  

*💻 Powered by bwm xmd* 

╭────────────━⊷
🌐 ᴛᴀᴘ ᴏɴ ᴛʜᴇ ʟɪɴᴋ ʙᴇʟᴏᴡ ᴛᴏ ғᴏʟʟᴏᴡ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ
> https://www.ibrahimadams.site/co.ke
🌐 ғᴏʀ ᴍᴏʀᴇ ɪɴғᴏ, ᴠɪsɪᴛ
> https://business.bwmxmd.online
╰────────────━⊷
> Made by Ibrahim Adams
    `;

    const instructionMessage = generateWAMessageFromContent(dest, {
      extendedTextMessage: {
        text: instructions
      }
    }, {});

    await zk.relayMessage(dest, instructionMessage.message, {
      messageId: instructionMessage.key.id
    });
  } catch (error) {
    console.error('Error sending instructions:', error.message);
    repondre('Error sending instructions.');
  }
});
