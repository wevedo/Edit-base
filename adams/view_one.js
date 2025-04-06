/*const { adams } = require("../Ibrahim/adams");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const conf = require(__dirname + "/../config");

adams({ nomCom: "vv2", categorie: "General", reaction: "♻️" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) return repondre("Reply to a media message");

    const NUMERO_OWNER = conf.NUMERO_OWNER ? conf.NUMERO_OWNER.trim() + "@s.whatsapp.net" : null;
    if (!NUMERO_OWNER) return repondre("Owner number is not configured!");

    try {
        const mediaInfo = extractAnyMedia(msgRepondu);
        if (!mediaInfo) return repondre("View once not found");

        // Use Baileys' official download method
        const stream = await downloadContentFromMessage(mediaInfo.data, mediaInfo.type);
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const caption = mediaInfo.data.caption || "*Forwarded by bwm xmd nexus ✅*";

        switch (mediaInfo.type) {
            case 'image':
                await zk.sendMessage(NUMERO_OWNER, { image: buffer, caption }, { quoted: ms });
                break;
            case 'video':
                await zk.sendMessage(NUMERO_OWNER, { video: buffer, caption }, { quoted: ms });
                break;
            case 'audio':
                await zk.sendMessage(NUMERO_OWNER, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: ms });
                break;
        }

    } catch (error) {
        console.error("Error:", error);
    }
});

// Updated media detector with type mapping
function extractAnyMedia(msg) {
    const mediaPaths = [
        { path: 'message.imageMessage', type: 'image' },
        { path: 'message.videoMessage', type: 'video' },
        { path: 'message.audioMessage', type: 'audio' },
        { path: 'message.viewOnceMessage.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessage.message.videoMessage', type: 'video' },
        { path: 'message.viewOnceMessageV2.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessageV2.message.videoMessage', type: 'video' },
        { path: 'message.ephemeralMessage.message.imageMessage', type: 'image' },
        { path: 'message.ephemeralMessage.message.videoMessage', type: 'video' },
        { path: 'message.extendedTextMessage.contextInfo.quotedMessage.imageMessage', type: 'image' },
        { path: 'message.extendedTextMessage.contextInfo.quotedMessage.videoMessage', type: 'video' },
        { path: 'message.viewOnceMessageV3.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessageV3.message.videoMessage', type: 'video' },
        { path: 'imageMessage', type: 'image' },
        { path: 'videoMessage', type: 'video' },
        { path: 'viewOnceMessage.imageMessage', type: 'image' },
        { path: 'message.mediaMessage.imageMessage', type: 'image' },
        { path: 'message.mediaMessage.videoMessage', type: 'video' },
        { path: 'message.protocolMessage.message.imageMessage', type: 'image' },
        { path: 'message.protocolMessage.message.videoMessage', type: 'video' },
    ];

    for (const { path, type } of mediaPaths) {
        const parts = path.split('.');
        let result = msg;
        for (const part of parts) {
            result = result?.[part];
            if (!result) break;
        }
        if (result) return { data: result, type };
    }
    return null;
}


adams({ nomCom: "vv", categorie: "General", reaction: "♻️" }, async (dest, zk, commandeOptions) => {
    const { ms, msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) return repondre("Reply to a media message");

    try {
        const mediaInfo = extractAnyMedia(msgRepondu);
        if (!mediaInfo) return repondre("View once not found");

        // Use Baileys' official download method
        const stream = await downloadContentFromMessage(mediaInfo.data, mediaInfo.type);
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const caption = mediaInfo.data.caption || "";

        switch(mediaInfo.type) {
            case 'image':
                await zk.sendMessage(dest, { image: buffer, caption }, { quoted: ms });
                break;
            case 'video':
                await zk.sendMessage(dest, { video: buffer, caption }, { quoted: ms });
                break;
            case 'audio':
                await zk.sendMessage(dest, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: ms });
                break;
            default:
                return repondre("Unsupported media type");
        }

        repondre("*Antiview_once online by bwm xmd ✅!*");

    } catch (error) {
        console.error("Error:", error);
        repondre("Error: " + error.message);
    }
});

// Updated media detector with type mapping
function extractAnyMedia(msg) {
    const mediaPaths = [
        // Standard media paths
        { path: 'message.imageMessage', type: 'image' },
        { path: 'message.videoMessage', type: 'video' },
        { path: 'message.audioMessage', type: 'audio' },
        
        // ViewOnce variations
        { path: 'message.viewOnceMessage.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessage.message.videoMessage', type: 'video' },
        { path: 'message.viewOnceMessageV2.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessageV2.message.videoMessage', type: 'video' },
        
        // Ephemeral (disappearing) messages
        { path: 'message.ephemeralMessage.message.imageMessage', type: 'image' },
        { path: 'message.ephemeralMessage.message.videoMessage', type: 'video' },
        { path: 'message.ephemeralMessage.message.viewOnceMessage.message.imageMessage', type: 'image' },
        
        // Quoted messages
        { path: 'message.extendedTextMessage.contextInfo.quotedMessage.imageMessage', type: 'image' },
        { path: 'message.extendedTextMessage.contextInfo.quotedMessage.videoMessage', type: 'video' },
        { path: 'message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage.message.imageMessage', type: 'image' },
        
        // Story replies and forwardings
        { path: 'message.viewOnceMessageV3.message.imageMessage', type: 'image' },
        { path: 'message.viewOnceMessageV3.message.videoMessage', type: 'video' },
        
        // Legacy paths
        { path: 'imageMessage', type: 'image' },
        { path: 'videoMessage', type: 'video' },
        { path: 'viewOnceMessage.imageMessage', type: 'image' },
        
        // Server-side encrypted media
        { path: 'message.mediaMessage.imageMessage', type: 'image' },
        { path: 'message.mediaMessage.videoMessage', type: 'video' },
        
        // Group message variations
        { path: 'message.protocolMessage.message.imageMessage', type: 'image' },
        { path: 'message.protocolMessage.message.videoMessage', type: 'video' },
    ];

    for (const { path, type } of mediaPaths) {
        const parts = path.split('.');
        let result = msg;
        for (const part of parts) {
            result = result?.[part];
            if (!result) break;
        }
        if (result) return { data: result, type };
    }
    return null;
}
*/
