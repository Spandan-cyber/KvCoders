document.addEventListener('DOMContentLoaded', () => {
            
    // --- DOM Elements ---
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');
    const mainContent = document.getElementById('main-content');
    const usernameInput = document.getElementById('username');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const gameContainer = document.getElementById('game-container'); 
    const loadingScreen = document.getElementById('loading-screen'); 

    // Game Elements
    const difficultyLabel = document.getElementById('difficulty-label'); // NEW
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
    
    // Results Elements
    const resultsContainer = document.getElementById('results-container');
    const finalScore = document.getElementById('final-score');
    const finalLevel = document.getElementById('final-level');
    const finalMessage = document.getElementById('final-message');
    const restartBtn = document.getElementById('restart-btn');

    // --- Game State ---
    let currentQuestionIndex = 0;
    let score = 0;
    let level = 1;
    let xp = 0;
    const XP_PER_LEVEL = 300; 
    const XP_PER_QUESTION = 100;
    let answerSelected = false;

    // --- Questions Database (This array would be filtered/expanded based on difficulty) ---
    const allQuestions = [
        // Easy-level questions (simple syntax)
        {
            question: "What is the output of this list slicing?",
            code: "my_list = [1, 2, 3, 4, 5]\nprint(my_list[1:4:2])",
            options: ["[2, 3, 4]", "[2, 4]", "[1, 3, 5]", "[2]"],
            correctAnswer: 1,
            difficulty: 'easy'
        },
        // Medium-level questions (list comprehension)
        {
            question: "What does this list comprehension produce?",
            code: "squares = [x**2 for x in range(5)]\nprint(squares)",
            options: ["[0, 1, 4, 9, 16, 25]", "[1, 4, 9, 16]", "[0, 1, 4, 9, 16]", "[1, 2, 3, 4, 5]"],
            correctAnswer: 2,
            difficulty: 'medium'
        },
        // Hard-level question (global keyword/scope)
        {
            question: "What will be printed due to variable scope?",
            code: "x = 10\n\ndef func():\n    global x\n    x = 5\n    print(f'Inside: {x}')\n\nfunc()\nprint(f'Outside: {x}')",
            options: ["Inside: 5, Outside: 5", "Inside: 10, Outside: 10", "Inside: 5, Outside: 10", "Inside: 10, Outside: 5"],
            correctAnswer: 0,
            difficulty: 'hard'
        },
        // Master-level question (tuple immutability with mutable contents)
        {
            question: "What is the content of `my_tuple` after this code executes?",
            code: "my_tuple = (1, 2, [3, 4])\ntry:\n    my_tuple[1] = 5\nexcept TypeError:\n    print('Tuple assignment failed')\n\nmy_tuple[2][0] = 99\nprint(my_tuple)",
            options: ["'Tuple assignment failed', (1, 5, [99, 4])", "'Tuple assignment failed', (1, 2, [99, 4])", "(1, 5, [99, 4])", "(1, 2, [3, 4])"],
            correctAnswer: 1,
            difficulty: 'master'
        },
        // ... (Add more questions with appropriate difficulty tags here) ...
        { question: "Dict.get() usage?", code: "person = {'name': 'Alex', 'age': 25}\nprint(person.get('job', 'Not Found'))", options: ["'job'", "KeyError", "None", "'Not Found'"], correctAnswer: 3, difficulty: 'easy' },
        { question: "Lambda function", code: "x = lambda a, b : a * b\nprint(x(5, 6))", options: ["30", "11", "Lambda object", "Error"], correctAnswer: 0, difficulty: 'medium' },
        { question: "Default arguments", code: "def my_func(n=1):\n    return n * 2\n\nprint(my_func(3), my_func())", options: ["6 1", "3 1", "6 2", "Error"], correctAnswer: 2, difficulty: 'medium' },
        { question: "Error Handling", code: "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')\nfinally:\n    print('Finished')", options: ["'Cannot divide by zero'", "'Finished'", "'Cannot divide by zero' followed by 'Finished'", "ZeroDivisionError"], correctAnswer: 2, difficulty: 'hard' },
        { question: "String formatting", code: "name = 'Alice'\nage = 30\nprint(f'{name} is {age * 2} years old.')", options: ["'Alice is {age * 2} years old.'", "'Alice is 30 years old.'", "'Alice is 60 years old.'", "SyntaxError"], correctAnswer: 2, difficulty: 'easy' }
    ];

    let currentQuestions = []; // Array of questions for the current difficulty

    // --- Syntax Highlighting Function ---
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
    
    // --- Initial Setup and Login Flow (UPDATED) ---

    // Function to check login state on page load
    function checkLoginAndDifficulty() {
        const storedUsername = localStorage.getItem('questUsername');
        const storedDifficulty = localStorage.getItem('questDifficulty');

        if (storedUsername && storedDifficulty) {
            // User is logged in AND has chosen a difficulty
            usernameDisplay.textContent = storedUsername;
            loginContainer.classList.add('hidden');
            mainContent.classList.remove('hidden');
            startGame(storedDifficulty);
        } else if (storedUsername) {
            // User is logged in but needs to choose difficulty (Should be redirected by HTML)
        } else {
            // User needs to log in first
            // Note: HTML script should handle redirection to difficulty.html if needed.
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const username = usernameInput.value;
        if (username.trim() === '') {
            usernameInput.classList.add('shake');
            setTimeout(() => usernameInput.classList.remove('shake'), 500);
            return;
        }

        // Store Username and redirect to Difficulty Page
        localStorage.setItem('questUsername', username);

        // 1. Hide Login, Show Loading Screen
        loginContainer.classList.add('hidden');
        loadingScreen.classList.remove('hidden');

        // 2. Simulate Initialization Time then redirect
        setTimeout(() => {
            window.location.href = 'difficulty.html';
        }, 1500); 
    });

    logoutBtn.addEventListener('click', () => {
        // Clear both username and difficulty on logout
        localStorage.removeItem('questUsername');
        localStorage.removeItem('questDifficulty');

        mainContent.classList.add('animate-fadeOutUp'); 
        setTimeout(() => {
            window.location.href = 'index.html'; // Redirect back to clean login page
        }, 300);
    });


    // --- Game Functions (UPDATED) ---
    function startGame(difficulty) {
        currentQuestionIndex = 0;
        score = 0;
        level = 1;
        xp = 0;
        answerSelected = false;
        resultsContainer.classList.add('hidden');

        // Filter questions based on difficulty
        if (difficulty !== 'master') {
             currentQuestions = allQuestions.filter(q => q.difficulty === difficulty);
        } else {
            // Master gets all questions
            currentQuestions = allQuestions; 
        }
        
        // Ensure there are questions to load
        if (currentQuestions.length === 0) {
            currentQuestions = allQuestions.filter(q => q.difficulty === 'easy'); // Fallback
        }
        
        difficultyLabel.textContent = `Difficulty: ${difficulty.toUpperCase()}`;

        updateXPDisplay();
        scoreDisplay.textContent = score;
        loadQuestion();
    }

    function loadQuestion() {
        // Check if all questions are completed before trying to load a new one
        if (currentQuestionIndex >= currentQuestions.length) {
            showResults();
            return;
        }

        answerSelected = false;
        feedbackText.textContent = '';
        nextBtn.style.display = 'none';
        optionsContainer.innerHTML = '';
        
        questionContainer.classList.remove('animate-question-enter');
        void questionContainer.offsetWidth;
        questionContainer.classList.add('animate-question-enter');

        const question = currentQuestions[currentQuestionIndex]; // Use currentQuestions
        
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
            button.addEventListener('click', selectAnswer);
            
            button.style.animationDelay = `${index * 100}ms`;
            button.classList.add('animate-fadeInUp');
            
            optionsContainer.appendChild(button);
        });
    }

    function selectAnswer(e) {
        if (answerSelected) return; 
        answerSelected = true;

        const selectedButton = e.target;
        const selectedIndex = parseInt(selectedButton.dataset.index);
        const correctIndex = currentQuestions[currentQuestionIndex].correctAnswer;

        selectedButton.classList.add('ripple-active');
        setTimeout(() => selectedButton.classList.remove('ripple-active'), 500);

        Array.from(optionsContainer.children).forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-70');
            btn.classList.remove('interactive-btn'); 
        });

        if (selectedIndex === correctIndex) {
            gainXP();
            selectedButton.classList.add('correct', 'pulse');
            if (!feedbackText.textContent.includes("LEVEL UP")) {
                feedbackText.textContent = "Correct! Well done.";
                feedbackText.className = 'text-lg font-medium text-center text-green-500 animate-bounce-in';
            }
        } else {
            selectedButton.classList.add('incorrect', 'shake');
            feedbackText.textContent = "Not quite! Here's the right answer:";
            feedbackText.className = 'text-lg font-medium text-center text-red-500 animate-bounce-in';
            
            const correctBtn = optionsContainer.querySelector(`[data-index='${correctIndex}']`);
            if (correctBtn) {
                correctBtn.classList.add('correct');
            }
        }

        setTimeout(() => {
            nextBtn.style.display = 'block';
            nextBtn.classList.add('animate-fadeIn');
        }, 500);
    }

    function showNextQuestion() {
        gameContainer.classList.add('animate-fadeOut');
        nextBtn.classList.remove('animate-fadeIn');

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
    }

    // --- Event Listeners ---
    nextBtn.addEventListener('click', showNextQuestion);
    restartBtn.addEventListener('click', () => {
        // Go back to difficulty selection to start a new quest
        localStorage.removeItem('questDifficulty');
        window.location.href = 'difficulty.html'; 
    });
    
    // Initial check to load the right content
    checkLoginAndDifficulty();

});