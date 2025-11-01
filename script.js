document.addEventListener('DOMContentLoaded', () => {
            
    // --- DOM Elements ---
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const gameContainer = document.getElementById('game-container'); 
    const loadingScreen = document.getElementById('loading-screen'); 
    const difficultyLabel = document.getElementById('difficulty-label'); 
    const loginForm = document.getElementById('login-form'); // Added to define loginForm
    const usernameInput = document.getElementById('username'); // Added to define usernameInput

    // Game Elements
    const questionContainer = document.getElementById('question-container');
    const questionText = document.getElementById('question-text'); 
    const codeDisplay = document.querySelector('#code-display code');
    const optionsContainer = document.getElementById('options-container');
    const feedbackText = document.getElementById('feedback-text');
    const nextBtn = document.getElementById('next-btn');
    const scoreDisplay = document.getElementById('score'); 
    
    // XP/Level Elements
    const levelDisplay = document.getElementById('level-display');
    const xpProgressBar = document.getElementById('xp-progress-bar');
    const xpTargetDisplay = document.getElementById('xp-target');

    // Timer Elements (NEW)
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');

    // Explanation Modal Elements (NEW)
    const explanationModal = document.getElementById('explanation-modal');
    const nextFromExplanationBtn = document.getElementById('next-from-explanation-btn');
    const explanationTitle = document.getElementById('explanation-title');
    const explanationStatus = document.getElementById('explanation-status');
    const explanationConcept = document.getElementById('explanation-concept');
    const explanationText = document.getElementById('explanation-text');
    const explanationCodeTrace = document.getElementById('explanation-code-trace');
    
    // Results Elements
    const resultsContainer = document.getElementById('results-container');
    const restartBtn = document.getElementById('restart-btn');


    // --- Game State & Constants ---
    let currentQuestionIndex = 0;
    let score = 0;
    let level = 1;
    let xp = 0;
    const XP_PER_LEVEL = 300; 
    const XP_PER_QUESTION = 100;
    let answerSelected = false;
    let timerInterval = null;
    let timeLeft = 30;
    const initialTime = 30; // Time per question in seconds


    // --- Questions Database (with Explanation and Concept) ---
    const allQuestions = [
        {
            question: "What is the output of this list slicing?",
            code: "my_list = [1, 2, 3, 4, 5]\nprint(my_list[1:4:2])",
            options: ["[2, 4]", "[2, 3, 4]", "[1, 3, 5]", "[2]"],
            correctAnswer: 0,
            difficulty: 'easy',
            concept: 'List Slicing (Start:Stop:Step)',
            explanation: "The slice `[1:4:2]` starts at index 1 (value 2), stops *before* index 4 (value 5), and takes a step of 2. It selects index 1 (2) and index 3 (4)."
        },
        {
            question: "What does this list comprehension produce?",
            code: "squares = [x**2 for x in range(5)]\nprint(squares)",
            options: ["[0, 1, 4, 9, 16]", "[0, 1, 4, 9, 16, 25]", "[1, 4, 9, 16]", "[1, 2, 3, 4, 5]"],
            correctAnswer: 0,
            difficulty: 'medium',
            concept: 'List Comprehension & Range',
            explanation: "`range(5)` generates numbers 0, 1, 2, 3, 4. The comprehension squares each of those numbers: 0²=0, 1²=1, 2²=4, 3²=9, 4²=16."
        },
        {
            question: "What will be printed due to variable scope?",
            code: "x = 10\n\ndef func():\n    global x\n    x = 5\n    print(f'Inside: {x}')\n\nfunc()\nprint(f'Outside: {x}')",
            options: ["Inside: 5, Outside: 5", "Inside: 10, Outside: 10", "Inside: 5, Outside: 10", "Inside: 10, Outside: 5"],
            correctAnswer: 0,
            difficulty: 'hard',
            concept: 'Global Keyword',
            explanation: "The `global x` keyword inside `func()` forces the function to modify the global variable `x=10`. Therefore, the global `x` becomes 5, and both print statements output 5."
        },
        {
            question: "What is the content of `my_tuple` after this code executes?",
            code: "my_tuple = (1, 2, [3, 4])\ntry:\n    my_tuple[1] = 5\nexcept TypeError:\n    print('Tuple assignment failed')\n\nmy_tuple[2][0] = 99\nprint(my_tuple)",
            options: ["'Tuple assignment failed', (1, 2, [99, 4])", "'Tuple assignment failed', (1, 5, [99, 4])", "(1, 5, [99, 4])", "(1, 2, [3, 4])"],
            correctAnswer: 0,
            difficulty: 'master',
            concept: 'Tuple Immutability vs. Mutable Contents',
            explanation: "Tuples are immutable, so `my_tuple[1] = 5` raises a TypeError (which is caught and printed). However, the *list* inside the tuple (`my_tuple[2]`) is mutable, so `my_tuple[2][0] = 99` succeeds, modifying the list's content."
        },
        { question: "Dict.get() usage?", code: "person = {'name': 'Alex', 'age': 25}\nprint(person.get('job', 'Not Found'))", options: ["'Not Found'", "'job'", "KeyError", "None"], correctAnswer: 0, difficulty: 'easy', concept: 'Dictionary Methods', explanation: "The `.get()` method safely retrieves a value. Since 'job' is not a key, it returns the default value: 'Not Found'." },
        { question: "Lambda function", code: "x = lambda a, b : a * b\nprint(x(5, 6))", options: ["30", "11", "Lambda object", "Error"], correctAnswer: 0, difficulty: 'medium', concept: 'Lambda Functions', explanation: "A lambda is a small anonymous function. Here it takes two arguments (5 and 6) and returns their product (30)." },
        { question: "Default arguments", code: "def my_func(n=1):\n    return n * 2\n\nprint(my_func(3), my_func())", options: ["6 2", "6 1", "3 1", "Error"], correctAnswer: 0, difficulty: 'medium', concept: 'Function Default Arguments', explanation: "The first call passes 3, returning 6. The second call uses the default n=1, returning 2. The output is '6 2'." },
        { question: "Error Handling", code: "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')\nfinally:\n    print('Finished')", options: ["'Cannot divide by zero' followed by 'Finished'", "'Cannot divide by zero'", "'Finished'", "ZeroDivisionError"], correctAnswer: 0, difficulty: 'hard', concept: 'Try...Except...Finally', explanation: "The `try` block fails with a ZeroDivisionError, causing the `except` block to run. The `finally` block runs *regardless* of whether an exception occurred, so both messages print." },
        { question: "String formatting", code: "name = 'Alice'\nage = 30\nprint(f'{name} is {age * 2} years old.')", options: ["'Alice is 60 years old.'", "'Alice is {age * 2} years old.'", "'Alice is 30 years old.'", "SyntaxError"], correctAnswer: 0, difficulty: 'easy', concept: 'F-string Evaluation', explanation: "F-strings evaluate expressions inside the braces `{}`. Since `age` is 30, `age * 2` equals 60." }
    ];

    let currentQuestions = []; 


    // --- Syntax Highlighting Function (UNCHANGED) ---
    function highlightCode(code) {
        const keywords = /\b(def|for|while|if|else|elif|return|yield|try|except|finally|import|from|class|global|nonlocal|with|as)\b/g;
        const builtins = /\b(print|range|len|sum|list|tuple|dict|set|lambda|None|True|False)\b/g;
        const strings = /('|")(\\\1|.)*?\1/g;
        const comments = /#.*/g;
        const numbers = /\b\d+(\.\d+)?\b/g;
        const operators = /[\+\-\*\/=><!&\|%]/g;

        let highlighted = code
            .replace(strings, (match) => `<span class="string">${match}</span>`)
            .replace(comments, (match) => `<span class="comment">${match}</span>`)
            .replace(keywords, (match) => `<span class="keyword">${match}</span>`)
            .replace(builtins, (match) => `<span class="builtin">${match}</span>`)
            .replace(numbers, (match) => `<span class="number">${match}</span>`)
            .replace(operators, (match) => `<span class="operator">${match}</span>`);

        return highlighted;
    }
    
    // --- XP & Level Logic (UNCHANGED) ---
    function updateXPDisplay() {
        const xpForLevel = xp % XP_PER_LEVEL;
        const xpProgress = (xpForLevel / XP_PER_LEVEL) * 100;
        levelDisplay.textContent = level;
        xpProgressBar.style.width = `${xpProgress}%`;
        xpTargetDisplay.textContent = `${xpForLevel} / ${XP_PER_LEVEL}`;
    }

    function gainXP() {
        xp += XP_PER_QUESTION;
        score++;
        scoreDisplay.textContent = score;
        xpTargetDisplay.classList.add('animate-score-pop');
        scoreDisplay.classList.add('animate-score-pop');

        if (xp >= level * XP_PER_LEVEL) {
            level++;
            feedbackText.textContent = `LEVEL UP! You are now Level ${level}!`;
            feedbackText.className = 'text-lg font-medium text-center text-yellow-500 animate-bounce-in';
        }
        
        updateXPDisplay();

        setTimeout(() => {
            xpTargetDisplay.classList.remove('animate-score-pop');
            scoreDisplay.classList.remove('animate-score-pop');
        }, 200);
    }

    // --- Timer Functions (UNCHANGED) ---
    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = initialTime;
        timerBar.style.width = '100%';
        timerBar.classList.remove('bg-red-900');
        timerBar.classList.add('bg-red-600');
        timerText.textContent = `${timeLeft}s`;

        timerInterval = setInterval(() => {
            timeLeft--;
            const percent = (timeLeft / initialTime) * 100;
            
            timerBar.style.width = `${percent}%`;
            timerText.textContent = `${timeLeft}s`;

            if (percent < 30) {
                 timerBar.classList.remove('bg-red-600');
                 timerBar.classList.add('bg-red-900'); // Deeper red for urgency
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // Force incorrect answer if time runs out
                selectAnswer({ target: { dataset: { index: -1 } } }, true); 
                feedbackText.textContent = "TIME OUT! You ran out of time.";
                feedbackText.className = 'text-lg font-medium text-center text-red-500 animate-bounce-in';
            }
        }, 1000);
    }
    
    // --- Code Copy Function (UNCHANGED) ---
    const copyBtn = document.getElementById('copy-btn');
    const copyIcon = document.getElementById('copy-icon');
    const checkIcon = document.getElementById('check-icon');
    
    copyBtn.addEventListener('click', async () => {
        const code = codeDisplay.textContent;
        try {
            // Note: document.execCommand is used for broader compatibility in some browser environments
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            copyIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');
            copyBtn.style.backgroundColor = '#22c55e'; // Green for success
            
            setTimeout(() => {
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
                copyBtn.style.backgroundColor = ''; // Reset
            }, 1000);

        } catch (err) {
            console.error('Failed to copy code: ', err);
            // Fallback for environments where navigator.clipboard might fail
            const codeToCopy = codeDisplay.textContent;
            const tempInput = document.createElement('input');
            tempInput.value = codeToCopy;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            copyIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');
            copyBtn.style.backgroundColor = '#22c55e'; 
            
            setTimeout(() => {
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
                copyBtn.style.backgroundColor = '';
            }, 1000);
        }
    });

    // --- Login/Startup Flow (FIXED) ---
    // NOTE: This function's logic is critical for page state management.
    
    // 1. New Login Handling: Redirect directly to difficulty.html
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const username = usernameInput.value;
            if (username.trim() === '') {
                usernameInput.classList.add('shake');
                setTimeout(() => usernameInput.classList.remove('shake'), 500);
                return;
            }
            
            // 1. Store Username
            localStorage.setItem('questUsername', username);
            
            // 2. Hide Login, Show Loading Screen
            loginContainer.classList.add('hidden');
            loadingScreen.classList.remove('hidden');

            // 3. Redirect directly to Difficulty Page after load
            setTimeout(() => {
                window.location.href = 'difficulty.html'; 
            }, 1500);
        });
    }


    function checkLoginAndDifficulty() {
        const storedUsername = localStorage.getItem('questUsername');
        const storedDifficulty = localStorage.getItem('questDifficulty');

        // This function now controls the page state upon arrival at index.html
        if (storedUsername && storedDifficulty) {
            // State: Ready to play. Show the game content (which is already visible by default in the new HTML).
            usernameDisplay.textContent = storedUsername;
            mainContent.classList.remove('hidden'); // Ensure game is visible
            loginContainer.classList.add('hidden'); // Ensure login is hidden
            startGame(storedDifficulty);
        } else if (storedUsername && !storedDifficulty) {
            // State: Logged in, but must choose difficulty.
            window.location.href = 'difficulty.html';
        } else {
            // State: Not logged in. Redirect to index.html (which will display the login form).
            // Since we removed the initial redirect script from the HTML head, we now do it here.
            
            // Hide the game content (which is visible by default in new HTML)
            mainContent.classList.add('hidden');
            // Show the login form
            loginContainer.classList.remove('hidden'); 
        }
    }

    logoutBtn.addEventListener('click', () => {
        // Perform a clean state reset and redirect to the difficulty chooser.
        localStorage.removeItem('questUsername');
        localStorage.removeItem('questDifficulty');
        clearInterval(timerInterval);

        mainContent.classList.add('animate-fadeOutUp'); 
        setTimeout(() => {
            window.location.href = 'index.html'; // Redirect to index.html (which will display login)
        }, 300);
    });


    // --- Game Functions (BUG FIX APPLIED) ---
    function startGame(difficulty) {
        currentQuestionIndex = 0;
        score = 0;
        level = 1;
        xp = 0;
        answerSelected = false;
        resultsContainer.classList.add('hidden');

        // Filter questions based on difficulty
        currentQuestions = allQuestions.filter(q => {
             if (difficulty === 'master') return true;
             return q.difficulty === difficulty;
        });
        
        // Error check: If no questions match, use a default
        if (currentQuestions.length === 0) {
             currentQuestions = allQuestions.filter(q => q.difficulty === 'easy');
        }
        
        difficultyLabel.textContent = `Difficulty: ${difficulty.toUpperCase()}`;

        updateXPDisplay();
        scoreDisplay.textContent = score;
        loadQuestion();
    }

    function loadQuestion() {
        if (currentQuestionIndex >= currentQuestions.length) {
            showResults();
            return;
        }

        answerSelected = false;
        feedbackText.textContent = '';
        nextBtn.style.display = 'none';
        optionsContainer.innerHTML = '';
        explanationModal.classList.add('hidden'); 
        
        questionContainer.classList.remove('animate-question-enter');
        void questionContainer.offsetWidth;
        questionContainer.classList.add('animate-question-enter');

        const question = currentQuestions[currentQuestionIndex]; 
        
        // Start the timer
        startTimer();

        // **CRITICAL BUG FIX:** Using the global 'questionText' element directly
        questionText.textContent = question.question; 
        codeDisplay.innerHTML = highlightCode(question.code); 
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerHTML = option.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
            button.classList.add(
                'option-btn', 'w-full', 'p-4', 'rounded-lg', 'border-2', 
                'bg-gray-700', 
                'border-gray-600', 
                'text-left', 'interactive-btn'
            );
            button.dataset.index = index;
            button.setAttribute('tabindex', index + 1); 
            button.addEventListener('click', selectAnswer);
            
            button.style.animationDelay = `${index * 100}ms`;
            button.classList.add('animate-fadeInUp');
            
            optionsContainer.appendChild(button);
        });
    }

    function selectAnswer(e, isTimeout = false) {
        if (answerSelected) return; 
        answerSelected = true;
        clearInterval(timerInterval); 

        const selectedIndex = isTimeout ? -1 : parseInt(e.target.dataset.index);
        const correctIndex = currentQuestions[currentQuestionIndex].correctAnswer;
        const isCorrect = selectedIndex === correctIndex;

        let clickedButton = isTimeout ? null : e.target;
        
        // 1. Visually lock all options
        Array.from(optionsContainer.children).forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-70');
            btn.classList.remove('interactive-btn'); 
        });

        // 2. Determine Outcome
        if (isCorrect) {
            gainXP();
            if (clickedButton) clickedButton.classList.add('correct', 'pulse', 'ripple-active');
            feedbackText.textContent = feedbackText.textContent.includes("LEVEL UP") ? feedbackText.textContent : "Correct! Well done.";
            feedbackText.className = 'text-lg font-medium text-center text-green-500 animate-bounce-in';
        } else {
            if (clickedButton) clickedButton.classList.add('incorrect', 'shake', 'ripple-active');
            
            // Show the correct answer
            const correctBtn = optionsContainer.querySelector(`[data-index='${correctIndex}']`);
            if (correctBtn) correctBtn.classList.add('correct');
            
            // Set error feedback
            feedbackText.textContent = isTimeout ? "Time Out! See the explanation." : "Not quite! See the explanation.";
            feedbackText.className = 'text-lg font-medium text-center text-red-500 animate-bounce-in';
        }
        
        // 3. Show Explanation Modal 
        setTimeout(() => showExplanationModal(isCorrect, selectedIndex), isTimeout ? 500 : 800);
    }

    function showExplanationModal(isCorrect, selectedIndex) {
        const question = currentQuestions[currentQuestionIndex];
        
        // Fill Status and Title
        if (isCorrect) {
            explanationStatus.textContent = "Status: Correct Answer!";
            explanationStatus.classList.remove('text-red-400');
            explanationStatus.classList.add('text-green-400');
            explanationTitle.textContent = "Correct";
        } else {
            explanationStatus.textContent = "Status: Incorrect / Time Out";
            explanationStatus.classList.remove('text-green-400');
            explanationStatus.classList.add('text-red-400');
            explanationTitle.textContent = "Review";
        }

        // Fill Explanation Content
        explanationConcept.textContent = question.concept;
        explanationText.textContent = question.explanation;
        explanationCodeTrace.textContent = question.code; 

        // Show Modal
        explanationModal.classList.remove('hidden');
        
        nextFromExplanationBtn.focus();
    }
    
    // Continue button handler for Explanation Modal
    nextFromExplanationBtn.addEventListener('click', showNextQuestion);

    function showNextQuestion() {
        explanationModal.classList.add('hidden'); 
        gameContainer.classList.add('animate-fadeOut');

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < currentQuestions.length) {
                loadQuestion();
            } else {
                showResults();
            }
            
            gameContainer.classList.remove('animate-fadeOut');
            gameContainer.classList.add('animate-fadeIn');
        }, 300);
    }
    
    function showResults() {
        finalScore.textContent = score;
        finalLevel.textContent = level;
        
        let message = '';
        const percentage = (score / currentQuestions.length) * 100;
        if (percentage === 100) {
            message = "Python Mastery Achieved! You crushed the Code Quest.";
        } else if (percentage >= 75) {
            message = "Excellent work! Your Python skills are highly advanced.";
        } else if (percentage >= 50) {
            message = "Strong effort! Keep practicing to reach the next level.";
        } else {
            message = "Code Quest complete! Time to review those concepts.";
        }
        finalMessage.textContent = message;

        resultsContainer.classList.remove('hidden');
        resultsContainer.classList.add('animate-results-modal'); 
        
        restartBtn.focus();
    }
    
    // --- Keyboard Navigation Handler (UNCHANGED) ---
    document.addEventListener('keydown', (e) => {
        if (!mainContent.classList.contains('hidden') && !answerSelected) {
            const optionBtns = optionsContainer.querySelectorAll('.option-btn');
            
            if (e.key >= '1' && e.key <= optionBtns.length.toString()) {
                const index = parseInt(e.key) - 1;
                optionBtns[index].click();
            }
        }
    });

    // --- Event Listeners (UNCHANGED) ---
    nextBtn.addEventListener('click', showNextQuestion);
    restartBtn.addEventListener('click', () => {
        localStorage.removeItem('questDifficulty');
        window.location.href = 'index.html'; 
    });
    
    // Initial check to load the right content
    checkLoginAndDifficulty();

});