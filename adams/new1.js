/*const { adams } = require("../Ibrahim/adams");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to your config.env file
const envPath = path.join(__dirname, '/../config.env');

// Initialize environment variables
dotenv.config({ path: envPath });

// Function to reload environment variables
function reloadEnv() {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

// Function to update .env file and reload
function updateEnv(key, value) {
  try {
    // Read current .env file
    let envContents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    let lines = envContents.split('\n');
    let updated = false;
    
    // Update existing variable
    lines = lines.map(line => {
      if (line.startsWith(key + '=')) {
        updated = true;
        return `${key}=${value}`;
      }
      return line;
    });
    
    // Add new variable if not found
    if (!updated) {
      lines.push(`${key}=${value}`);
    }
    
    // Filter out empty lines
    lines = lines.filter(line => line.trim() !== '');
    
    // Write back to file
    fs.writeFileSync(envPath, lines.join('\n'));
    
    // Reload environment variables
    reloadEnv();
    return true;
  } catch (error) {
    console.error('UpdateEnv error:', error);
    return false;
  }
}

// **Mapping of Environment Variables to User-Friendly Names**
const configMapping = {
  AUDIO_BOT: "Audio Bot",
  AUTO_BIO: "Auto Bio",
  AUTO_REACT: "Auto React",
  AUTO_READ: "Auto Read",
  CHATBOT: "Chatbot",
  PUBLIC_MODE: "Public Mode",
  STARTING_MSG: "Starting Message",
  PRESENCE: "Presence Mode",
  ANTIDELETE: "Anti Delete",
  GOODBYE_MSG: "Goodbye Message",
  REJECT_CALLS: "Reject Calls",
  WELCOME_MSG: "Welcome Message",
  GROUP_LINK: "Group Link Protection",
  AUTO_REPLY: "Auto Reply"
};

// **Excluded Variables**
const EXCLUDED_VARS = [
  "DATABASE_URL",
  "OWNER_NUMBER",
  "BOT_NAME",
  "PREFIX",
  "SESSION_ID"
];

// **Main Command to Display and Modify Variables**
adams(
  {
    nomCom: "getallvar",
    categorie: "Control",
  },
  async (chatId, zk, context) => {
    const { repondre, superUser } = context;

    if (!superUser) {
      return repondre("🚫 *Access Denied!* Owner only command.");
    }

    try {
      // Read current variables
      reloadEnv(); // Refresh env variables first
      const currentVars = process.env;
      let options = [];
      let index = 1;

      // Generate toggle options
      for (const [key, name] of Object.entries(configMapping)) {
        if (EXCLUDED_VARS.includes(key)) continue;
        
        const currentValue = currentVars[key] || 'no';
        const isEnabled = currentValue === 'yes' || currentValue === 'true';
        
        options.push({
          number: index++,
          name: name,
          key: key,
          current: isEnabled ? '✅ Enabled' : '❌ Disabled'
        });
      }

      // Format message with pagination
      const pageSize = 10;
      const totalPages = Math.ceil(options.length / pageSize);
      
      const sendPage = async (page = 1) => {
        const startIdx = (page - 1) * pageSize;
        const pageOptions = options.slice(startIdx, startIdx + pageSize);
        
        let message = `⚙️ *Bot Settings Control Panel* ⚙️\n\n`;
        message += `📋 *Current Settings:*\n`;
        
        pageOptions.forEach(opt => {
          message += `\n${opt.number}. ${opt.name} - ${opt.current}`;
        });
        
        message += `\n\n📌 *Reply with number to toggle*\n`;
        message += `📄 Page ${page}/${totalPages}`;
        
        if (page < totalPages) message += `\n▶️ *${options.length + 1}* Next Page`;
        if (page > 1) message += `\n◀️ *${options.length + 2}* Previous Page`;
        
        const sentMsg = await zk.sendMessage(chatId, { 
          text: message,
          footer: "Instant changes - No restart needed"
        });

        // Handle user response
        const responseHandler = async (m) => {
          if (!m.message?.extendedTextMessage?.contextInfo?.stanzaId) return;
          if (m.key.remoteJid !== chatId) return;
          if (m.message.extendedTextMessage.contextInfo.stanzaId !== sentMsg.key.id) return;
          
          const choice = m.message.extendedTextMessage.text.trim();
          const choiceNum = parseInt(choice);
          
          // Handle pagination
          if (choiceNum === options.length + 1 && page < totalPages) {
            zk.ev.off('messages.upsert', responseHandler);
            return sendPage(page + 1);
          }
          if (choiceNum === options.length + 2 && page > 1) {
            zk.ev.off('messages.upsert', responseHandler);
            return sendPage(page - 1);
          }
          
          // Handle setting toggle
          const selectedOpt = pageOptions.find(o => o.number === choiceNum);
          if (selectedOpt) {
            zk.ev.off('messages.upsert', responseHandler);
            
            const currentValue = currentVars[selectedOpt.key] || 'no';
            const newValue = currentValue === 'yes' ? 'no' : 'yes';
            
            const success = updateEnv(selectedOpt.key, newValue);
            
            if (success) {
              await zk.sendMessage(chatId, {
                text: `⚡ *${selectedOpt.name}* set to *${newValue === 'yes' ? 'ENABLED' : 'DISABLED'}*`
              });
            } else {
              await zk.sendMessage(chatId, {
                text: `❌ Failed to update ${selectedOpt.name}`
              });
            }
          }
        };
        
        zk.ev.on('messages.upsert', responseHandler);
      };
      
      await sendPage();
    } catch (error) {
      console.error('Settings error:', error);
      repondre('❌ Error accessing settings');
    }
  }
);

// Improved setvar command
adams(
  {
    nomCom: "setvar",
    categorie: "Control",
    description: "Set environment variables directly"
  },
  async (chatId, zk, context) => {
    const { repondre, arg, superUser } = context;
    
    if (!superUser) return repondre("🚫 Owner only command");
    
    if (!arg || arg.length < 1 || !arg[0].includes('=')) {
      return repondre(
        "📝 *Usage:*\n" +
        "```setvar VARIABLE=value```\n" +
        "Examples:\n" +
        "```setvar PREFIX=!```\n" +
        "```setvar AUTO_REPLY=yes```\n" +
        "```setvar BOT_NAME=MyBot```"
      );
    }
    
    const input = arg.join(' ');
    const equalsIndex = input.indexOf('=');
    
    if (equalsIndex === -1 || equalsIndex === 0 || equalsIndex === input.length - 1) {
      return repondre("❌ Invalid format. Use VARIABLE=value");
    }
    
    const varName = input.substring(0, equalsIndex).trim();
    const value = input.substring(equalsIndex + 1).trim();
    
    try {
      const success = updateEnv(varName, value);
      
      if (success) {
        repondre(`✅ *${varName}* set to:\n\`\`\`${value}\`\`\``);
      } else {
        repondre(`❌ Failed to update *${varName}*`);
      }
    } catch (error) {
      console.error('Setvar error:', error);
      repondre('❌ Error updating variable');
    }
  }
);
*/
