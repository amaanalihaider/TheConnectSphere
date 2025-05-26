/**
 * Relationship Health Dashboard
 * 
 * This script handles the functionality of the relationship health dashboard,
 * including form submission, score calculation, visualization, and AI advice generation.
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const relationshipForm = document.getElementById('relationship-form');
    const assessmentForm = document.getElementById('assessment-form');
    const resultsDashboard = document.getElementById('results-dashboard');
    const aiAdviceSection = document.getElementById('ai-advice-section');
    const healthCircle = document.getElementById('health-circle');
    const healthScore = document.getElementById('health-score');
    const healthRating = document.getElementById('health-rating');
    const relationshipSummary = document.getElementById('relationship-summary');
    const getAdviceBtn = document.getElementById('get-advice-btn');
    const restartAssessmentBtn = document.getElementById('restart-assessment-btn');
    const backToResultsBtn = document.getElementById('back-to-results-btn');
    const chatAdvisorBtn = document.getElementById('chat-advisor-btn');
    const aiAdviceContent = document.getElementById('ai-advice-content');
    const aiTypingIndicator = document.getElementById('ai-typing-indicator');

    // Category score elements
    const communicationScore = document.getElementById('communication-score');
    const communicationBar = document.getElementById('communication-bar');
    const trustScore = document.getElementById('trust-score');
    const trustBar = document.getElementById('trust-bar');
    const intimacyScore = document.getElementById('intimacy-score');
    const intimacyBar = document.getElementById('intimacy-bar');
    const growthScore = document.getElementById('growth-score');
    const growthBar = document.getElementById('growth-bar');

    // Add SVG gradient definition for the circle
    const svgElement = document.querySelector('.dashboard-circle svg');
    if (svgElement) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#8b5cf6" />
                <stop offset="100%" stop-color="#ec4899" />
            </linearGradient>
        `;
        svgElement.prepend(defs);
    }

    // Form submission
    if (relationshipForm) {
        relationshipForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const formData = new FormData(relationshipForm);
            const formValues = {};
            let isValid = true;
            let totalFields = 0;
            
            for (const [name, value] of formData.entries()) {
                formValues[name] = value;
                totalFields++;
                if (!value) {
                    isValid = false;
                    // Find the select element and add error styling
                    const selectElement = document.querySelector(`select[name="${name}"]`);
                    if (selectElement) {
                        selectElement.classList.add('border-red-500');
                        // Add error message
                        const errorMsg = document.createElement('p');
                        errorMsg.className = 'text-red-500 text-sm mt-1';
                        errorMsg.textContent = 'Please select an option';
                        
                        // Check if error message already exists
                        const existingError = selectElement.parentNode.querySelector('.text-red-500');
                        if (!existingError) {
                            selectElement.parentNode.appendChild(errorMsg);
                        }
                        
                        // Remove error styling on change
                        selectElement.addEventListener('change', function() {
                            this.classList.remove('border-red-500');
                            const error = this.parentNode.querySelector('.text-red-500');
                            if (error) {
                                error.remove();
                            }
                        }, { once: true });
                    }
                }
            }
            
            if (!isValid) {
                // Scroll to the first error
                const firstError = document.querySelector('.border-red-500');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            // Calculate scores
            const scores = calculateScores(formValues);
            
            // Display results
            displayResults(scores);
            
            // Switch to results view
            assessmentForm.classList.add('hidden');
            resultsDashboard.classList.remove('hidden');
            
            // Scroll to top of results
            resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
    
    // Calculate category and overall scores
    function calculateScores(formValues) {
        // Define category fields
        const categories = {
            communication: ['communication_frequency', 'communication_comfort', 'conflict_resolution'],
            trust: ['trust_level', 'support_level'],
            intimacy: ['emotional_intimacy', 'shared_activities'],
            growth: ['future_alignment', 'personal_growth']
        };
        
        const scores = {
            communication: 0,
            trust: 0,
            intimacy: 0,
            growth: 0,
            overall: 0,
            maxPossible: 0,
            formValues: formValues // Store original values for AI advice
        };
        
        // Calculate category scores
        for (const [category, fields] of Object.entries(categories)) {
            let categoryTotal = 0;
            let categoryMax = fields.length * 5; // Each field has max value of 5
            
            fields.forEach(field => {
                if (formValues[field]) {
                    categoryTotal += parseInt(formValues[field]);
                }
            });
            
            scores[category] = Math.round((categoryTotal / categoryMax) * 100);
            scores.maxPossible += categoryMax;
        }
        
        // Calculate overall score (weighted average of all categories)
        let totalPoints = 0;
        for (const field in formValues) {
            if (formValues[field]) {
                totalPoints += parseInt(formValues[field]);
            }
        }
        
        scores.overall = Math.round((totalPoints / scores.maxPossible) * 100);
        
        return scores;
    }
    
    // Display results in the dashboard
    function displayResults(scores) {
        // Animate the circle progress with a delay to create a nice effect
        setTimeout(() => {
            // Start with circle at 0
            healthCircle.style.strokeDashoffset = 628;
            
            // Animate the score number from 0 to the final value
            let startValue = 0;
            const endValue = scores.overall;
            const duration = 1500; // 1.5 seconds
            const frameRate = 1000/60; // 60fps
            const totalFrames = duration / frameRate;
            const increment = endValue / totalFrames;
            
            // Reset the score text to 0
            healthScore.textContent = '0';
            
            // Add the animate class to scale up the font size
            healthScore.classList.add('animate');
            
            // Create counter animation
            let counter = 0;
            const animateCounter = setInterval(() => {
                counter += increment;
                if (counter >= endValue) {
                    counter = endValue;
                    clearInterval(animateCounter);
                }
                healthScore.textContent = Math.round(counter);
            }, frameRate);
            
            // Animate the circle filling
            const dashoffset = 628 - ((628 * scores.overall) / 100);
            healthCircle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            setTimeout(() => {
                healthCircle.style.strokeDashoffset = dashoffset;
            }, 100);
        }, 300);
        
        // Set health rating text and color
        let ratingText, ratingClass;
        
        if (scores.overall >= 85) {
            ratingText = "Excellent";
            ratingClass = "health-excellent";
        } else if (scores.overall >= 70) {
            ratingText = "Good";
            ratingClass = "health-good";
        } else if (scores.overall >= 50) {
            ratingText = "Average";
            ratingClass = "health-average";
        } else {
            ratingText = "Needs Attention";
            ratingClass = "health-concerning";
        }
        
        healthRating.textContent = ratingText;
        healthRating.className = `text-xl font-semibold mb-4 text-center ${ratingClass}`;
        
        // Set category scores with animations
        // First reset all bars to 0 width
        communicationBar.style.width = '0%';
        trustBar.style.width = '0%';
        intimacyBar.style.width = '0%';
        growthBar.style.width = '0%';
        
        // Reset scores to 0
        communicationScore.textContent = '0%';
        trustScore.textContent = '0%';
        intimacyScore.textContent = '0%';
        growthScore.textContent = '0%';
        
        // Animate category bars with staggered timing
        setTimeout(() => {
            // Communication bar animation
            animateCategoryBar(communicationBar, communicationScore, scores.communication, 800);
            
            // Trust bar animation with delay
            setTimeout(() => {
                animateCategoryBar(trustBar, trustScore, scores.trust, 800);
            }, 200);
            
            // Intimacy bar animation with delay
            setTimeout(() => {
                animateCategoryBar(intimacyBar, intimacyScore, scores.intimacy, 800);
            }, 400);
            
            // Growth bar animation with delay
            setTimeout(() => {
                animateCategoryBar(growthBar, growthScore, scores.growth, 800);
            }, 600);
        }, 800); // Start after the circle animation has begun
        
        // Generate relationship summary
        generateSummary(scores);
    }
    
    // Animate category bar function
    function animateCategoryBar(barElement, scoreElement, targetValue, duration) {
        // Set initial width to 0
        barElement.style.width = '0%';
        
        // Add transition effect
        barElement.style.transition = `width ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        
        // Animate counter
        let startValue = 0;
        const frameRate = 1000/60; // 60fps
        const totalFrames = duration / frameRate;
        const increment = targetValue / totalFrames;
        
        // Create counter animation
        let counter = 0;
        const animateCounter = setInterval(() => {
            counter += increment;
            if (counter >= targetValue) {
                counter = targetValue;
                clearInterval(animateCounter);
            }
            scoreElement.textContent = `${Math.round(counter)}%`;
        }, frameRate);
        
        // Animate the bar width
        setTimeout(() => {
            barElement.style.width = `${targetValue}%`;
        }, 50);
    }
    
    // Generate relationship summary text
    function generateSummary(scores) {
        let summary = '';
        
        // Overall health summary
        if (scores.overall >= 85) {
            summary += "Your relationship appears to be thriving! You've built a strong foundation of communication, trust, and mutual support. ";
        } else if (scores.overall >= 70) {
            summary += "Your relationship is on solid ground. You have many strengths to build upon while addressing a few areas for growth. ";
        } else if (scores.overall >= 50) {
            summary += "Your relationship has both strengths and challenges. With focused attention on key areas, you can strengthen your connection. ";
        } else {
            summary += "Your relationship is facing some significant challenges. Addressing these areas with intention and possibly professional support could help improve your connection. ";
        }
        
        // Identify strongest area
        const categories = {
            communication: scores.communication,
            trust: scores.trust,
            intimacy: scores.intimacy,
            growth: scores.growth
        };
        
        const strongest = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b);
        const weakest = Object.keys(categories).reduce((a, b) => categories[a] < categories[b] ? a : b);
        
        // Add strength
        switch (strongest) {
            case 'communication':
                summary += "Your strongest area is communication, which provides a great foundation for addressing other aspects of your relationship. ";
                break;
            case 'trust':
                summary += "Trust and support are the highlights of your relationship, creating security and reliability between you. ";
                break;
            case 'intimacy':
                summary += "The emotional and physical connection you share is a significant strength in your relationship. ";
                break;
            case 'growth':
                summary += "Your shared vision for the future and personal growth is a powerful asset in your relationship. ";
                break;
        }
        
        // Add area for improvement
        if (categories[weakest] < 70) {
            switch (weakest) {
                case 'communication':
                    summary += "Focusing on improving how you communicate and resolve conflicts could significantly enhance your relationship satisfaction.";
                    break;
                case 'trust':
                    summary += "Building greater trust and showing more consistent support for each other could strengthen your bond.";
                    break;
                case 'intimacy':
                    summary += "Deepening your emotional connection and finding more activities to enjoy together could bring you closer.";
                    break;
                case 'growth':
                    summary += "Aligning your future goals and supporting each other's personal growth could help your relationship flourish long-term.";
                    break;
            }
        } else {
            summary += "All areas of your relationship show strength, which speaks to the care and attention you've both invested.";
        }
        
        relationshipSummary.textContent = summary;
    }
    
    // Get AI advice based on assessment
    if (getAdviceBtn) {
        getAdviceBtn.addEventListener('click', function() {
            // Switch to AI advice view
            resultsDashboard.classList.add('hidden');
            aiAdviceSection.classList.remove('hidden');
            
            // Get the scores from the dashboard
            const overallScore = parseInt(healthScore.textContent);
            const communicationPercent = parseInt(communicationScore.textContent);
            const trustPercent = parseInt(trustScore.textContent);
            const intimacyPercent = parseInt(intimacyScore.textContent);
            const growthPercent = parseInt(growthScore.textContent);
            
            // Generate AI advice
            generateAIAdvice({
                overall: overallScore,
                communication: communicationPercent,
                trust: trustPercent,
                intimacy: intimacyPercent,
                growth: growthPercent
            });
        });
    }
    
    // Generate AI advice using Gemini API
    async function generateAIAdvice(scores) {
        // Show typing indicator
        aiTypingIndicator.style.display = 'flex';
        
        try {
            // Prepare the prompt for the AI
            const prompt = createAIPrompt(scores);
            
            // Check if we're using the Gemini API directly or our chatbot.js implementation
            if (typeof window.sendToGemini === 'function') {
                // Use existing chatbot.js implementation
                const response = await window.sendToGemini(prompt);
                displayAIAdvice(response);
            } else {
                // Direct API call to Gemini
                const GEMINI_API_KEY = 'AIzaSyDSVv5tphwd1KbPDRZrVJ-FUhQ-cDTRWVo'; // This should be stored securely in production
                const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
                
                const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt
                                    }
                                ]
                            }
                        ]
                    })
                });
                
                const data = await response.json();
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const aiResponse = data.candidates[0].content.parts[0].text;
                    displayAIAdvice(aiResponse);
                } else {
                    throw new Error('Invalid response from AI');
                }
            }
        } catch (error) {
            console.error('Error generating AI advice:', error);
            displayAIAdvice("I'm sorry, I couldn't generate personalized advice at this time. Please try again later or visit our Chat Advisor for more help.");
        }
    }
    
    // Create the prompt for the AI
    function createAIPrompt(scores) {
        return `You are the ConnectSphere Relationship Advisor, an AI specialized in providing personalized relationship advice.

Based on a relationship health assessment, please provide tailored advice for improving a relationship with the following scores:

- Overall Health: ${scores.overall}%
- Communication: ${scores.communication}%
- Trust & Support: ${scores.trust}%
- Intimacy & Connection: ${scores.intimacy}%
- Growth & Future: ${scores.growth}%

Please structure your response with:
1. A brief, encouraging introduction acknowledging their current relationship status
2. Specific, actionable advice for their lowest scoring area
3. Ways to leverage their highest scoring area to strengthen the relationship
4. 2-3 practical exercises or activities they could try together
5. A positive, hopeful conclusion

Format your response with clear headings, bullet points for lists, and bold text for key points. Keep your tone warm, supportive, and non-judgmental. Limit your response to about 400-500 words.`;
    }
    
    // Display the AI advice
    function displayAIAdvice(advice) {
        // Hide typing indicator
        aiTypingIndicator.style.display = 'none';
        
        // Format the advice with proper HTML
        const formattedAdvice = advice
            .replace(/\n\n/g, '</p><p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.*?)$/gm, '<li>$1</li>')
            .replace(/<li>(.*?)<\/li>/g, function(match) {
                return '<ul>' + match + '</ul>';
            })
            .replace(/<\/ul><ul>/g, '');
        
        aiAdviceContent.innerHTML = `<p>${formattedAdvice}</p>`;
    }
    
    // Navigation between views
    if (restartAssessmentBtn) {
        restartAssessmentBtn.addEventListener('click', function() {
            resultsDashboard.classList.add('hidden');
            assessmentForm.classList.remove('hidden');
            relationshipForm.reset();
        });
    }
    
    if (backToResultsBtn) {
        backToResultsBtn.addEventListener('click', function() {
            aiAdviceSection.classList.add('hidden');
            resultsDashboard.classList.remove('hidden');
        });
    }
    
    if (chatAdvisorBtn) {
        chatAdvisorBtn.addEventListener('click', function() {
            // Get the advice content
            const advice = aiAdviceContent.textContent;
            
            // Store in localStorage to be used by chat advisor
            localStorage.setItem('relationshipAssessmentAdvice', advice);
            
            // Navigate to chat advisor page
            window.location.href = 'chat-advisor.html?source=dashboard';
        });
    }
});

// Update the chat-advisor.js to check for assessment data
(function() {
    // This will run when included in chat-advisor.html
    function checkForAssessmentData() {
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        
        if (source === 'dashboard') {
            const assessmentAdvice = localStorage.getItem('relationshipAssessmentAdvice');
            if (assessmentAdvice) {
                // Wait for chat elements to be ready
                const checkInterval = setInterval(() => {
                    const chatInput = document.getElementById('prompt-input');
                    const sendButton = document.getElementById('send-button');
                    
                    if (chatInput && sendButton) {
                        clearInterval(checkInterval);
                        
                        // Set the input value to ask about the assessment
                        chatInput.value = "I just completed the relationship health assessment. Can you give me more detailed advice based on my results?";
                        
                        // Trigger the send button click
                        sendButton.click();
                        
                        // Clear the stored advice
                        localStorage.removeItem('relationshipAssessmentAdvice');
                    }
                }, 500);
            }
        }
    }
    
    // Check when DOM is loaded
    document.addEventListener('DOMContentLoaded', checkForAssessmentData);
})();
