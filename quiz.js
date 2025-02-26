document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const loginError = document.getElementById('login-error');
    const loginContainer = document.getElementById('login-container');
    const quizContainer = document.getElementById('quiz-container');
    const roundTitle = document.getElementById('round-title');
    const questionContainer = document.getElementById('question-container');
    const nextBtn = document.getElementById('next-btn');
    const timerDisplay = document.getElementById('time');
    const resultContainer = document.getElementById('result-container');
    const scoreDisplay = document.getElementById('score-display');
    const admissionDisplay = document.getElementById('admission-display');
  
    let quizData = null;
    let currentRoundIndex = 0;
    let currentQuestionIndex = 0;
    let score = 0;
    let totalMarks = 0;
    let timer;
    let timeLeft = 0;
    let currentRoundMarks = 0;
    let currentRoundTotalQuestions = 0;
  
    // Updated email validation regex: accepts both "vit.edu" and "vitstudent.ac.in" domains.
    const vitEmailRegex = /^[a-zA-Z0-9._%+-]+@(vit\.[a-zA-Z]+|vitstudent\.ac\.in)$/;
  
    // Validate login email
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!vitEmailRegex.test(email)) {
        loginError.textContent = "Please enter a valid VIT email address.";
        return;
      }
      loginError.textContent = "";
      loginContainer.style.display = 'none';
      quizContainer.style.display = 'block';
      loadQuizData();
    });
  
    // Load quiz data from XML file (quiz.xml)
    function loadQuizData() {
      fetch('quiz.xml')
        .then(response => response.text())
        .then(data => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, "application/xml");
          quizData = xmlDoc.getElementsByTagName('round');
          // Calculate total marks from all rounds
          for (let i = 0; i < quizData.length; i++) {
            totalMarks += parseInt(quizData[i].getAttribute('marks'));
          }
          startRound();
        })
        .catch(error => {
          console.error("Error loading quiz data:", error);
        });
    }
  
    // Start the current round
    function startRound() {
      if (currentRoundIndex >= quizData.length) {
        endQuiz();
        return;
      }
      const round = quizData[currentRoundIndex];
      roundTitle.textContent = round.getAttribute('title');
      // Get time (in minutes) and convert to seconds
      timeLeft = parseInt(round.getAttribute('time')) * 60;
      currentRoundMarks = parseInt(round.getAttribute('marks'));
      currentRoundTotalQuestions = round.getElementsByTagName('question').length;
      currentQuestionIndex = 0;
      startTimer();
      showQuestion();
    }
  
    // Start the timer for the round
    function startTimer() {
      clearInterval(timer);
      updateTimerDisplay();
      timer = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
          clearInterval(timer);
          nextRound();
        }
      }, 1000);
    }
  
    function updateTimerDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.textContent = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }
  
    // Display the current question and its options
    function showQuestion() {
      const round = quizData[currentRoundIndex];
      const questions = round.getElementsByTagName('question');
      if (currentQuestionIndex >= questions.length) {
        nextRound();
        return;
      }
      const question = questions[currentQuestionIndex];
      const questionText = question.getElementsByTagName('text')[0].textContent;
      const options = question.getElementsByTagName('option');
      
      questionContainer.innerHTML = "";
      const qDiv = document.createElement('div');
      qDiv.className = 'question';
      const qText = document.createElement('p');
      qText.textContent = questionText;
      qDiv.appendChild(qText);
      
      for (let i = 0; i < options.length; i++) {
        const label = document.createElement('label');
        label.className = 'option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'option';
        // Assume option text begins with an identifier (e.g., "A. ")
        radio.value = options[i].textContent.trim().charAt(0);
        label.appendChild(radio);
        label.appendChild(document.createTextNode(" " + options[i].textContent));
        qDiv.appendChild(label);
      }
      
      questionContainer.appendChild(qDiv);
    }
  
    // Handle "Next" button click
    nextBtn.addEventListener('click', function() {
      const selectedOption = document.querySelector('input[name="option"]:checked');
      if (!selectedOption) {
        alert("Please select an option.");
        return;
      }
      const userAnswer = selectedOption.value;
      const round = quizData[currentRoundIndex];
      const questions = round.getElementsByTagName('question');
      const question = questions[currentQuestionIndex];
      const correctAnswer = question.getElementsByTagName('answer')[0].textContent.trim();
      // Compute marks for this question
      const markPerQuestion = currentRoundMarks / currentRoundTotalQuestions;
      if (userAnswer === correctAnswer) {
        score += markPerQuestion;
      }
      currentQuestionIndex++;
      showQuestion();
    });
  
    // Proceed to the next round or finish the quiz
    function nextRound() {
      clearInterval(timer);
      currentRoundIndex++;
      if (currentRoundIndex < quizData.length) {
        startRound();
      } else {
        endQuiz();
      }
    }
  
    // End quiz, compute normalized score, and display admission result
    function endQuiz() {
      quizContainer.style.display = 'none';
      resultContainer.style.display = 'block';
      // Normalize score to a 10-point scale (total marks is the sum of round marks)
      let normalizedScore = (score / totalMarks) * 10;
      normalizedScore = normalizedScore.toFixed(2);
      scoreDisplay.textContent = `Your Score: ${normalizedScore} out of 10`;
      
      let admissionCampus = "";
      if (normalizedScore > 9.5) {
        admissionCampus = "Vellore Campus";
      } else if (normalizedScore > 7.5) {
        admissionCampus = "Chennai Campus";
      } else if (normalizedScore > 6.5) {
        admissionCampus = "Amravati Campus";
      } else {
        admissionCampus = "Not admitted";
      }
      admissionDisplay.textContent = `Admission Status: ${admissionCampus}`;
    }
  });
  