/**
 * Main Application Logic - Interactive Student Nomination & SME Learning Studio
 */

// Configure PDF.js worker URL if available
if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Initial State
const state = {
    trainerName: localStorage.getItem('trainerName') || 'Trainer Siva',
    sessionTitle: localStorage.getItem('sessionTitle') || 'Data Analytics & AI Masterclass',
    theme: localStorage.getItem('theme') || 'default',
    pickerMode: 'wheel',
    students: JSON.parse(localStorage.getItem('students') || JSON.stringify([
        'Abhilash Reddy Lekkala', 'Abhinay Kumar', 'Abhinay Reddy', 'Ajay Babu',
        'Amandeep Guggilapu', 'Fathima Nuzhat Mohammed', 'Karishma Shaik',
        'Kavanuru Chandish Kumar', 'Kurva Kishore', 'Madhav Reddy',
        'Mandra Shiva Teja', 'Manga Srikanth', 'Menchu Jaswant Prasad',
        'Moguloju Vigneshwara chary', 'Mohammad Afreen', 'Nivedika Potnuru',
        'Nithin Kumar', 'Ranjith Ramisetty', 'Rohith Yadav', 'Rupesh Devara',
        'Sahithi', 'Sai siddartha', 'Shashivar', 'SRIHARI VARDHAN',
        'Thanusri Mekarthi', 'Upagna N'
    ])),
    winners: JSON.parse(localStorage.getItem('winners') || '[]'),
    autoRemoveWinner: localStorage.getItem('autoRemoveWinner') === 'true',
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    savedRosters: JSON.parse(localStorage.getItem('savedRosters') || '{}'),
    
    // SME Training Content State
    smeContent: JSON.parse(localStorage.getItem('smeContent') || JSON.stringify({
        topic: 'Exploratory Data Analysis (EDA) & Feature Engineering',
        category: 'Data Analytics',
        sourceType: 'written', // 'written' or 'pdf'
        attachedPdfName: '',
        todayContent: `1. Understanding Data Distributions (Skewness, Kurtosis, Outliers).
2. Handling Missing Values using Pandas (SimpleImputer, KNNImputer).
3. Feature Encoding: One-Hot Encoding vs Label Encoding.
4. Correlation Analysis & Seaborn Heatmaps.
5. Detecting Outliers using IQR & Z-Score methods.`,
        practicals: `Hands-on Lab: Dirty Retail Sales Dataset Cleaning
- Step 1: Load 'retail_sales_2026.csv' into Pandas DataFrame.
- Step 2: Impute missing product prices with category median.
- Step 3: Remove duplicate transactions & filter outliers (Z-score > 3).
- Step 4: Generate automated EDA report with Data profiling.`,
        revisionNotes: `Previous Class Recap: Python Data Structures & NumPy Arrays
- Fast Vectorized Operations vs Standard Python Loops.
- NumPy Slicing, Reshaping & Boolean Indexing.
- Summary Statistics: Mean, Median, Std Dev, Variance.`
    })),

    // Canvas Wheel State
    wheel: {
        canvas: null,
        ctx: null,
        currentAngle: 0,
        isSpinning: false,
        lastTickAngle: 0
    },

    // Timer State
    timer: {
        seconds: 300,
        initialSeconds: 300,
        interval: null,
        isRunning: false
    }
};

// Pre-loaded Subject Matter Expert Topics
const SME_TEMPLATES = {
    'da_pandas': {
        topic: 'Python Pandas & Data Cleaning Masterclass',
        category: 'Data Analytics',
        todayContent: `1. Introduction to DataFrames & Series structures.
2. Efficient Filtering & GroupBy Aggregations (.groupby(), .agg()).
3. Merging & Joining Datasets (Inner, Outer, Left, Right joins).
4. Time-series data manipulation (.resample(), pd.to_datetime()).
5. Exporting cleaned data to CSV, Excel, and SQL tables.`,
        practicals: `Practical Exercise: E-Commerce Customer Purchasing Power Analysis
- Filter customers with total purchase value > $5,000.
- Compute average monthly spending per category.
- Detect customer churn probability based on last active date.`,
        revisionNotes: `Recap: Python Functions & Lambda Expressions
- Map, Filter, and Reduce functions in Python.
- Dictionary comprehensions for high-speed lookup tables.`
    },
    'da_sql': {
        topic: 'SQL Query Optimization & Complex Joins',
        category: 'Data Analytics',
        todayContent: `1. Advanced Subqueries & Common Table Expressions (CTEs).
2. Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD().
3. Query Execution Plans & Indexing Strategies (B-Trees, Hash Indexes).
4. Aggregations with HAVING clause vs WHERE clause.
5. Database Normalization (1NF, 2NF, 3NF).`,
        practicals: `Practical Lab: Optimizing Slow Multi-Table Query
- Write a CTE to rank top 5 sales reps per region.
- Utilize ROW_NUMBER() OVER(PARTITION BY region ORDER BY revenue DESC).
- Create composite index on (region_id, sale_date) to reduce latency.`,
        revisionNotes: `Recap: Relational Database Fundamentals
- Primary Key vs Foreign Key constraints.
- Basic INNER JOIN vs LEFT OUTER JOIN semantics.`
    },
    'ml_supervised': {
        topic: 'Supervised Machine Learning: Regression & Classification',
        category: 'Machine Learning',
        todayContent: `1. Linear Regression mathematics: Ordinary Least Squares (OLS) & Gradient Descent.
2. Logistic Regression & Sigmoid Activation Function.
3. Cost Functions: Mean Squared Error (MSE) vs Binary Cross-Entropy.
4. Train/Test Split & K-Fold Cross Validation.
5. Model Metrics: R-squared, RMSE, Accuracy, Precision, Recall, F1-Score.`,
        practicals: `Practical Lab: Housing Price Prediction Model
- Load Housing dataset using Scikit-Learn.
- Train Linear Regression vs Ridge Regression (L2 regularization).
- Evaluate predictions using RMSE & plot residuals.`,
        revisionNotes: `Recap: Probability & Statistical Foundations
- Normal Distribution, Z-scores & Central Limit Theorem.
- Hypothesis Testing: p-values & Null Hypothesis.`
    },
    'ml_trees': {
        topic: 'Decision Trees, Random Forests & Gradient Boosting',
        category: 'Machine Learning',
        todayContent: `1. Decision Tree Splitting Criteria: Entropy, Gini Impurity, Variance Reduction.
2. Hyperparameter Tuning: max_depth, min_samples_split, min_samples_leaf.
3. Ensemble Learning: Bagging vs Boosting concepts.
4. Random Forest Classifier & Feature Importance Scores.
5. Introduction to XGBoost & LightGBM.`,
        practicals: `Practical Lab: Telecom Customer Churn Classifier
- Train Random Forest Model with 100 Estimators.
- Extract top 5 feature importances (e.g., tenure, monthly charges).
- Tune hyperparameters using GridSearchCV.`,
        revisionNotes: `Recap: Overfitting vs Underfitting
- Bias-Variance Tradeoff analysis.
- Regularization techniques to prevent overfitting.`
    },
    'ai_neural': {
        topic: 'Deep Learning & Artificial Neural Networks (ANN)',
        category: 'Artificial Intelligence',
        todayContent: `1. Biological vs Artificial Neurons (Perceptron model).
2. Activation Functions: ReLU, Leaky ReLU, Sigmoid, Softmax.
3. Forward Propagation & Loss calculation.
4. Backpropagation algorithm & Chain Rule calculus.
5. Optimizers: SGD, Adam, RMSprop with Learning Rate schedulers.`,
        practicals: `Practical Lab: Handwritten Digit Recognition (MNIST)
- Build 3-layer Neural Network using PyTorch/TensorFlow.
- Train model over 10 epochs with Adam Optimizer.
- Achieved Test Accuracy > 98%.`,
        revisionNotes: `Recap: Matrix Operations for AI
- Matrix Multiplication, Transpose & Dot Products.
- Tensors dimensions & Reshaping.`
    },
    'ai_llm': {
        topic: 'Generative AI, LLMs & Prompt Engineering',
        category: 'Artificial Intelligence',
        todayContent: `1. Transformer Architecture: Self-Attention Mechanism & Encoder-Decoder.
2. Tokenization, Embeddings & Vector Stores (FAISS, ChromaDB).
3. Prompt Engineering Strategies: Chain-of-Thought, Few-Shot, Zero-Shot.
4. Retrieval-Augmented Generation (RAG) Architecture.
5. Fine-Tuning LLMs using LoRA & PEFT.`,
        practicals: `Practical Lab: Building a Document QA Bot with RAG
- Ingest PDF textbook into Vector DB.
- Embed chunks using OpenAI/HuggingFace embeddings.
- Retrieve top-k relevant chunks & generate precise answers.`,
        revisionNotes: `Recap: Natural Language Processing (NLP) Basics
- Bag of Words (BoW), TF-IDF vectors.
- Word2Vec & GloVe semantic embeddings.`
    }
};

// Color palettes for Wheel Slices
const SLICE_COLORS = [
    '#2563eb', '#0d9488', '#d97706', '#059669', '#3b82f6',
    '#7c3aed', '#dc2626', '#0891b2', '#65a30d', '#ca8a04'
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initTheme();
    initCanvasWheel();
    renderStudentList();
    renderWinnersList();
    renderSmeContent();
    initTimer();
});

// --- Theme Management ---
function initTheme() {
    if (state.theme !== 'default') {
        document.documentElement.setAttribute('data-theme', state.theme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = state.theme;
}

function changeTheme(themeName) {
    state.theme = themeName;
    localStorage.setItem('theme', themeName);
    initTheme();
    drawWheel();
}

function updateTrainerProfile() {
    const tName = document.getElementById('trainerNameInput').value.trim();
    const sTitle = document.getElementById('sessionTitleInput').value.trim();

    if (tName) state.trainerName = tName;
    if (sTitle) state.sessionTitle = sTitle;

    localStorage.setItem('trainerName', state.trainerName);
    localStorage.setItem('sessionTitle', state.sessionTitle);

    document.getElementById('displayTrainerName').innerText = state.trainerName;
    document.getElementById('displaySessionTitle').innerText = state.sessionTitle;

    closeModal('profileModal');
}

// --- SME Training Content Management (Written & PDF Upload) ---
function renderSmeContent() {
    const topicEl = document.getElementById('smeTopicTitle');
    const todayEl = document.getElementById('smeTodayContentInput');
    const practicalsEl = document.getElementById('smePracticalsInput');
    const revisionEl = document.getElementById('smeRevisionInput');
    const pdfBadge = document.getElementById('pdfStatusBadge');

    if (topicEl) topicEl.innerText = state.smeContent.topic;
    if (todayEl) todayEl.value = state.smeContent.todayContent;
    if (practicalsEl) practicalsEl.value = state.smeContent.practicals;
    if (revisionEl) revisionEl.value = state.smeContent.revisionNotes;

    if (pdfBadge) {
        if (state.smeContent.attachedPdfName) {
            pdfBadge.classList.remove('hidden');
            pdfBadge.innerHTML = `<i class="fa-solid fa-file-pdf text-red-500"></i> Attached: <strong>${escapeHtml(state.smeContent.attachedPdfName)}</strong> <button onclick="removeAttachedPdf()" class="ml-1 text-slate-400 hover:text-red-600"><i class="fa-solid fa-xmark"></i></button>`;
        } else {
            pdfBadge.classList.add('hidden');
        }
    }

    localStorage.setItem('smeContent', JSON.stringify(state.smeContent));
}

function loadSmeTemplate(key) {
    if (!key || !SME_TEMPLATES[key]) return;
    const t = SME_TEMPLATES[key];
    state.smeContent.topic = t.topic;
    state.smeContent.category = t.category;
    state.smeContent.todayContent = t.todayContent;
    state.smeContent.practicals = t.practicals;
    state.smeContent.revisionNotes = t.revisionNotes;

    renderSmeContent();
    window.soundEngine.playPop();
}

function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
    }

    state.smeContent.attachedPdfName = file.name;

    const fileReader = new FileReader();
    fileReader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            if (window.pdfjsLib) {
                const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
                let extractedText = '';

                for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                    const page = await pdf.getPage(i);
                    const tokenized = await page.getTextContent();
                    const pageText = tokenized.items.map(item => item.str).join(' ');
                    extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
                }

                if (extractedText.trim()) {
                    state.smeContent.todayContent = `[PDF Extracted: ${file.name} - ${pdf.numPages} Pages]\n\n${extractedText.slice(0, 1500)}...`;
                    state.smeContent.topic = `PDF Lecture: ${file.name.replace('.pdf', '')}`;
                }
            } else {
                state.smeContent.todayContent = `[Attached PDF Document: ${file.name}]\n(Text extracted from uploaded PDF notes)`;
            }

            renderSmeContent();
            window.soundEngine.playChime();
            alert(`PDF "${file.name}" uploaded successfully!`);
        } catch (err) {
            console.error("PDF Parsing error:", err);
            alert(`PDF "${file.name}" attached successfully!`);
            renderSmeContent();
        }
    };
    fileReader.readAsArrayBuffer(file);
}

function removeAttachedPdf() {
    state.smeContent.attachedPdfName = '';
    renderSmeContent();
}

function saveSmeContentFromInputs() {
    const todayEl = document.getElementById('smeTodayContentInput');
    const practicalsEl = document.getElementById('smePracticalsInput');
    const revisionEl = document.getElementById('smeRevisionInput');

    if (todayEl) state.smeContent.todayContent = todayEl.value;
    if (practicalsEl) state.smeContent.practicals = practicalsEl.value;
    if (revisionEl) state.smeContent.revisionNotes = revisionEl.value;

    localStorage.setItem('smeContent', JSON.stringify(state.smeContent));
    alert('Session notes saved successfully!');
}

// --- Share to WhatsApp (Target: 9346767185) ---
function shareToWhatsApp() {
    saveSmeContentFromInputs();

    const phone = '919346767185';
    
    let msg = `🎓 *SESSION SUMMARY REPORT*\n`;
    msg += `👨‍🏫 *Trainer:* ${state.trainerName}\n`;
    msg += `📚 *Session:* ${state.sessionTitle}\n`;
    msg += `📌 *Topic:* ${state.smeContent.topic}\n`;

    if (state.smeContent.attachedPdfName) {
        msg += `📄 *PDF Attachment:* ${state.smeContent.attachedPdfName}\n`;
    }
    msg += `\n`;

    msg += `📖 *TODAY'S TRAINING CONTENT:*\n${state.smeContent.todayContent}\n\n`;
    msg += `🧪 *HANDS-ON PRACTICALS & LAB:* \n${state.smeContent.practicals}\n\n`;
    msg += `🔄 *PREVIOUS CLASS REVISION:* \n${state.smeContent.revisionNotes}\n\n`;

    if (state.winners.length > 0) {
        msg += `🏆 *NOMINATED STUDENTS TODAY:* \n`;
        state.winners.slice(0, 10).forEach((w, i) => {
            msg += `${i + 1}. ${w.name} (${w.time})\n`;
        });
    }

    msg += `\n✨ _Shared via Activity Expert LMS Studio_`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMsg}`;
    
    window.open(waUrl, '_blank');
}

// --- PDF Printing Export ---
function printSessionPDF() {
    saveSmeContentFromInputs();

    const printArea = document.getElementById('pdfPrintContainer');
    if (printArea) {
        printArea.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
                <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">
                    <h1 style="color: #2563eb; margin: 0; font-size: 24px;">${escapeHtml(state.sessionTitle)}</h1>
                    <p style="margin: 5px 0 0 0; color: #475569; font-size: 14px;">Trainer: <strong>${escapeHtml(state.trainerName)}</strong> | Date: ${new Date().toLocaleDateString()}</p>
                    <h3 style="color: #0f172a; margin-top: 10px; font-size: 18px;">Topic: ${escapeHtml(state.smeContent.topic)}</h3>
                    ${state.smeContent.attachedPdfName ? `<p style="font-size: 12px; color: #dc2626;">📄 Attached Document: <strong>${escapeHtml(state.smeContent.attachedPdfName)}</strong></p>` : ''}
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: #1e40af; border-left: 4px solid #2563eb; padding-left: 8px;">1. Today's Training Content</h3>
                    <pre style="white-space: pre-wrap; font-family: inherit; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">${escapeHtml(state.smeContent.todayContent)}</pre>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: #065f46; border-left: 4px solid #10b981; padding-left: 8px;">2. Hands-on Practicals & Lab Task</h3>
                    <pre style="white-space: pre-wrap; font-family: inherit; background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">${escapeHtml(state.smeContent.practicals)}</pre>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: #92400e; border-left: 4px solid #f59e0b; padding-left: 8px;">3. Revision of Previous Class</h3>
                    <pre style="white-space: pre-wrap; font-family: inherit; background: #fffbeb; padding: 12px; border-radius: 6px; border: 1px solid #fef3c7;">${escapeHtml(state.smeContent.revisionNotes)}</pre>
                </div>

                ${state.winners.length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #854d0e; border-left: 4px solid #eab308; padding-left: 8px;">🏆 Nominated Students History</h3>
                    <ul style="padding-left: 20px;">
                        ${state.winners.map(w => `<li><strong>${escapeHtml(w.name)}</strong> - Nominated at ${w.time}</li>`).join('')}
                    </ul>
                </div>` : ''}

                <div style="border-top: 1px solid #cbd5e1; margin-top: 30px; pt: 10px; font-size: 11px; color: #94a3b8; text-align: center;">
                    Generated by Activity Expert LMS Platform • Subject Matter Expert Session Notes
                </div>
            </div>
        `;
    }

    window.print();
}

// --- Roster & Student Management ---
function renderStudentList() {
    const listContainer = document.getElementById('studentListContainer');
    const studentCountEl = document.getElementById('studentCount');
    const bulkInput = document.getElementById('bulkStudentInput');

    studentCountEl.innerText = state.students.length;
    if (bulkInput) bulkInput.value = state.students.join('\n');

    listContainer.innerHTML = '';

    if (state.students.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <i class="fa-solid fa-user-slash text-3xl mb-2 text-slate-400"></i>
                <p class="text-xs">No active students in roster.</p>
                <button onclick="loadDemoStudents()" class="mt-2 text-xs text-blue-600 hover:text-blue-700 underline font-medium">Load Demo Roster</button>
            </div>
        `;
        drawWheel();
        return;
    }

    state.students.forEach((name, idx) => {
        const item = document.createElement('div');
        item.className = 'group flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition';
        item.innerHTML = `
            <div class="flex items-center space-x-3 overflow-hidden">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">${idx + 1}</span>
                <span class="text-xs font-semibold text-slate-800 truncate">${escapeHtml(name)}</span>
            </div>
            <button onclick="removeStudent(${idx})" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 transition" title="Remove Student">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        `;
        listContainer.appendChild(item);
    });

    localStorage.setItem('students', JSON.stringify(state.students));
    drawWheel();
    if (state.pickerMode === 'box') renderMysteryBoxes();
    if (state.pickerMode === 'cards') renderCards();
}

function addSingleStudent() {
    const input = document.getElementById('newStudentInput');
    const name = input.value.trim();
    if (!name) return;

    state.students.push(name);
    input.value = '';
    renderStudentList();
    window.soundEngine.playPop();
}

function applyBulkStudents() {
    const input = document.getElementById('bulkStudentInput');
    const lines = input.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    state.students = lines;
    renderStudentList();
    closeModal('bulkModal');
    window.soundEngine.playPop();
}

function removeStudent(index) {
    if (index >= 0 && index < state.students.length) {
        state.students.splice(index, 1);
        renderStudentList();
    }
}

function shuffleStudents() {
    for (let i = state.students.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.students[i], state.students[j]] = [state.students[j], state.students[i]];
    }
    renderStudentList();
    window.soundEngine.playTick();
}

function sortStudents() {
    state.students.sort((a, b) => a.localeCompare(b));
    renderStudentList();
    window.soundEngine.playTick();
}

function clearAllStudents() {
    if (confirm('Are you sure you want to clear all students from the list?')) {
        state.students = [];
        renderStudentList();
    }
}

function loadDemoStudents() {
    state.students = [
        'Abhilash Reddy Lekkala', 'Abhinay Kumar', 'Abhinay Reddy', 'Ajay Babu',
        'Amandeep Guggilapu', 'Fathima Nuzhat Mohammed', 'Karishma Shaik',
        'Kavanuru Chandish Kumar', 'Kurva Kishore', 'Madhav Reddy',
        'Mandra Shiva Teja', 'Manga Srikanth', 'Menchu Jaswant Prasad',
        'Moguloju Vigneshwara chary', 'Mohammad Afreen', 'Nivedika Potnuru',
        'Nithin Kumar', 'Ranjith Ramisetty', 'Rohith Yadav', 'Rupesh Devara',
        'Sahithi', 'Sai siddartha', 'Shashivar', 'SRIHARI VARDHAN',
        'Thanusri Mekarthi', 'Upagna N'
    ];
    renderStudentList();
    window.soundEngine.playChime();
}

// --- Nomination History ---
function addWinner(name) {
    const winnerObj = {
        name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    state.winners.unshift(winnerObj);
    localStorage.setItem('winners', JSON.stringify(state.winners));
    renderWinnersList();

    if (state.autoRemoveWinner) {
        const idx = state.students.indexOf(name);
        if (idx !== -1) {
            state.students.splice(idx, 1);
            renderStudentList();
        }
    }
}

function renderWinnersList() {
    const container = document.getElementById('winnersListContainer');
    const winnersCountEl = document.getElementById('winnersCount');
    if (winnersCountEl) winnersCountEl.innerText = state.winners.length;

    if (!container) return;
    container.innerHTML = '';

    if (state.winners.length === 0) {
        container.innerHTML = '<p class="text-center text-xs text-slate-400 py-4">No nominated students yet.</p>';
        return;
    }

    state.winners.forEach((w, i) => {
        const item = document.createElement('div');
        item.className = 'group flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs hover:bg-amber-100/80 transition';
        item.innerHTML = `
            <div class="flex items-center space-x-2 overflow-hidden">
                <i class="fa-solid fa-trophy text-amber-500 flex-shrink-0"></i>
                <span class="font-bold text-amber-900 truncate">${escapeHtml(w.name)}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-slate-500 text-[10px]">${w.time}</span>
                <button onclick="removeSingleWinner(${i})" class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition" title="Remove entry">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

function removeSingleWinner(index) {
    if (index >= 0 && index < state.winners.length) {
        state.winners.splice(index, 1);
        localStorage.setItem('winners', JSON.stringify(state.winners));
        renderWinnersList();
        window.soundEngine.playPop();
    }
}

function clearWinners() {
    state.winners = [];
    localStorage.setItem('winners', '[]');
    renderWinnersList();
    if (window.soundEngine) window.soundEngine.playPop();
}

// --- Canvas Spinning Wheel Physics ---
function initCanvasWheel() {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    state.wheel.canvas = canvas;
    state.wheel.ctx = canvas.getContext('2d');

    const size = Math.min(window.innerWidth * 0.45, 500);
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    drawWheel();
}

function drawWheel() {
    const { canvas, ctx, currentAngle } = state.wheel;
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = width / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    const count = state.students.length;
    if (count === 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 28px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add Students to Spin!', 0, 0);
        ctx.restore();
        return;
    }

    const sliceAngle = (Math.PI * 2) / count;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle);

    for (let i = 0; i < count; i++) {
        const startA = i * sliceAngle;
        const endA = startA + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerRadius, startA, endA);
        ctx.closePath();

        ctx.fillStyle = SLICE_COLORS[i % SLICE_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.save();
        ctx.rotate(startA + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        const fontSize = count > 20 ? 20 : (count > 12 ? 24 : 30);
        ctx.font = `bold ${fontSize}px "Outfit", sans-serif`;

        const name = state.students[i];
        const maxLen = outerRadius - 70;
        let textToDraw = name;

        if (ctx.measureText(textToDraw).width > maxLen) {
            while (textToDraw.length > 3 && ctx.measureText(textToDraw + '...').width > maxLen) {
                textToDraw = textToDraw.slice(0, -1);
            }
            textToDraw += '...';
        }

        ctx.fillText(textToDraw, outerRadius - 30, 0);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#2563eb';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function spinWheel() {
    if (state.students.length === 0) {
        alert('Please add at least one student before spinning!');
        return;
    }
    if (state.wheel.isSpinning) return;

    state.wheel.isSpinning = true;

    const totalRotation = Math.PI * 2 * (5 + Math.random() * 5);
    const targetAngle = state.wheel.currentAngle + totalRotation;
    const duration = 4500 + Math.random() * 1500;
    const startTime = performance.now();
    const startAngle = state.wheel.currentAngle;

    const count = state.students.length;
    const sliceAngle = (Math.PI * 2) / count;

    function animateWheel(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 5);

        state.wheel.currentAngle = startAngle + (targetAngle - startAngle) * easeOut;

        const effectivePointerAngle = (2 * Math.PI - (state.wheel.currentAngle % (Math.PI * 2))) % (Math.PI * 2);
        const currentSliceIndex = Math.floor(effectivePointerAngle / sliceAngle);

        if (state.wheel.lastSliceIndex !== currentSliceIndex) {
            state.wheel.lastSliceIndex = currentSliceIndex;
            window.soundEngine.playTick(1 + (1 - progress) * 0.5);
        }

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animateWheel);
        } else {
            state.wheel.isSpinning = false;
            const winningIndex = Math.floor(effectivePointerAngle / sliceAngle) % count;
            const winnerName = state.students[winningIndex];

            triggerWinnerCelebration(winnerName);
        }
    }

    requestAnimationFrame(animateWheel);
}

// --- Nomination Modes ---
function setPickerMode(mode) {
    state.pickerMode = mode;
    const modes = ['wheel', 'slot', 'box', 'cards', 'raffle'];
    
    modes.forEach(m => {
        const btn = document.getElementById(`modeBtn-${m}`);
        const panel = document.getElementById(`panel-${m}`);
        if (btn && panel) {
            if (m === mode) {
                btn.className = 'px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 text-white shadow transition';
                panel.classList.remove('hidden');
            } else {
                btn.className = 'px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition';
                panel.classList.add('hidden');
            }
        }
    });

    if (mode === 'box') renderMysteryBoxes();
    if (mode === 'cards') renderCards();
}

// --- Slot Machine ---
function spinSlotMachine() {
    if (state.students.length === 0) {
        alert('Please add students first!');
        return;
    }
    const reel = document.getElementById('slotReelContent');
    if (!reel) return;

    window.soundEngine.playChime();
    
    const winnerIdx = Math.floor(Math.random() * state.students.length);
    const winnerName = state.students[winnerIdx];

    let html = '';
    for (let i = 0; i < 25; i++) {
        const s = state.students[Math.floor(Math.random() * state.students.length)];
        html += `<div class="slot-item text-slate-700">${escapeHtml(s)}</div>`;
    }
    html += `<div class="slot-item text-blue-700 bg-blue-50 border-y-2 border-blue-500 font-extrabold text-3xl">${escapeHtml(winnerName)}</div>`;
    
    reel.innerHTML = html;
    reel.style.transition = 'none';
    reel.style.transform = 'translateY(0px)';

    setTimeout(() => {
        const targetY = -140 * 25;
        reel.style.transition = 'transform 3.5s cubic-bezier(0.1, 1, 0.1, 1)';
        reel.style.transform = `translateY(${targetY}px)`;
    }, 50);

    setTimeout(() => {
        triggerWinnerCelebration(winnerName);
    }, 3700);
}

// --- Mystery Boxes ---
function renderMysteryBoxes() {
    const grid = document.getElementById('mysteryBoxGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (state.students.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-8">Add students to reveal gift boxes!</p>';
        return;
    }

    const count = Math.min(state.students.length, 12);
    for (let i = 0; i < count; i++) {
        const box = document.createElement('div');
        box.className = 'gift-box-animate p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition shadow-sm';
        box.innerHTML = `
            <i class="fa-solid fa-gift text-4xl text-blue-600 mb-2"></i>
            <span class="text-xs font-bold text-slate-700">Box #${i + 1}</span>
        `;
        box.onclick = () => revealMysteryBox(box);
        grid.appendChild(box);
    }
}

function revealMysteryBox(boxElement) {
    if (state.students.length === 0) return;
    window.soundEngine.playPop();

    const winnerName = state.students[Math.floor(Math.random() * state.students.length)];
    boxElement.className = 'p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-2 border-blue-300 flex flex-col items-center justify-center text-center shadow-lg transition';
    boxElement.innerHTML = `
        <i class="fa-solid fa-crown text-3xl text-amber-300 mb-1 animate-bounce"></i>
        <span class="text-base font-black">${escapeHtml(winnerName)}</span>
    `;

    setTimeout(() => {
        triggerWinnerCelebration(winnerName);
    }, 600);
}

// --- 3D Cards ---
function renderCards() {
    const grid = document.getElementById('cardsDeckGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const count = Math.min(state.students.length, 8);
    for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.className = 'card-container h-44 cursor-pointer';
        card.innerHTML = `
            <div class="card-inner w-full h-full relative rounded-2xl shadow-md">
                <div class="card-front absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 rounded-2xl flex flex-col items-center justify-center p-4">
                    <i class="fa-solid fa-sparkles text-3xl text-blue-400 mb-2"></i>
                    <span class="text-xs font-bold text-white">Card #${i + 1}</span>
                </div>
                <div class="card-back absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-amber-300 text-white">
                    <i class="fa-solid fa-star text-2xl text-amber-300 mb-1"></i>
                    <span class="card-student-name text-base font-extrabold"></span>
                </div>
            </div>
        `;
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    }
}

function flipCard(cardContainer) {
    const inner = cardContainer.querySelector('.card-inner');
    if (inner.classList.contains('flipped')) return;

    window.soundEngine.playPop();

    const winnerName = state.students[Math.floor(Math.random() * state.students.length)];
    cardContainer.querySelector('.card-student-name').innerText = winnerName;

    inner.classList.add('flipped');

    setTimeout(() => {
        triggerWinnerCelebration(winnerName);
    }, 800);
}

// --- Raffle Draw ---
function pickRaffleWinner() {
    if (state.students.length === 0) {
        alert('Please add students first!');
        return;
    }

    const ticket = document.getElementById('raffleTicketBox');
    if (!ticket) return;

    window.soundEngine.playChime();
    ticket.classList.add('animate-pulse', 'scale-105');

    setTimeout(() => {
        ticket.classList.remove('animate-pulse', 'scale-105');
        const winnerName = state.students[Math.floor(Math.random() * state.students.length)];
        triggerWinnerCelebration(winnerName);
    }, 1500);
}

// --- Winner Celebration ---
function triggerWinnerCelebration(winnerName) {
    addWinner(winnerName);
    window.soundEngine.playCelebrationFanfare();
    window.confettiEngine.fire({ particleCount: 220 });

    document.getElementById('winnerNameDisplay').innerText = winnerName;
    openModal('winnerModal');
}

function continueAfterWinner(remove) {
    closeModal('winnerModal');
    if (remove) {
        const currentWinnerName = document.getElementById('winnerNameDisplay').innerText;
        const idx = state.students.indexOf(currentWinnerName);
        if (idx !== -1) {
            state.students.splice(idx, 1);
            renderStudentList();
        }
    }
}

// --- Activity Timer ---
function initTimer() {
    updateTimerDisplay();
}

function toggleTimer() {
    if (state.timer.isRunning) {
        clearInterval(state.timer.interval);
        state.timer.isRunning = false;
        document.getElementById('timerToggleBtn').innerHTML = '<i class="fa-solid fa-play mr-1"></i> Start';
    } else {
        if (state.timer.seconds <= 0) state.timer.seconds = state.timer.initialSeconds;
        state.timer.isRunning = true;
        document.getElementById('timerToggleBtn').innerHTML = '<i class="fa-solid fa-pause mr-1"></i> Pause';
        
        state.timer.interval = setInterval(() => {
            state.timer.seconds--;
            updateTimerDisplay();

            if (state.timer.seconds <= 0) {
                clearInterval(state.timer.interval);
                state.timer.isRunning = false;
                document.getElementById('timerToggleBtn').innerHTML = '<i class="fa-solid fa-play mr-1"></i> Start';
                window.soundEngine.playTimerAlarm();
                window.confettiEngine.fire({ particleCount: 80 });
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(state.timer.interval);
    state.timer.isRunning = false;
    state.timer.seconds = state.timer.initialSeconds;
    document.getElementById('timerToggleBtn').innerHTML = '<i class="fa-solid fa-play mr-1"></i> Start';
    updateTimerDisplay();
}

function setTimerPreset(sec) {
    state.timer.initialSeconds = sec;
    state.timer.seconds = sec;
    resetTimer();
}

function updateTimerDisplay() {
    const mins = Math.floor(state.timer.seconds / 60);
    const secs = state.timer.seconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    const display = document.getElementById('timerDisplay');
    if (display) display.innerText = formatted;
}

// --- Team Generator ---
function generateTeams() {
    const countInput = document.getElementById('teamCountInput');
    const teamCount = parseInt(countInput.value) || 2;
    const outputContainer = document.getElementById('teamsOutputContainer');

    if (state.students.length === 0) {
        outputContainer.innerHTML = '<p class="text-center text-slate-400 py-4">Add students to roster first!</p>';
        return;
    }

    const shuffled = [...state.students];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const teams = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((student, idx) => {
        teams[idx % teamCount].push(student);
    });

    outputContainer.innerHTML = '';
    const styles = ['border-blue-300 bg-blue-50', 'border-purple-300 bg-purple-50', 'border-emerald-300 bg-emerald-50', 'border-amber-300 bg-amber-50', 'border-teal-300 bg-teal-50'];

    teams.forEach((team, idx) => {
        const card = document.createElement('div');
        card.className = `p-4 rounded-xl border ${styles[idx % styles.length]}`;
        card.innerHTML = `
            <h4 class="font-bold text-sm text-slate-900 mb-2 flex items-center justify-between">
                <span>Team ${idx + 1}</span>
                <span class="text-xs text-slate-500">${team.length} Members</span>
            </h4>
            <ul class="space-y-1">
                ${team.map(m => `<li class="text-xs text-slate-700 flex items-center space-x-2"><i class="fa-solid fa-user-tag text-[10px] text-slate-400"></i> <span>${escapeHtml(m)}</span></li>`).join('')}
            </ul>
        `;
        outputContainer.appendChild(card);
    });

    window.soundEngine.playChime();
}

// --- Preset Rosters Save / Load ---
function saveCurrentRoster() {
    const name = prompt('Enter a name for this roster preset (e.g., "Batch 10A"):');
    if (!name) return;

    state.savedRosters[name] = [...state.students];
    localStorage.setItem('savedRosters', JSON.stringify(state.savedRosters));
    alert(`Roster "${name}" saved successfully!`);
}

function loadSavedRosterPrompt() {
    const keys = Object.keys(state.savedRosters);
    if (keys.length === 0) {
        alert('No saved roster presets found. Save one first!');
        return;
    }

    const selected = prompt(`Select roster to load:\n${keys.join('\n')}`);
    if (selected && state.savedRosters[selected]) {
        state.students = [...state.savedRosters[selected]];
        renderStudentList();
        alert(`Loaded "${selected}" roster!`);
    }
}

// --- Utilities ---
function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('soundEnabled', state.soundEnabled);
    window.soundEngine.setMuted(!state.soundEnabled);

    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
        btn.innerHTML = state.soundEnabled ? 
            '<i class="fa-solid fa-volume-high text-blue-400"></i>' : 
            '<i class="fa-solid fa-volume-xmark text-slate-400"></i>';
    }
}

function toggleAutoRemove() {
    state.autoRemoveWinner = !state.autoRemoveWinner;
    localStorage.setItem('autoRemoveWinner', state.autoRemoveWinner);
    
    const btn = document.getElementById('autoRemoveToggleBtn');
    if (btn) {
        btn.className = state.autoRemoveWinner ? 
            'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300' : 
            'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300';
        btn.innerText = state.autoRemoveWinner ? 'Auto-Remove: ON' : 'Auto-Remove: OFF';
    }
}

function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('hidden');
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

function initUI() {
    document.getElementById('displayTrainerName').innerText = state.trainerName;
    document.getElementById('displaySessionTitle').innerText = state.sessionTitle;
    document.getElementById('trainerNameInput').value = state.trainerName;
    document.getElementById('sessionTitleInput').value = state.sessionTitle;

    window.soundEngine.setMuted(!state.soundEnabled);
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
        soundBtn.innerHTML = state.soundEnabled ? 
            '<i class="fa-solid fa-volume-high text-blue-400"></i>' : 
            '<i class="fa-solid fa-volume-xmark text-slate-400"></i>';
    }

    const autoBtn = document.getElementById('autoRemoveToggleBtn');
    if (autoBtn) {
        autoBtn.className = state.autoRemoveWinner ? 
            'px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300' : 
            'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300';
        autoBtn.innerText = state.autoRemoveWinner ? 'Auto-Remove: ON' : 'Auto-Remove: OFF';
    }
}
