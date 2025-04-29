const { adams } = require("../Ibrahim/adams");
const fs = require('fs');
const path = require('path');

// Path to your config.env file
const envPath = path.join(__dirname, '/../config.env');

// Helper function to read .env file
function readEnvFile() {
  try {
    const data = fs.readFileSync(envPath, 'utf8');
    const envLines = data.split('\n');
    const envVars = {};
    
    envLines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env file:', error);
    return {};
  }
}

// Helper function to write to .env file
function writeEnvFile(envVars) {
  let content = '';
  for (const [key, value] of Object.entries(envVars)) {
    content += `${key}=${value}\n`;
  }
  fs.writeFileSync(envPath, content);
}

// **Mapping of Environment Variables to User-Friendly Names**
const configMapping = {
  AUDIO_CHATBOT: "Audio Chatbot",
  AUTO_BIO: "Auto Bio",
  AUTO_DOWNLOAD_STATUS: "Auto Download Status",
  AUTO_REACT: "Auto React",
  AUTO_REACT_STATUS: "Auto React Status",
  AUTO_READ: "Auto Read",
  AUTO_READ_STATUS: "Auto Read Status",
  CHATBOT: "Chatbot",
  PUBLIC_MODE: "Public Mode",
  STARTING_BOT_MESSAGE: "Starting Bot Message",
  "Auto Typing": "Auto Typing",
  "Always Online": "Always Online",
  "Auto Recording": "Auto Recording",
  ANTIDELETE_RECOVER_CONVENTION: "Anti Delete Recover Convention",
  ANTIDELETE_SENT_INBOX: "Anti Delete Sent Inbox",
  GOODBYE_MESSAGE: "Goodbye Message",
  AUTO_REJECT_CALL: "Auto Reject Call",
  WELCOME_MESSAGE: "Welcome Message",
  GROUPANTILINK: "Group Anti Link",
  AUTO_REPLY_STATUS: "Auto reply status"
};

// **Excluded Variables**
const EXCLUDED_VARS = [
  "DATA_BASE_URL",
  "MENU_TYPE",
  "CHATBOT1",
  "OWNER_NUMBER",
  "HEROKU_API_KEY",
  "HEROKU_APP_NAME",
  "BOT_MENU_LINK",
  "BOT_NAME",
  "PM_PERMIT",
  "PREFIX",
  "WARN_COUNT",
  "SESSION_ID",
];

// **Command to Display and Modify Variables**
adams(
  {
    nomCom: "getallvar",
    categorie: "Control",
  },
  async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
      return repondre(
        "🚫 *Access Denied!* This command is restricted to the bot owner."
      );
    }

    try {
      const configVars = readEnvFile();
      let numberedList = [];
      let index = 1;

      // Get keys that are not excluded
      const variableKeys = Object.keys(configMapping).filter(
        (key) => !EXCLUDED_VARS.includes(key)
      );

      variableKeys.forEach((key) => {
        let currentValue;

        if (key === "Auto Typing") {
          currentValue = configVars.PRESENCE === "2" ? "yes" : "no";
        } else if (key === "Always Online") {
          currentValue = configVars.PRESENCE === "1" ? "yes" : "no";
        } else if (key === "Auto Recording") {
          currentValue = configVars.PRESENCE === "3" ? "yes" : "no";
        } else {
          currentValue = configVars[key] === "yes" ? "yes" : "no";
        }

        let toggleOn = `Enable ${configMapping[key]}`;
        let toggleOff = `Disable ${configMapping[key]}\n♻️ Currently: ${currentValue}\n▱▱▱▱▱▱▱▰▰▰▰▰▰▰▰▰\n\n`;

        numberedList.push(`${index}. ${toggleOn}`);
        numberedList.push(`${index + 1}. ${toggleOff}`);
        index += 2;
      });

      // Split into two pages
      const chunkSize = Math.ceil(numberedList.length / 2);
      const pages = [
        numberedList.slice(0, chunkSize),
        numberedList.slice(chunkSize),
      ];

      const sendPage = async (pageIndex) => {
        if (pageIndex < 0 || pageIndex >= pages.length) return;

        const randomImage =
          Math.random() < 0.5
            ? "https://files.catbox.moe/c07f3s.jpeg"
            : "https://files.catbox.moe/c07f3s.jpeg";

        const message = `🌟 *BWM XMD VARS LIST* 🌟\n📌 Reply with a number to toggle a variable\n (Page ${
          pageIndex + 1
        }/${pages.length})\n\n${pages[pageIndex].join(
          "\n"
        )}\n\n📌 *Reply with a number to toggle a variable or navigate pages:*\n▶️ *${chunkSize * 2 + 1}* Next Page\n◀️ *${
          chunkSize * 2 + 2
        }* Previous Page`;

        const sentMessage = await zk.sendMessage(chatId, {
          image: { url: randomImage },
          caption: message,
          contextInfo: {
            mentionedJid: [],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363285388090068@newsletter",
              newsletterName: "BWM-XMD",
              serverMessageId: Math.floor(100000 + Math.random() * 900000),
            },
          },
        });

        // Listen for Reply
        zk.ev.on("messages.upsert", async (update) => {
          const message = update.messages[0];
          if (!message.message || !message.message.extendedTextMessage) return;

          const responseText = message.message.extendedTextMessage.text.trim();
          if (
            message.message.extendedTextMessage.contextInfo &&
            message.message.extendedTextMessage.contextInfo.stanzaId ===
              sentMessage.key.id
          ) {
            const selectedIndex = parseInt(responseText);
            if (
              isNaN(selectedIndex) ||
              (selectedIndex < 1 && selectedIndex > chunkSize * 2 + 2)
            ) {
              return repondre(
                "❌ *Invalid number. Please select a valid option.*"
              );
            }

            if (selectedIndex === chunkSize * 2 + 1) {
              return sendPage(pageIndex + 1);
            } else if (selectedIndex === chunkSize * 2 + 2) {
              return sendPage(pageIndex - 1);
            }

            const variableIndex = Math.floor((selectedIndex - 1) / 2);
            const selectedKey = variableKeys[variableIndex];

            let newValue = selectedIndex % 2 === 1 ? "yes" : "no";
            let presenceValue = "0";

            if (selectedKey === "Auto Typing") {
              presenceValue = newValue === "yes" ? "2" : "0";
            } else if (selectedKey === "Always Online") {
              presenceValue = newValue === "yes" ? "1" : "0";
            } else if (selectedKey === "Auto Recording") {
              presenceValue = newValue === "yes" ? "3" : "0";
            }

            const currentConfig = readEnvFile();
            
            if (
              selectedKey === "Auto Typing" ||
              selectedKey === "Always Online" ||
              selectedKey === "Auto Recording"
            ) {
              currentConfig.PRESENCE = presenceValue;
            } else {
              currentConfig[selectedKey] = newValue;
            }
            
            writeEnvFile(currentConfig);

            await zk.sendMessage(chatId, {
              text: `✅ *${configMapping[selectedKey]} is now set to ${newValue}*\n\n⚡ *Changes applied immediately!*`,
            });
          }
        });
      };

      sendPage(0);
    } catch (error) {
      console.error("Error handling variables:", error);
      await zk.sendMessage(chatId, {
        text: "⚠️ *Failed to handle environment variables!*",
      });
    }
  }
);

// Alias for getallvar
adams(
  {
    nomCom: "settings",
    categorie: "Control",
  },
  async (chatId, zk, context) => {
    // Simply call the getallvar function
    const { nomCom } = require("./getallvar");
    nomCom(chatId, zk, context);
  }
);

// Command to set or update environment variables
adams({
  nomCom: 'setvar',
  categorie: "Control"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;

  if (!superUser) {
    return repondre("🚫 *Access Denied!* This command is restricted to the bot owner.");
  }

  if (!arg[0] || !arg[0].includes('=')) {
    return repondre(
      "📋 *Usage Instructions:*\n\n" +
      "To set or update a variable:\n" +
      "`setvar VAR_NAME=value`\n\n" +
      "Example:\n" +
      "`setvar AUTO_REPLY=yes`\n" +
      "`setvar AUTO_REPLY=no`"
    );
  }

  const [varName, value] = arg[0].split('=');
  if (!varName || !value) {
    return repondre("⚠️ *Invalid format!* Use `VAR_NAME=value` format.");
  }

  try {
    const currentConfig = readEnvFile();
    currentConfig[varName] = value;
    writeEnvFile(currentConfig);

    await zk.sendMessage(chatId, {
      text: `✅ *${varName.replace(/_/g, " ")} updated successfully!*\n\n⚡ *Changes applied immediately!*`
    });
  } catch (error) {
    console.error("Error updating variable:", error);
    await zk.sendMessage(chatId, { text: "⚠️ *Failed to update environment variable!*" });
  }
});
