const { supabase } = require("../supabaseClient");

async function updateJobStatus(jobId, status, extraFields = {}) {
    const { data, error } = await supabase
        .from("clipnship_jobs")
        .update({
            status,
            updated_at: new Date().toISOString(),
            ...extraFields,
        })
        .eq("id", jobId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

module.exports = { updateJobStatus };