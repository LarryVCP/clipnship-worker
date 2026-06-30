require("dotenv").config();

const { claimNextJob } = require("./jobs/claimNextJob");
const { loadJobMarkers } = require("./jobs/loadJobMarkers");
const { updateJobStatus } = require("./jobs/updateJobStatus");
const { resolveVodSource } = require("./clipping/resolveVodSource");
const { createClips } = require("./clipping/createClips");

const pollInterval = Number(process.env.WORKER_POLL_INTERVAL_MS || 5000);

async function processOneJob() {
    const job = await claimNextJob();

    if (!job) {
        console.log("No queued jobs.");
        return;
    }

    console.log(`Claimed job #${job.id}`);

    try {
        const markers = await loadJobMarkers(job.id);
        console.log(`Loaded ${markers.length} marker(s).`);

        const vodPath = resolveVodSource(job.video_id);

        const result = await createClips({
            job,
            markers,
            vodPath,
        });

        await updateJobStatus(job.id, "complete", {
            marker_count: result.clipCount,
        });

        console.log(`Job #${job.id} complete.`);
    } catch (error) {
        console.error(`Job #${job.id} failed:`, error.message);

        await updateJobStatus(job.id, "failed");
    }
}

async function main() {
    const runOnce = process.argv.includes("--once");

    console.log("ClipNShip worker started.");

    if (runOnce) {
        console.log("Run once mode enabled.");
        await processOneJob();
        console.log("Worker finished.");
        return;
    }

    console.log(`Polling every ${pollInterval}ms.`);

    await processOneJob();

    setInterval(() => {
        processOneJob().catch((error) => {
            console.error("Worker loop error:", error.message);
        });
    }, pollInterval);
}

main().catch((error) => {
    console.error("Fatal worker error:", error.message);
});