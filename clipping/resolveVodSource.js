const path = require("path");
const fs = require("fs");

function resolveVodSource(videoId) {
    const vodPath = path.join(__dirname, "..", "vods", `${videoId}.mp4`);

    if (!fs.existsSync(vodPath)) {
        throw new Error(`Missing VOD file: ${vodPath}`);
    }

    return vodPath;
}

module.exports = { resolveVodSource };