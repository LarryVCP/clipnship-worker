const { supabase } = require("../supabaseClient");

async function claimNextJob() {
    const { data: jobs, error } = await supabase
        .from("clipnship_jobs")
        .select("*")
        .eq("status", "queued")
        .order("created_at", { ascending: true })
        .limit(1);

    if (error) {
        throw error;
    }

    const job = jobs?.[0];

    if (!job) {
        return null;
    }

    const { data: updatedJob, error: updateError } = await supabase
        .from("clipnship_jobs")
        .update({
            status: "processing",
            updated_at: new Date().toISOString(),
        })
        .eq("id", job.id)
        .eq("status", "queued")
        .select()
        .single();

    if (updateError) {
        throw updateError;
    }

    return updatedJob;
}

module.exports = { claimNextJob };