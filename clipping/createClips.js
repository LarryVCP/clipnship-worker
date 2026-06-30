const { supabase } = require("../supabaseClient");


const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

function runFfmpeg({ vodPath, outputPath, start, duration }) {
    return new Promise((resolve, reject) => {
        ffmpeg(vodPath)
            .setStartTime(start)
            .duration(duration)
            .output(outputPath)
            .videoCodec("copy")
            .audioCodec("copy")
            .on("end", resolve)
            .on("error", reject)
            .run();
    });
}

async function createClips({ job, markers, vodPath }) {
    const outputDir = path.join(__dirname, "..", "output", `job-${job.id}`);
    fs.mkdirSync(outputDir, { recursive: true });

    const createdClips = [];

    for (let i = 0; i < markers.length; i++) {
        const marker = markers[i];

        const clipStart = Math.max(0, marker.position_seconds - job.seconds_before);
        const clipDuration = job.seconds_before + job.seconds_after;

        const outputPath = path.join(
            outputDir,
            `job-${job.id}-marker-${i + 1}-${marker.position_seconds}s.mp4`
        );

        console.log(
            `Creating clip ${i + 1}/${markers.length}: start=${clipStart}s duration=${clipDuration}s`
        );

       

        await runFfmpeg({
            vodPath,
            outputPath,
            start: clipStart,
            duration: clipDuration,
        });
        const fileName = path.basename(outputPath);

        const { error } = await supabase.from("clipnship_clips").insert({
            job_id: job.id,
            twitch_marker_id: marker.twitch_marker_id,
            file_name: fileName,
            file_path: outputPath,
            clip_start: clipStart,
            clip_duration: clipDuration,
            status: "complete",
        });

        if (error) {
            throw error;
        }

        createdClips.push({
            markerId: marker.id,
            outputPath,
            start: clipStart,
            duration: clipDuration,
        });
    }

    return {
        outputDir,
        clipCount: createdClips.length,
        clips: createdClips,
    };
}

module.exports = { createClips };