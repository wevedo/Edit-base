const { adams } = require("../Ibrahim/adams");

adams({ nomCom: "cmds", categorie: "General" }, async (dest, zk, commandeOptions) => {
    const { ms, repondre, nomAuteurMessage, mybotpic } = commandeOptions;
    const { cm } = require("../Ibrahim/adams");
    
    // Get current time
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = new Date().toLocaleDateString();
    
    // Basic menu message
    const message = `
*Hey ${nomAuteurMessage}*

*BWM-XMD Command Menu*

📅 Date: ${date}
⏰ Time: ${time}

_Total commands: ${cm.length}_

© Ibrahim Adams
`;

    try {
        // Try to send as image if available
        const pic = mybotpic();
        if (pic.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, { 
                image: { url: pic }, 
                caption: message 
            }, { quoted: ms });
        } else {
            // Fallback to text message
            await repondre(message);
        }
    } catch (e) {
        console.error("Command menu error:", e);
        await repondre("An error occurred while showing commands");
    }
});