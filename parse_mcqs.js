const fs = require('fs');
const mammoth = require('mammoth');

/**
 * Teachers Academy MCQ Parser (Advanced V3)
 * Detects questions starting with "Q1." and answers marked with bold (<strong>)
 * Using robust regex for option extraction.
 */

async function parseDocx(filePath) {
    try {
        console.log(`Reading ${filePath}...`);
        const result = await mammoth.convertToHtml({ path: filePath });
        const html = result.value;
        
        const paragraphs = html.split(/<\/p>/);
        
        const chapters = [{
            id: 1,
            title: "Chapter 1: Mathematics MCQ Test",
            questions: []
        }];
        
        let currentChapter = chapters[0];

        paragraphs.forEach(p => {
            const cleanP = p.replace(/<p>/g, '').trim();
            if (!cleanP) return;

            // Match Question Header
            const questionHeaderMatch = cleanP.match(/^<strong>Q(\d+)[\.\)](.*?)<\/strong>/i);
            
            if (questionHeaderMatch) {
                const qNum = parseInt(questionHeaderMatch[1]);
                const qText = questionHeaderMatch[2].trim();
                
                const question = {
                    id: qNum,
                    question: qText,
                    options: [],
                    answer: -1
                };

                // Isolate the body containing options
                const body = cleanP.replace(/^<strong>Q\d+[\.\)].*?<\/strong>/i, '').trim();
                
                // Match each option A) B) C) D)
                // This regex looks for (Optional <strong>) + (A-D) + ) + (Text)
                // and stops before the next option or end of string
                const optionMatches = [...body.matchAll(/(?:<strong>)?\s*([A-D])\)\s*(.*?)(?=(?:<strong>)?\s*[A-D]\)|$)/gi)];
                
                optionMatches.forEach(m => {
                    const letter = m[1].toUpperCase();
                    const index = letter.charCodeAt(0) - 65;
                    const optionHtml = m[2].trim();
                    
                    // Clean up trailing tags and spaces
                    const optionText = optionHtml.replace(/<\/?strong>/g, '').trim();
                    question.options[index] = optionText;
                    
                    // If the whole match group includes <strong>, it's the answer
                    if (m[0].includes('<strong>')) {
                        question.answer = index;
                    }
                });

                // Only add if we found at least some options
                if (question.options.length > 0) {
                    currentChapter.questions.push(question);
                }
            }
        });

        // Filter out incomplete questions
        const totalFound = currentChapter.questions.length;
        currentChapter.questions = currentChapter.questions.filter(q => q.options.length > 0 && q.answer !== -1);
        const validCount = currentChapter.questions.length;

        fs.writeFileSync('data.json', JSON.stringify({ chapters }, null, 2));
        console.log(`Successfully parsed ${validCount} valid MCQs (out of ${totalFound} found) into data.json`);
    } catch (error) {
        console.error("Error parsing Word file:", error);
    }
}

const file = process.argv[2] || 'mcqs.docs.docx';
parseDocx(file);
