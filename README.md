# Teachers Academy Bahawalpur - MCQ Practice Portal

A futuristic, mobile-first web application for students to practice Mathematics MCQs chapter-wise.

## 🚀 Features
- **Futuristic UI:** Dark mode with neon accents and glassmorphism.
- **Mobile First:** Optimized for low-end Android devices and smooth touch interactions.
- **Role System:** 
  - **Teacher:** Monitor students, track scores, and approve re-attempts.
  - **Student:** Register, attempt tests, and download result cards.
- **Test Engine:** 
  - Dynamic chapter loading.
  - Timer and progress bar.
  - Auto-scroll to unattempted questions.
- **Persistence:** All data stored locally using `localStorage`.
- **Result System:** Detailed score breakdown and PDF export.

## 📁 Project Structure
- `index.html`: Main SPA structure.
- `style.css`: Futuristic styling and animations.
- `app.js`: Application logic and state management.
- `data.json`: MCQ database (generated from Word file).
- `parse_mcqs.js`: Node.js utility to parse `.docx` files.
- `logo.png`: Academy logo.

## 🛠️ Setup Instructions

### 1. Local Development
1. Clone the repository or download the files.
2. Open `index.html` in any modern web browser.
   *Note: For the JSON data to load correctly, you might need to run a local server (e.g., Live Server extension in VS Code).*

### 2. Parsing Your Word File
If you have a new `mcqs.docx` file:
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Install dependencies:
   ```bash
   npm install mammoth
   ```
3. Run the parser:
   ```bash
   node parse_mcqs.js your_file.docx
   ```
4. This will update `data.json` with your new questions.

**Word File Format Requirements:**
- Chapter titles should start with "Chapter".
- Questions should start with numbers (e.g., "1. What is...").
- Options should be labeled (a), (b), (c), (d).
- Answer keys should start with "Answer: (a)".

### 3. Teacher Access
- **Password:** `2247`

## 🌐 GitHub Deployment
1. Upload all files (excluding `node_modules`) to a new GitHub repository.
2. Go to **Settings > Pages**.
3. Select the `main` branch and `/root` folder as the source.
4. Your app will be live at `https://yourusername.github.io/your-repo-name/`.

## ⚠️ Important Notes
- This app uses `localStorage` for data persistence. Clearing browser data will reset student records and attempts.
- Max 3 students are allowed per phone number for registration.
- Students get 2 attempts per chapter. Further attempts require teacher approval.

---
**Developed for Teachers Academy Bahawalpur**
