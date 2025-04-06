
const BOT_INFO = {
    name: process.env.BOT_NAME || "BWM-XMD",
    version: "7.0.8",
    mode: process.env.NODE_ENV === "production" ? "Production" : "Development"
};

module.exports = {
    BOT_INFO
};
