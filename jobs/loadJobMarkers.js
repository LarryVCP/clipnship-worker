const { supabase } = require("../supabaseClient");

async function loadJobMarkers(jobId) {
    const { data, error } = await supabase
        .from("clipnship_job_markers")
        .select("*")
        .eq("job_id", jobId)
        .order("position_seconds", { ascending: true });

    if (error) {
        throw error;
    }

    return data || [];
}

module.exports = { loadJobMarkers };