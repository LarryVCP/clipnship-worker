const { downloadVod } = require("../services/twitchDownloader");

async function resolveVodSource(videoId) {
    return await downloadVod(videoId);
}

module.exports = {
    resolveVodSource,
};