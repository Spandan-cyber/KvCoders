document.addEventListener('DOMContentLoaded', () => {
            
    // --- DOM Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    
    // Login Elements
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    
    // Main Content Elements
    const mainContent = document.getElementById('main-content');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const gameContainer = document.getElementById('game-container'); // Get game container
    const mainTitle = document.querySelector('h1.neon-text'); // Main title

    // Game Elements
    const questionContainer = document.getElementById('question-container'); // New: for question animation
    const questionText = document.getElementById('question-text');
    const codeDisplay = document.querySelector('#code-display code');
    const optionsContainer = document.getElementById('options-container');
    const feedbackText = document.getElementById('feedback-text');
    const nextBtn = document.getElementById('next-btn');
    const scoreDisplay = document.getElementById('score');
    const progressBar = document.getElementById('progress-bar');
    
    // Results Elements
    const resultsContainer = document.getElementById('results-container');
    const finalScore = document.getElementById('final-score');
    const finalMessage = document.getElementById('final-message');
    const restartBtn = document.getElementById('restart-btn');

    // --- Questions Database ---
    const questions = [
        {
            question: "What is the output of this list slicing?",
            code: "my_list = [1, 2, 3, 4, 5]\nprint(my_list[1:4:2])",
            options: ["[2, 3, 4]", "[2, 4]", "[1, 3, 5]", "[2]"],
            correctAnswer: 1
        },
        {
            question: "What does this list comprehension produce?",
            code: "squares = [x**2 for x in range(5)]\nprint(squares)",
            options: ["[0, 1, 4, 9, 16, 25]", "[1, 4, 9, 16]", "[0, 1, 4, 9, 16]", "[1, 2, 3, 4, 5]"],
            correctAnswer: 2
        },
        {
            question: "What will be printed from this dictionary?",
            code: "person = {'name': 'Alex', 'age': 25}\nprint(person.get('job', 'Not Found'))",
            options: ["'job'", "KeyError", "None", "'Not Found'"],
            correctAnswer: 3
        },
        {
            question: "What is the output of this lambda function?",
            code: "x = lambda a, b : a * b\nprint(x(5, 6))",
            options: ["30", "11", "Lambda object", "Error"],
            correctAnswer: 0
        },
        {
            question: "What is the output of this code snippet?",
            code: "def my_func(n=1):\n    return n * 2\n\nprint(my_func(3), my_func())",
            options: ["6 1", "3 1", "6 2", "Error"],
            correctAnswer: 2
        },
        {
            question: "What will be printed due to variable scope?",
            code: "x = 10\n\ndef func():\n    x = 5\n    print(f'Inside: {x}')\n\nfunc()\nprint(f'Outside: {x}')",
            options: ["Inside: 5, Outside: 5", "Inside: 10, Outside: 10", "Inside: 5, Outside: 10", "Inside: 10, Outside: 5"],
            correctAnswer: 2
        },
        {
            question: "What is the output of this class method call?",
            code: "class Car:\n    def __init__(self, make):\n        self.make = make\n\n    def get_make(self):\n        return self.make\n\nmy_car = Car('Tesla')\nprint(my_car.get_make())",
            options: ["'Tesla'", "my_car.make", "self.make", "Error"],
            correctAnswer: 0
        },
        {
            question: "What does this `try...except` block print?",
            code: "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')\nfinally:\n    print('Finished')",
            options: ["'Cannot divide by zero'", "'Finished'", "'Cannot divide by zero' followed by 'Finished'", "ZeroDivisionError"],
            correctAnswer: 2
        },
        {
            question: "What will this string formatting produce?",
            code: "name = 'Alice'\nage = 30\nprint(f'{name} is {age * 2} years old.')",
            options: ["'Alice is {age * 2} years old.'", "'Alice is 30 years old.'", "'Alice is 60 years old.'", "SyntaxError"],
            correctAnswer: 2
        },
        {
            question: "What is the output of `*args`?",
            code: "def summer(*args):\n    total = 0\n    for num in args:\n        total += num\n    return total\n\nprint(summer(1, 2, 3))",
            options: ["(1, 2, 3)", "6", "[1, 2, 3]", "Error"],
            correctAnswer: 1
        },
        {
            question: "What is the output of `**kwargs`?",
            code: "def greet(**kwargs):\n    if 'name' in kwargs:\n        print(f\"Hello, {kwargs['name']}\")\n    else:\n        print('Hello, Guest')\n\ngreet(name='Spandan', age=25)",
            options: ["'Hello, Guest'", "'Hello, Spandan'", "{'name': 'Spandan', 'age': 25}", "Error"],
            correctAnswer: 1
        },
        {
            question: "What is the content of `my_tuple` after this code executes?",
            code: "my_tuple = (1, 2, [3, 4])\ntry:\n    my_tuple[1] = 5\nexcept TypeError:\n    print('Tuple assignment failed')\n\nmy_tuple[2][0] = 99\nprint(my_tuple)",
            options: ["'Tuple assignment failed', (1, 5, [99, 4])", "'Tuple assignment failed', (1, 2, [99, 4])", "(1, 5, [99, 4])", "(1, 2, [3, 4])"],
            correctAnswer: 1 
        }
    ];

    // --- Game State ---
    let currentQuestionIndex = 0;
    let score = 0;
    let answerSelected = false;

    // --- Theme Toggle Logic ---
    const applyTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            themeIconSun.classList.remove('hidden');
            themeIconMoon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            themeIconSun.classList.add('hidden');
            themeIconMoon.classList.remove('hidden');
        }
    };

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        document.documentElement.classList.toggle('light', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        applyTheme(isDark);
    });

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    applyTheme(isDark);
    
    // --- Login/Logout Logic ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const username = usernameInput.value;
        if (username.trim() === '') {
            usernameInput.classList.add('shake');
            setTimeout(() => usernameInput.classList.remove('shake'), 500);
            return;
        }

        usernameDisplay.textContent = username;
        loginContainer.classList.add('hidden');
        
        mainContent.classList.remove('hidden');
        mainContent.classList.add('animate-fadeInUp'); 
        
        // Ensure title animation plays on login
        mainTitle.classList.remove('animate-title-entry'); // Reset animation
        void mainTitle.offsetWidth; // Trigger reflow
        mainTitle.classList.add('animate-title-entry'); 

        startGame(); 
    });

    logoutBtn.addEventListener('click', () => {
        // NEW: Animate main content fading out upwards
        mainContent.classList.add('animate-fadeOutUp'); 
        mainContent.classList.remove('animate-fadeInUp');

        setTimeout(() => {
            mainContent.classList.add('hidden');
            mainContent.classList.remove('animate-fadeOutUp'); // Clean up class
            loginContainer.classList.remove('hidden');
            loginContainer.classList.add('animate-fadeIn'); 
            usernameInput.value = '';
            setTimeout(() => loginContainer.classList.remove('animate-fadeIn'), 300);
        }, 300); // Match fadeOutUp duration
    });


    // --- Game Functions ---
    function startGame() {
        currentQuestionIndex = 0;
        score = 0;
        answerSelected = false;
        resultsContainer.classList.add('hidden');
        resultsContainer.classList.remove('modal-fade-in');
        scoreDisplay.textContent = score;
        loadQuestion();
    }

    function loadQuestion() {
        answerSelected = false;
        feedbackText.textContent = '';
        nextBtn.style.display = 'none';
        optionsContainer.innerHTML = ''; // Clear previous options
        
        // NEW: Reset and trigger question entry animation
        questionContainer.classList.remove('animate-question-enter');
        void questionContainer.offsetWidth; // Trigger reflow
        questionContainer.classList.add('animate-question-enter');

        const question = questions[currentQuestionIndex];
        
        questionText.textContent = question.question;
        codeDisplay.textContent = question.code;
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerHTML = option.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
            button.classList.add(
                'option-btn', 'w-full', 'p-4', 'rounded-lg', 'border-2', 
                'bg-orange-50', 'dark:bg-gray-700', 
                'border-orange-300', 'dark:border-gray-600',
                'hover:bg-orange-100', 'dark:hover:bg-gray-600',
                'text-left', 'interactive-btn' // Added interactive-btn for hover effects
            );
            button.dataset.index = index;
            button.addEventListener('click', selectAnswer);
            
            // Apply staggered animation
            button.style.animationDelay = `${index * 100}ms`;
            button.classList.add('animate-fadeInUp');
            
            optionsContainer.appendChild(button);
        });

        const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // NEW: Animate progress bar if it just hit 100%
        if (progressPercent === 100 && questions.length > 0) {
            progressBar.classList.add('animate-progress-flash');
            setTimeout(() => {
                progressBar.classList.remove('animate-progress-flash');
            }, 600); // Match animation duration
        }
    }

    function selectAnswer(e) {
        if (answerSelected) return; 
        answerSelected = true;

        const selectedButton = e.target;
        const selectedIndex = parseInt(selectedButton.dataset.index);
        const correctIndex = questions[currentQuestionIndex].correctAnswer;

        Array.from(optionsContainer.children).forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-70');
            btn.classList.remove('interactive-btn'); // Disable hover effect after selection
        });

        if (selectedIndex === correctIndex) {
            score++;
            // NEW: Score pop animation
            scoreDisplay.textContent = score;
            scoreDisplay.classList.add('animate-score-pop');
            setTimeout(() => scoreDisplay.classList.remove('animate-score-pop'), 200);

            selectedButton.classList.add('correct', 'pulse');
            feedbackText.textContent = "Correct! Well done!";
            // NEW: Feedback bounce animation
            feedbackText.className = 'text-lg font-medium text-center text-green-500 animate-bounce-in';
        } else {
            selectedButton.classList.add('incorrect', 'shake');
            feedbackText.textContent = "Not quite! Here's the right answer:";
            // NEW: Feedback bounce animation
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
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                showResults();
            }
            
            gameContainer.classList.remove('animate-fadeOut');
            gameContainer.classList.add('animate-fadeIn');
        }, 300);
    }
    
    function showResults() {
        progressBar.style.width = '100%';
        // Ensure progress bar flash if not already done
        progressBar.classList.add('animate-progress-flash');
        setTimeout(() => {
            progressBar.classList.remove('animate-progress-flash');
        }, 600);
        
        finalScore.textContent = score;
        
        let message = '';
        const percentage = (score / questions.length) * 100;
        if (percentage === 100) {
            message = "Flawless! You're a Python Master!";
        } else if (percentage >= 75) {
            message = "Great job! You really know your stuff.";
        } else if (percentage >= 50) {
            message = "Good effort! A little more practice and you'll be a pro.";
        } else {
            message = "Keep practicing! Every expert was once a beginner.";
        }
        finalMessage.textContent = message;

        resultsContainer.classList.remove('hidden');
        // Changed to new modal animation class
        resultsContainer.classList.add('animate-results-modal'); 
    }

    // --- Event Listeners ---
    nextBtn.addEventListener('click', showNextQuestion);
    restartBtn.addEventListener('click', startGame);

});