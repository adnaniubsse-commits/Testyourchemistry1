// ============================================================
// TEACHERS ACADEMY - COMPLETE APP WITH SUPABASE
// ============================================================

console.log("App loading...");

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

// Test function for Supabase
window.testSupabase = async function() {
    if (!supabaseClient) {
        console.error("Supabase not ready!");
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
        else console.log("✅ SUCCESS! Data saved!");
    } catch(err) {
        console.error("❌ Exception:", err);
    }
};

// Save to Supabase function
async function saveToSupabase(studentData, testResult) {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
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

// --- State Management ---
const state = {
    chapters: [],
    currentChapter: null,
    currentQuestionIndex: 0,
    answers: {},
    user: null,
    role: null,
    timerInterval: null,
    timeElapsed: 0,
    isReviewMode: false,
    questionTimerInterval: null,
    questionTimerValue: 15,
    attempts: JSON.parse(localStorage.getItem('ta_attempts')) || {},
    results: JSON.parse(localStorage.getItem('ta_results')) || [],
    students: JSON.parse(localStorage.getItem('ta_students')) || {}
};

// --- Dummy Data ---
const DUMMY_DATA = {
    students: {},
    results: []
};

// --- DOM Elements ---
const sections = document.querySelectorAll('section');
const landingScreen = document.getElementById('landing-screen');
const roleSelection = document.getElementById('role-selection');
const studentRegistration = document.getElementById('student-registration');
const teacherLogin = document.getElementById('teacher-login');
const teacherPanel = document.getElementById('teacher-panel');
const chapterSelection = document.getElementById('chapter-selection');
const testInterface = document.getElementById('test-interface');
const resultScreen = document.getElementById('result-screen');

// --- Initialization ---
function init() {
    try {
        if (typeof MCQ_DATA !== 'undefined') {
            state.chapters = MCQ_DATA.chapters;
        } else {
            console.error("MCQ_DATA not found!");
            state.chapters = [{
                id: 1,
                title: "Chemistry Test May-2026",
                questions: [
                    { id: 1, question: "What is the chemical symbol for Gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2 },
                    { id: 2, question: "What is the atomic number of Carbon?", options: ["4", "5", "6", "7"], answer: 2 },
                    { id: 3, question: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Argon", "Nitrogen"], answer: 3 },
                    { id: 4, question: "What is the pH of pure water?", options: ["5", "6", "7", "8"], answer: 2 },
                    { id: 5, question: "Which element is liquid at room temperature?", options: ["Mercury", "Bromine", "Both", "None"], answer: 2 },
                    { id: 6, question: "What is the formula for water?", options: ["CO2", "O2", "H2O", "NaCl"], answer: 2 },
                    { id: 7, question: "Which acid is found in citrus fruits?", options: ["Citric acid", "Acetic acid", "Sulfuric acid", "Hydrochloric acid"], answer: 0 },
                    { id: 8, question: "What is the hardest natural substance?", options: ["Iron", "Diamond", "Gold", "Platinum"], answer: 1 }
                ]
            }];
        }
        
        setTimeout(() => {
            const loader = document.querySelector('.loader');
            const startBtn = document.getElementById('start-btn');
            if (loader) loader.style.display = 'none';
            if (startBtn) startBtn.style.display = 'block';
        }, 500);
    } catch (error) { 
        console.error(error); 
        const loader = document.querySelector('.loader');
        const startBtn = document.getElementById('start-btn');
        if (loader) loader.style.display = 'none';
        if (startBtn) startBtn.style.display = 'block';
    }
}

// --- Navigation ---
function showSection(id) {
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
}

// --- Event Listeners ---
document.getElementById('start-btn').addEventListener('click', () => showSection('role-selection'));

document.querySelectorAll('.btn-role').forEach(btn => {
    btn.addEventListener('click', (e) => {
        state.role = e.currentTarget.dataset.role;
        showSection(state.role === 'teacher' ? 'teacher-login' : 'student-registration');
    });
});

document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        const curr = document.querySelector('section.active').id;
        if (['teacher-panel', 'teacher-login', 'student-registration'].includes(curr)) showSection('role-selection');
        else if (curr === 'chapter-selection') showSection('role-selection');
    });
});

// --- Teacher Login ---
document.getElementById('login-btn').addEventListener('click', () => {
    const pass = document.getElementById('teacher-pass').value;
    if (pass === '2247') { 
        renderTeacherPanel(); 
        showSection('teacher-panel'); 
    }
    else alert("Incorrect Password!");
});

// --- Simple Teacher Panel Render ---
function renderTeacherPanel() {
    const tbody = document.querySelector('#students-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="12" style="text-align:center;">Student data will appear here after tests are taken</td></tr>';
}

// --- Student Registration ---
document.getElementById('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const father = document.getElementById('father-name').value;
    const contact = document.getElementById('student-contact').value;
    const city = document.getElementById('student-city').value;
    const school = document.getElementById('school-name').value;
    
    const newUser = { name, fatherName: father, contact, city, school, class: "10th", section: "A", rollNo: "1" };
    state.user = newUser;
    
    if (!state.students[contact]) state.students[contact] = [];
    state.students[contact].push(newUser);
    localStorage.setItem('ta_students', JSON.stringify(state.students));
    
    document.getElementById('display-user-name').textContent = `Welcome, ${name}`;
    renderChapters();
    showSection('chapter-selection');
});

// --- Render Chapters ---
function renderChapters() {
    const list = document.getElementById('chapter-list');
    if (!list) return;
    list.innerHTML = '';
    state.chapters.forEach(c => {
        const btn = document.createElement('div');
        btn.className = 'chapter-btn';
        btn.innerHTML = `<div><strong>${c.title}</strong><br><small>MCQ Test</small></div>`;
        btn.onclick = () => startTest(c.id);
        list.appendChild(btn);
    });
}

// --- Start Test ---
function startTest(id) {
    const ch = state.chapters.find(c => c.id === id);
    if (!ch) return;
    
    state.currentChapter = { ...ch, questions: [...ch.questions].sort(() => 0.5 - Math.random()).slice(0, 8) };
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.isReviewMode = false;
    state.timeElapsed = 0;
    
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => state.timeElapsed++, 1000);
    
    showSection('test-interface');
    renderQuestion(true);
}

// --- Render Question ---
function renderQuestion(isNew) {
    const q = state.currentChapter.questions[state.currentQuestionIndex];
    if (!q) return;
    
    document.getElementById('current-chapter-title').textContent = state.currentChapter.title;
    document.getElementById('question-counter').textContent = `Question ${state.currentQuestionIndex + 1}/8`;
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('progress-fill').style.width = `${((state.currentQuestionIndex + 1) / 8) * 100}%`;
    
    const container = document.getElementById('options-container');
    if (!container) return;
    container.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (state.answers[q.id] === idx) btn.classList.add('selected');
        btn.textContent = opt;
        btn.onclick = () => selectOption(q.id, idx);
        container.appendChild(btn);
    });
    
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-test-btn');
    if (nextBtn) nextBtn.style.display = (state.currentQuestionIndex < 7) ? 'block' : 'none';
    if (submitBtn) submitBtn.style.display = (state.currentQuestionIndex === 7 && !state.isReviewMode) ? 'block' : 'none';
    
    if (isNew && !state.isReviewMode) startQuestionTimer();
}

// --- Select Option ---
function selectOption(qId, idx) {
    if (state.isReviewMode) return;
    state.answers[qId] = idx;
    renderQuestion(false);
    
    setTimeout(() => {
        if (state.currentQuestionIndex < 7) {
            state.currentQuestionIndex++;
            renderQuestion(true);
        } else {
            submitTest();
        }
    }, 300);
}

// --- Start Question Timer ---
function startQuestionTimer() {
    if (state.questionTimerInterval) clearInterval(state.questionTimerInterval);
    state.questionTimerValue = 15;
    state.questionTimerInterval = setInterval(() => {
        state.questionTimerValue--;
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = `00:${state.questionTimerValue.toString().padStart(2, '0')}`;
        if (state.questionTimerValue <= 0) {
            clearInterval(state.questionTimerInterval);
            if (state.currentQuestionIndex < 7) {
                state.currentQuestionIndex++;
                renderQuestion(true);
            } else {
                submitTest();
            }
        }
    }, 1000);
}

// --- Submit Test ---
function submitTest() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    if (state.questionTimerInterval) clearInterval(state.questionTimerInterval);
    
    let correct = 0;
    state.currentChapter.questions.forEach(q => {
        if (state.answers[q.id] === q.answer) correct++;
    });
    
    const res = {
        marks: correct,
        score: Math.round((correct / 8) * 100),
        timeTaken: `${Math.floor(state.timeElapsed / 60).toString().padStart(2, '0')}:${(state.timeElapsed % 60).toString().padStart(2, '0')}`,
        timeElapsed: state.timeElapsed
    };
    
    // Save to localStorage
    state.results.push({
        contact: state.user.contact,
        name: state.user.name,
        chapterId: state.currentChapter.id,
        marks: correct,
        timeTaken: res.timeTaken,
        date: new Date().toISOString()
    });
    localStorage.setItem('ta_results', JSON.stringify(state.results));
    
    // Save to Supabase
    saveToSupabase(state.user, res);
    
    document.getElementById('result-percentage').textContent = `${correct}/8`;
    document.getElementById('result-time').textContent = res.timeTaken;
    document.getElementById('result-rank').textContent = `#1`;
    document.getElementById('result-status').textContent = correct >= 4 ? "Pass" : "Fail";
    
    showSection('result-screen');
}

// --- Event Listeners for Test ---
document.getElementById('next-btn').addEventListener('click', () => {
    if (state.currentQuestionIndex < 7) {
        state.currentQuestionIndex++;
        renderQuestion(true);
    }
});

document.getElementById('submit-test-btn').addEventListener('click', submitTest);
document.getElementById('back-to-chapters').addEventListener('click', () => {
    renderChapters();
    showSection('chapter-selection');
});
document.getElementById('review-test-btn').addEventListener('click', () => {
    state.isReviewMode = true;
    state.currentQuestionIndex = 0;
    renderQuestion(false);
    showSection('test-interface');
});
document.getElementById('logout-student').addEventListener('click', () => {
    state.user = null;
    showSection('student-registration');
});

// --- Helper Functions ---
function updateSections(classVal, id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="" disabled selected>Select Section</option>';
    let list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    if (classVal === '9th') list.push('S');
    else if (classVal === '10th') list.push('J');
    list.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        el.appendChild(opt);
    });
}

document.getElementById('student-class')?.addEventListener('change', (e) => updateSections(e.target.value, 'student-section'));
document.getElementById('filter-class')?.addEventListener('change', (e) => updateSections(e.target.value, 'filter-section'));
document.getElementById('school-name')?.addEventListener('change', (e) => {
    const extraFields = document.getElementById('extra-fields');
    if (extraFields) extraFields.style.display = e.target.value === 'GHSS ABBASIA' ? 'block' : 'none';
});

// --- Start the App ---
init();
