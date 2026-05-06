// ============================================================
// TEACHERS ACADEMY - COMPLETE APP WITH SUPABASE
// ============================================================

// Supabase Configuration
const SUPABASE_URL = 'https://qwkezbozpmcfmviddgmi.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_DwWXHm5MCStW8RKTY2o2Bj_lqi_jACS';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
console.log('✅ Supabase initialized!');

// Test function - run this to verify Supabase works
window.testSupabase = async function() {
    console.log("Testing Supabase...");
    try {
        const { data, error } = await supabase
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
        else console.log("✅ SUCCESS! Data saved to Supabase!");
    } catch(err) {
        console.error("❌ Exception:", err);
    }
};

// Save to Supabase
async function saveToSupabase(studentData, testResult) {
    try {
        const { data, error } = await supabase
            .from('student_results')
            .insert([{
                name: studentData.name,
                father_name: studentData.fatherName,
                contact: studentData.contact,
                class: studentData.class || "10th",
                section: studentData.section || "A",
                roll_no: parseInt(studentData.rollNo) || 0,
                mcq_marks: testResult.marks,
                subjective_marks: 0,
                total_marks: testResult.marks,
                percentage: Math.round((testResult.marks / 8) * 100),
                status: testResult.marks >= 4 ? "Pass" : "Fail",
                grade: testResult.marks >= 4 ? "Pass" : "Fail",
                time_taken: testResult.timeTaken
            }]);
        if (error) console.error("❌ Supabase error:", error);
        else console.log("✅ Saved to Supabase!");
    } catch(err) {
        console.error("❌ Save error:", err);
    }
}

console.log("App loaded - Supabase ready!");
