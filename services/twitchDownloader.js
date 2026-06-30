const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const cliPath = path.join(
    __dirname,
    "..",
    "bin",
    "TwitchDownloaderCLI.exe"
);

async function downloadVod(videoId) {
    const outputPath = path.join(
        __dirname,
        "..",
        "vods",
        `${videoId}.mp4`
    );

    if (fs.existsSync(outputPath)) {
        console.log(`VOD already exists: ${outputPath}`);
        return outputPath;
    }

    console.log(`Downloading VOD ${videoId}...`);

    return new Promise((resolve, reject) => {
        const process = spawn(cliPath, [
            "videodownload",
            "--id",
            videoId,
            "--output",
            outputPath,
        ]);

        process.stdout.on("data", (data) => {
            process.stdout.write(data);
        });

        process.stderr.on("data", (data) => {
            process.stderr.write(data);
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve(outputPath);
            } else {
                reject(new Error(`TwitchDownloader exited with code ${code}`));
            }
        });
    });
}

module.exports = {
    downloadVod,
};