/**
 * Teachers Academy Bahawalpur - MCQ Practice App
 * Core Application Logic WITH Supabase Cloud Integration
 */

// ============================================================
// SUPABASE CONFIGURATION (ADDED)
// ============================================================
const SUPABASE_URL = 'https://qwkezbozpmcfmviddgmi.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_DwWXHm5MCStW8RKTY2o2Bj_lqi_jACS';

// Initialize Supabase
let supabaseClient = null;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    console.log('✅ Supabase initialized!');
} catch(e) {
    console.error('Supabase init error:', e);
}

// Save to Supabase (NEW FUNCTION - does not affect existing code)
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
        else console.log("✅ SUCCESS! Data saved to Supabase!");
    } catch(err) {
        console.error("❌ Exception:", err);
    }
};

// ============================================================
// YOUR ORIGINAL CODE BELOW - UNCHANGED
// ============================================================

// --- State Management ---
const state = {
    chapters: [],
    currentChapter: null,
    currentQuestionIndex: 0,
    answers: {}, // {questionId: selectedOptionIndex}
    user: null, // {name, fatherName, contact, city, school, class, section, rollNo}
    role: null, // 'student' | 'teacher'
    timerInterval: null,
    timeElapsed: 0,
    isReviewMode: false,
    questionTimerInterval: null,
    questionTimerValue: 15,
    attempts: JSON.parse(localStorage.getItem('ta_attempts')) || {}, // {contact: {chapterId: count}}
    results: JSON.parse(localStorage.getItem('ta_results')) || [], // [{contact, name, chapterId, score, marks, timeTaken, timeElapsed, date, subjective}]
    students: JSON.parse(localStorage.getItem('ta_students')) || {} // {contact: [studentData]}
};

// --- Expanded Dummy Data (10 Students) ---
const DUMMY_DATA = {
    students: {
        "03001111111": [{ name: "Ahmed Raza", fatherName: "M. Raza", contact: "03001111111", city: "BWP", school: "GHSS ABBASIA", class: "10th", section: "A", rollNo: "1" }],
        "03012222222": [{ name: "Ali Hamza", fatherName: "A. Hamza", contact: "03012222222", city: "BWP", school: "GHSS ABBASIA", class: "10th", section: "A", rollNo: "5" }],
        "03023333333": [{ name: "Bilal Khan", fatherName: "S. Khan", contact: "03023333333", city: "BWP", school: "GHSS ABBASIA", class: "10th", section: "A", rollNo: "12" }],
        "03034444444": [{ name: "Daniyal Ali", fatherName: "Ali Hassan", contact: "03034444444", city: "BWP", school: "GHSS ABBASIA", class: "10th", section: "A", rollNo: "25" }],
        "03045555555": [{ name: "Ehsan Elahi", fatherName: "M. Elahi", contact: "03045555555", city: "BWP", school: "GHSS ABBASIA", class: "9th", section: "B", rollNo: "3" }],
        "03056666666": [{ name: "Fahad Mustafa", fatherName: "M. Mustafa", contact: "03056666666", city: "BWP", school: "GHSS ABBASIA", class: "9th", section: "B", rollNo: "18" }],
        "03067777777": [{ name: "Ghulam Nabi", fatherName: "N. Nabi", contact: "03067777777", city: "BWP", school: "GHSS ABBASIA", class: "9th", section: "B", rollNo: "45" }],
        "03078888888": [{ name: "Hamza Malik", fatherName: "S. Malik", contact: "03078888888", city: "BWP", school: "GHSS ABBASIA", class: "10th", section: "J", rollNo: "7" }],
        "03089999999": [{ name: "Irfan Pathan", fatherName: "K. Pathan", contact: "03089999999", city: "BWP", school: "GHSS ABBASIA", class: "9th", section: "S", rollNo: "10" }],
        "03090000000": [{ name: "Junaid Jamshed", fatherName: "M. Junaid", contact: "03090000000", city: "BWP", school: "GHSS ABBASIA", class: "10th", section: "A", rollNo: "77" }]
    },
    results: [
        { contact: "03001111111", name: "Ahmed Raza", chapterId: 1, marks: 8, score: 100, correct: 8, total: 8, timeTaken: "00:40", timeElapsed: 40, date: new Date().toISOString(), subjective: 10 },
        { contact: "03012222222", name: "Ali Hamza", chapterId: 1, marks: 7, score: 88, correct: 7, total: 8, timeTaken: "01:05", timeElapsed: 65, date: new Date().toISOString(), subjective: 8 },
        { contact: "03023333333", name: "Bilal Khan", chapterId: 1, marks: 6, score: 75, correct: 6, total: 8, timeTaken: "01:30", timeElapsed: 90, date: new Date().toISOString(), subjective: 7 },
        { contact: "03034444444", name: "Daniyal Ali", chapterId: 1, marks: 4, score: 50, correct: 4, total: 8, timeTaken: "02:10", timeElapsed: 130, date: new Date().toISOString(), subjective: 5 },
        { contact: "03045555555", name: "Ehsan Elahi", chapterId: 1, marks: 5, score: 63, correct: 5, total: 8, timeTaken: "01:20", timeElapsed: 80, date: new Date().toISOString(), subjective: 6 },
        { contact: "03090000000", name: "Junaid Jamshed", chapterId: 1, marks: 3, score: 38, correct: 3, total: 8, timeTaken: "01:45", timeElapsed: 105, date: new Date().toISOString(), subjective: 4 }
    ]
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
        state.chapters = MCQ_DATA.chapters;
        if (Object.keys(state.students).length === 0) {
            state.students = DUMMY_DATA.students;
            state.results = DUMMY_DATA.results;
            saveToStorage();
        }
        setTimeout(() => {
            if (document.querySelector('.loader')) document.querySelector('.loader').style.display = 'none';
            if (document.getElementById('start-btn')) document.getElementById('start-btn').style.display = 'block';
        }, 300);
    } catch (error) { console.error(error); alert("Error loading data."); }
}

// --- Navigation ---
function showSection(id) {
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
}

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

// --- Section Logic ---
function updateSections(classVal, id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="" disabled selected>Select Section</option>';
    let list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    if (classVal === '9th') list.push('S'); else if (classVal === '10th') list.push('J');
    list.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = id === 'filter-section' ? `Section ${s}` : s;
        el.appendChild(opt);
    });
}
document.getElementById('student-class').addEventListener('change', (e) => updateSections(e.target.value, 'student-section'));
document.getElementById('filter-class').addEventListener('change', (e) => updateSections(e.target.value, 'filter-section'));
updateSections('9th', 'filter-section');

// --- Grading Logic ---
function calculateGrade(percentage) {
    if (percentage < 50) return { grade: "F", status: "Fail" };
    if (percentage <= 60) return { grade: "D", status: "Pass" };
    if (percentage <= 80) return { grade: "C", status: "Pass" };
    if (percentage <= 90) return { grade: "B", status: "Pass" };
    if (percentage <= 95) return { grade: "A", status: "Pass" };
    return { grade: "A+", status: "Pass" };
}

// --- Teacher Dashboard ---
document.getElementById('login-btn').addEventListener('click', () => {
    if (document.getElementById('teacher-pass').value === '2247') { renderTeacherPanel(); showSection('teacher-panel'); }
    else alert("Incorrect Password!");
});

function renderTeacherPanel() {
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = '';
    const classVal = document.getElementById('filter-class').value;
    const secVal = document.getElementById('filter-section').value;

    let sr = 1;
    Object.keys(state.students).forEach(contact => {
        state.students[contact].forEach(student => {
            // Updated filtering logic
            if (student.school === 'GHSS ABBASIA') {
                if (student.class !== classVal) return;
                if (secVal && student.section !== secVal) return;
            } else if (classVal || secVal) {
                // For non-GHSS ABBASIA students, only filter if specific class/section selected
                if (classVal && student.class !== classVal) return;
                if (secVal && student.section !== secVal) return;
            }

            const res = [...state.results].reverse().find(r => r.contact === contact && r.name === student.name);
            const tr = document.createElement('tr');
            const marksMCQ = res ? res.marks : 0;
            const sub = res ? (res.subjective || 0) : 0;
            const total = marksMCQ + sub;
            const perc = Math.round((total / 18) * 100);
            const eval = calculateGrade(perc);

            tr.innerHTML = `
                <td>${sr++}</td>
                <td>${student.rollNo || '--'}</td>
                <td>${student.name}</td>
                <td>${student.fatherName}</td>
                <td>${contact}</td>
                <td>${marksMCQ}</td>
                <td>${res ? res.timeTaken : '--:--'}</td>
                <td><input type="number" value="${sub}" style="width: 50px; padding: 5px;" onchange="updateSubjective('${contact}', '${student.name}', this.value)"></td>
                <td class="total-marks">${total}</td>
                <td>${perc}%</td>
                <td class="${eval.status === 'Fail' ? 'text-error' : 'text-success'}">${eval.status}</td>
                <td><strong>${eval.grade}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    });
}

document.getElementById('filter-class').addEventListener('change', renderTeacherPanel);
document.getElementById('filter-section').addEventListener('change', renderTeacherPanel);

window.updateSubjective = (contact, name, val) => {
    const res = state.results.find(r => r.contact === contact && r.name === name);
    if (res) { res.subjective = parseFloat(val) || 0; saveToStorage(); renderTeacherPanel(); }
};

document.getElementById('download-section-report').addEventListener('click', () => {
    const classVal = document.getElementById('filter-class').value;
    const secVal = document.getElementById('filter-section').value;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // Landscape to fit Contact number
    
    doc.setFontSize(20); doc.text(`GHSS ABBASIA - SECTIONAL RESULT`, 148, 15, { align: "center" });
    doc.setFontSize(12); doc.text(`Class: ${classVal} | Section: ${secVal}`, 148, 22, { align: "center" });

    let y = 35;
    const headers = ["Roll", "Name", "Father Name", "Contact", "MCQ", "Subj", "Tot", "%", "Grd"];
    const xPos = [15, 30, 80, 130, 175, 195, 215, 235, 260];
    
    doc.setFontSize(10); doc.setFont(undefined, 'bold');
    headers.forEach((h, i) => doc.text(h, xPos[i], y));
    doc.line(15, y + 2, 280, y + 2);
    y += 10;

    let appeared = 0, fail = 0, maxRoll = 0;
    const allStudents = Object.values(state.students).flat().filter(s => s.school === 'GHSS ABBASIA' && s.class === classVal && s.section === secVal);
    allStudents.forEach(s => { if(parseInt(s.rollNo) > maxRoll) maxRoll = parseInt(s.rollNo); });
    if (maxRoll < 77) maxRoll = 77;

    for (let i = 1; i <= maxRoll; i++) {
        if (i === 40) { doc.addPage(); y = 20; doc.setFontSize(10); doc.setFont(undefined, 'bold'); headers.forEach((h, i) => doc.text(h, xPos[i], y)); doc.line(15, y + 2, 280, y + 2); y += 10; }
        const s = allStudents.find(std => parseInt(std.rollNo) === i);
        doc.setFont(undefined, 'normal'); doc.setFontSize(9);
        doc.text(i.toString(), xPos[0], y);
        if (s) {
            const r = state.results.find(res => res.contact === s.contact && res.name === s.name);
            const mcq = r ? r.marks : 0; const sub = r ? (r.subjective || 0) : 0;
            const tot = mcq + sub; const p = Math.round((tot / 18) * 100);
            const e = calculateGrade(p);
            doc.text(s.name.substring(0, 20), xPos[1], y);
            doc.text(s.fatherName.substring(0, 20), xPos[2], y);
            doc.text(s.contact, xPos[3], y);
            doc.text(mcq.toString(), xPos[4], y);
            doc.text(sub.toString(), xPos[5], y);
            doc.text(tot.toString(), xPos[6], y);
            doc.text(p + "%", xPos[7], y);
            doc.text(e.grade, xPos[8], y);
            if (r) appeared++; if (e.status === 'Fail') fail++;
        } else {
            doc.setTextColor(150); doc.text("--- ABSENT ---", xPos[1], y); doc.setTextColor(0);
        }
        y += 6.5;
    }

    y += 5; doc.line(15, y, 280, y); y += 8;
    const passPerc = appeared > 0 ? Math.round(((appeared - fail) / appeared) * 100) : 0;
    doc.setFont(undefined, 'bold'); doc.setFontSize(11);
    doc.text(`Total Appeared: ${appeared} | Absent: ${maxRoll - appeared} | Fail: ${fail} | Pass Percentage: ${passPerc}%`, 148, y, { align: "center" });
    doc.save(`Detailed_Result_${classVal}_${secVal}.pdf`);
});

document.getElementById('reset-data-btn').addEventListener('click', () => {
    if (confirm("Delete ALL data?")) { localStorage.clear(); location.reload(); }
});

// --- Student Access ---
document.getElementById('student-contact').addEventListener('input', (e) => {
    const contact = e.target.value;
    const profileSelection = document.getElementById('profile-selection-step');
    const registrationDetails = document.getElementById('registration-details');
    const registerBtn = document.getElementById('register-btn');

    if (contact.match(/^03[0-9]{9}$/)) {
        const students = state.students[contact] || [];
        if (students.length > 0) {
            profileSelection.style.display = 'block';
            const list = document.getElementById('profile-list'); list.innerHTML = '';
            students.forEach(s => {
                const d = document.createElement('div'); d.className = 'profile-btn';
                d.innerHTML = `<span>${s.name}</span><br><small>${s.school}</small>`;
                d.onclick = () => loginStudent(s); list.appendChild(d);
            });
            if (students.length >= 3) {
                registrationDetails.style.display = 'none'; registerBtn.style.display = 'none';
                document.querySelector('#registration-form p.warning-text').textContent = "Maximum 3 profiles registered for this number.";
            } else {
                registrationDetails.style.display = 'block'; registerBtn.style.display = 'block';
                document.querySelector('#registration-form p.warning-text').textContent = "Profiles found. Select yours or register a new one.";
            }
        } else {
            profileSelection.style.display = 'none'; registrationDetails.style.display = 'block'; registerBtn.style.display = 'block';
            document.querySelector('#registration-form p.warning-text').textContent = "Fill your details to start. (Max 3 per number)";
        }
    } else {
        profileSelection.style.display = 'none'; registrationDetails.style.display = 'block'; registerBtn.style.display = 'block';
    }
});

function loginStudent(s) {
    state.user = s; document.getElementById('display-user-name').textContent = `Welcome, ${s.name}`;
    renderChapters(); showSection('chapter-selection');
}

document.getElementById('logout-student').addEventListener('click', () => {
    state.user = null; document.getElementById('registration-form').reset();
    document.getElementById('profile-selection-step').style.display = 'none';
    showSection('student-registration');
});

document.getElementById('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const father = document.getElementById('father-name').value;
    const contact = document.getElementById('student-contact').value;
    const city = document.getElementById('student-city').value;
    const school = document.getElementById('school-name').value;
    const cls = document.getElementById('student-class').value;
    const sec = document.getElementById('student-section').value;
    const roll = document.getElementById('roll-no').value;

    if (school === 'GHSS ABBASIA') {
        if (!roll || roll < 1 || roll > 77) { alert("Roll No 1-77 required."); return; }
        if (Object.values(state.students).flat().some(s => s.school === 'GHSS ABBASIA' && s.class === cls && s.section === sec && s.rollNo === roll)) {
            alert("Roll No already registered."); return;
        }
    }
    if (!state.students[contact]) state.students[contact] = [];
    const newS = { name, fatherName: father, contact, city, school, class: cls, section: sec, rollNo: roll };
    state.students[contact].push(newS); state.user = newS;
    saveToStorage(); loginStudent(newS);
});

document.getElementById('school-name').addEventListener('change', (e) => {
    const extraFields = document.getElementById('extra-fields');
    const isAbbasia = e.target.value === 'GHSS ABBASIA';
    extraFields.style.display = isAbbasia ? 'block' : 'none';
    ['student-class', 'student-section', 'roll-no'].forEach(id => document.getElementById(id).required = isAbbasia);
});

// --- Test Logic ---
function shuffleArray(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function renderChapters() {
    const list = document.getElementById('chapter-list'); list.innerHTML = '';
    state.chapters.forEach(c => {
        const att = (state.attempts[state.user.contact] && state.attempts[state.user.contact][c.id]) || 0;
        const res = [...state.results].reverse().find(r => r.contact === state.user.contact && r.name === state.user.name && r.chapterId === c.id);
        const btn = document.createElement('div'); btn.className = `chapter-btn ${res ? 'completed' : ''}`;
        btn.innerHTML = `<div><strong>${c.title}</strong><br><small>${res ? 'MCQ: ' + res.marks + '/8' : 'Not attempted'}</small></div><span>${att}/1</span>`;
        btn.onclick = () => startTest(c.id); list.appendChild(btn);
    });
}

function startTest(id) {
    if ((state.attempts[state.user.contact] && state.attempts[state.user.contact][id]) >= 1) { alert("No re-attempts."); return; }
    const ch = state.chapters.find(c => c.id === id);
    state.currentChapter = { ...ch, questions: shuffleArray([...ch.questions]).slice(0, 8) };
    state.currentQuestionIndex = 0; state.answers = {}; state.isReviewMode = false; state.timeElapsed = 0;
    clearInterval(state.timerInterval); state.timerInterval = setInterval(() => state.timeElapsed++, 1000);
    showSection('test-interface'); renderQuestion(true);
}

function startQuestionTimer() {
    clearInterval(state.questionTimerInterval); state.questionTimerValue = 15;
    state.questionTimerInterval = setInterval(() => {
        state.questionTimerValue--; 
        const el = document.getElementById('timer'); el.textContent = `00:${state.questionTimerValue.toString().padStart(2, '0')}`;
        el.classList.toggle('text-error', state.questionTimerValue <= 3);
        if (state.questionTimerValue <= 0) { clearInterval(state.questionTimerInterval); handleTimeout(); }
    }, 1000);
}

function handleTimeout() {
    if (state.currentQuestionIndex < 7) { state.currentQuestionIndex++; renderQuestion(true); }
    else submitTest();
}

function renderQuestion(isNew) {
    const q = state.currentChapter.questions[state.currentQuestionIndex];
    document.getElementById('current-chapter-title').textContent = state.currentChapter.title;
    document.getElementById('question-counter').textContent = `Question ${state.currentQuestionIndex + 1}/8`;
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('progress-fill').style.width = `${((state.currentQuestionIndex + 1) / 8) * 100}%`;
    const container = document.getElementById('options-container'); container.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button'); btn.className = 'option-btn';
        if (state.isReviewMode) {
            if (idx === q.answer) btn.classList.add('correct');
            else if (state.answers[q.id] === idx) btn.classList.add('wrong');
        } else if (state.answers[q.id] === idx) btn.classList.add('selected');
        btn.textContent = opt; if (!state.isReviewMode) btn.onclick = () => selectOption(q.id, idx);
        container.appendChild(btn);
    });
    document.getElementById('next-btn').style.display = (state.currentQuestionIndex < 7) ? 'block' : 'none';
    document.getElementById('submit-test-btn').style.display = (state.currentQuestionIndex === 7 && !state.isReviewMode) ? 'block' : 'none';
    if (isNew && !state.isReviewMode) startQuestionTimer();
    else if (state.isReviewMode) { clearInterval(state.questionTimerInterval); document.getElementById('timer').textContent = 'Review'; }
}

function selectOption(qId, idx) {
    if (state.isReviewMode) return;
    state.answers[qId] = idx; renderQuestion(false);
    setTimeout(() => { if (state.currentQuestionIndex < 7) { state.currentQuestionIndex++; renderQuestion(true); } else submitTest(); }, 500);
}

document.getElementById('next-btn').addEventListener('click', () => { if (state.currentQuestionIndex < 7) { state.currentQuestionIndex++; renderQuestion(true); } });
document.getElementById('submit-test-btn').addEventListener('click', submitTest);

function submitTest() {
    clearInterval(state.questionTimerInterval); clearInterval(state.timerInterval);
    let correct = 0; state.currentChapter.questions.forEach(q => { if (state.answers[q.id] === q.answer) correct++; });
    const contact = state.user.contact; const chId = state.currentChapter.id;
    if (!state.attempts[contact]) state.attempts[contact] = {};
    state.attempts[contact][chId] = (state.attempts[contact][chId] || 0) + 1;

    const res = {
        contact, name: state.user.name, chapterId: chId, marks: correct, score: Math.round((correct / 8) * 100),
        timeTaken: `${Math.floor(state.timeElapsed / 60).toString().padStart(2, '0')}:${(state.timeElapsed % 60).toString().padStart(2, '0')}`,
        timeElapsed: state.timeElapsed, date: new Date().toISOString(), subjective: 0
    };
    state.results.push(res); saveToStorage();
    
    // ============================================================
    // SAVE TO SUPABASE (ADDED - does not affect existing functionality)
    // ============================================================
    saveToSupabase(state.user, res);
    
    showResult(res);
}

function showResult(r) {
    document.getElementById('result-percentage').textContent = `${r.marks}/8`;
    document.getElementById('result-time').textContent = r.timeTaken;
    const sorted = state.results.filter(res => res.chapterId === r.chapterId).sort((a, b) => b.marks - a.marks || a.timeElapsed - b.timeElapsed);
    const rank = sorted.findIndex(res => res.contact === r.contact && res.name === r.name && res.date === r.date) + 1;
    document.getElementById('result-rank').textContent = `#${rank}`;
    document.getElementById('result-status').textContent = r.marks >= 4 ? "Pass" : "Fail";
    document.getElementById('result-status').className = `value ${r.marks >= 4 ? 'text-success' : 'text-error'}`;
    
    // Prepare PNG Data
    document.getElementById('png-name').textContent = state.user.name;
    document.getElementById('png-father').textContent = state.user.fatherName;
    document.getElementById('png-test').textContent = state.currentChapter.title;
    document.getElementById('png-marks').textContent = `${r.marks}/8`;
    document.getElementById('png-rank').textContent = `#${rank}`;
    document.getElementById('png-time').textContent = r.timeTaken;
    document.getElementById('png-status').textContent = r.marks >= 4 ? "PASS" : "FAIL";
    document.getElementById('png-correct').textContent = r.marks;
    document.getElementById('png-wrong').textContent = 8 - r.marks;
    
    showSection('result-screen');
}

document.getElementById('download-png-btn').addEventListener('click', () => {
    const btn = document.getElementById('download-png-btn');
    const originalText = btn.textContent;
    btn.textContent = "Generating...";
    btn.disabled = true;

    const template = document.getElementById('result-png-template');
    
    // Temporarily bring to view for capture
    const originalStyle = template.style.cssText;
    template.style.position = "fixed";
    template.style.left = "0";
    template.style.top = "0";
    template.style.zIndex = "9999";
    template.style.opacity = "1";
    template.style.visibility = "visible";

    setTimeout(() => {
        html2canvas(template, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null
        }).then(canvas => {
            template.style.cssText = originalStyle;
            const link = document.createElement('a');
            link.download = `${state.user.name}_Result.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            btn.textContent = originalText;
            btn.disabled = false;
        }).catch(err => {
            console.error("PNG Generation Error:", err);
            template.style.cssText = originalStyle;
            alert("Failed to generate PNG. Please try again or take a screenshot.");
            btn.textContent = originalText;
            btn.disabled = false;
        });
    }, 100);
});

document.getElementById('share-whatsapp-btn').addEventListener('click', () => {
    const r = state.results[state.results.length - 1];
    const text = `*MCQ TEST RESULT*\nName: ${state.user.name}\nMarks: ${r.marks}/8\nRank: ${document.getElementById('result-rank').textContent}\nTime: ${r.timeTaken}\nStatus: ${r.marks >= 4 ? 'PASS' : 'FAIL'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
});

document.getElementById('review-test-btn').addEventListener('click', () => { state.isReviewMode = true; state.currentQuestionIndex = 0; renderQuestion(false); showSection('test-interface'); });
document.getElementById('back-to-chapters').addEventListener('click', () => { renderChapters(); showSection('chapter-selection'); });

function saveToStorage() {
    localStorage.setItem('ta_attempts', JSON.stringify(state.attempts));
    localStorage.setItem('ta_results', JSON.stringify(state.results));
    localStorage.setItem('ta_students', JSON.stringify(state.students));
}

init();
