// ============================================================
// TEACHERS ACADEMY - COMPLETE APP WITH SUPABASE
// ============================================================

// Supabase Configuration
const SUPABASE_URL = 'https://qwkezbozpmcfmviddgmi.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_DwWXHm5MCStW8RKTY2o2Bj_lqi_jACS';

// Initialize Supabase
let supabaseClient;

try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    console.log('✅ Supabase initialized!');
} catch(e) {
    console.error('Supabase init error:', e);
}

// Test function
window.testSupabase = async function() {
    if (!supabaseClient) {
        console.error("Supabase not initialized!");
        return;
    }
    console.log("Testing Supabase...");
    try {
        const { data, error } = await supabaseClient
            .from('student_results')
            .insert([{
                name: "TEST_USER",
                father_name: "TEST",
                contact: "00000000000",
                class: "10th",
                section: "A",
                roll_no: 99,
                mcq_marks: 5,
                subjective_marks: 0,
                total_marks: 5,
                percentage: 50,
                status: "Pass",
                grade: "D",
                time_taken: "00:30"
            }]);
        if (error) console.error("❌ Error:", error);
        else console.log("✅ SUCCESS! Data saved to Supabase! Check your table!");
    } catch(err) {
        console.error("❌ Exception:", err);
    }
};

console.log("App loaded - Type testSupabase() to test");
