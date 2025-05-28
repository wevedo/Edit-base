const { adams } = require("../Ibrahim/adams");
const axios = require("axios");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const path = require("path");
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBDNQxANWDVodCmT1ReuZwOJ4JQQr0fAIQ",
  authDomain: "bwmxmd-1a970.firebaseapp.com",
  projectId: "bwmxmd-1a970",
  storageBucket: "bwmxmd-1a970.appspot.com", // Changed from firebasestorage.app to appspot.com
  messagingSenderId: "139206447481",
  appId: "1:139206447481:web:ac33952baa493eed3e5fa8",
  measurementId: "G-Z32L9ZJ7JB"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Utility function to download media
async function downloadMedia(mediaMessage, mediaType) {
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    const buffer = await streamToBuffer(stream);

    // Convert all audio to MP3 before uploading
    const extension = mediaType === "audio" ? "mp3" : mediaMessage.mimetype.split("/")[1] || "bin";
    const filePath = path.join(__dirname, `temp_${Date.now()}.${extension}`);

    await fs.writeFile(filePath, buffer);
    return filePath;
}

// Convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

// Upload file to Firebase Storage
async function uploadToFirebase(filePath, mediaType) {
    if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
    }

    try {
        const fileBuffer = await fs.readFile(filePath);
        const fileName = path.basename(filePath);
        const storageRef = ref(storage, `uploads/${fileName}`);
        
        // Upload the file
        const snapshot = await uploadBytes(storageRef, fileBuffer, {
            contentType: mediaType === "audio" ? "audio/mpeg" : getMimeType(filePath)
        });
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (err) {
        throw new Error("Firebase Upload Error: " + err.message);
    }
}

// Helper function to get MIME type
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.mp4': return 'video/mp4';
        case '.mp3': return 'audio/mpeg';
        case '.pdf': return 'application/pdf';
        default: return 'application/octet-stream';
    }
}

// Command logic
adams({ nomCom: "url", categorie: "General", reaction: "🌐" }, async (origineMessage, zk, commandeOptions) => {
    const { msgRepondu, repondre } = commandeOptions;

    if (!msgRepondu) {
        repondre("📌 Reply to an image, video, audio, or document to get a URL.");
        return;
    }

    let mediaPath, mediaType;

    try {
        if (msgRepondu.videoMessage) {
            const videoSize = msgRepondu.videoMessage.fileLength;
            if (videoSize > 50 * 1024 * 1024) {
                repondre("🚨 The video is too large. Please send a smaller one.");
                return;
            }
            mediaPath = await downloadMedia(msgRepondu.videoMessage, "video");
            mediaType = "video";

        } else if (msgRepondu.imageMessage) {
            mediaPath = await downloadMedia(msgRepondu.imageMessage, "image");
            mediaType = "image";

        } else if (msgRepondu.audioMessage) {
            mediaPath = await downloadMedia(msgRepondu.audioMessage, "audio");
            mediaType = "audio";

        } else if (msgRepondu.documentMessage) {
            mediaPath = await downloadMedia(msgRepondu.documentMessage, "document");
            mediaType = "document";

        } else {
            repondre("⚠ Unsupported media type. Reply with an image, video, audio, or document.");
            return;
        }

        // Upload and get URL
        const firebaseUrl = await uploadToFirebase(mediaPath, mediaType);
        fs.unlinkSync(mediaPath); // Cleanup after upload

        // Reply with the correct type
        switch (mediaType) {
            case "image":
                repondre(`🖼️ Image URL:\n${firebaseUrl}`);
                break;
            case "video":
                repondre(`🎥 Video URL:\n${firebaseUrl}`);
                break;
            case "audio":
                repondre(`🔊 Audio URL (MP3):\n${firebaseUrl}`);
                break;
            case "document":
                repondre(`📄 Document URL:\n${firebaseUrl}`);
                break;
            default:
                repondre(`✅ File URL:\n${firebaseUrl}`);
                break;
        }
    } catch (error) {
        console.error("Error in url command:", error);
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }
        repondre("❌ Error processing media. Please try again.");
    }
});
