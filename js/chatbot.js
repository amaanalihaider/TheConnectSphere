// Chatbot implementation using Gemini API
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('prompt-input'); // Updated to match HTML ID
    const micButton = document.getElementById('mic-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const clearChatButton = document.getElementById('clear-chat');
    const exportChatButton = document.getElementById('export-chat');
    const confirmModal = document.getElementById('confirm-clear-modal');
    const confirmClearBtn = document.getElementById('confirm-clear');
    const cancelClearBtn = document.getElementById('cancel-clear');
    const aiPersonaSelector = document.getElementById('ai-persona-selector');
    
    // Speech Recognition Variables
    let recognition = null;
    let isListening = false;
    
    // Gemini API key
    const GEMINI_API_KEY = 'AIzaSyDSVv5tphwd1KbPDRZrVJ-FUhQ-cDTRWVo';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Chat history for context
    let chatHistory = [];
    
    // Get the current user ID from session
    async function getCurrentUserId() {
        try {
            // Check if we have Supabase client available
            if (typeof supabase !== 'undefined' && supabase !== null) {
                try {
                    const { data, error } = await supabase.auth.getSession();
                    if (!error && data && data.session && data.session.user) {
                        return data.session.user.id || 'guest';
                    }
                } catch (supabaseError) {
                    console.log('Supabase authentication not available, using guest mode');
                }
            } else if (window.auth && typeof window.auth.getUserData === 'function') {
                // Try using our custom auth helper if available
                try {
                    const userData = await window.auth.getUserData();
                    return userData?.id || 'guest';
                } catch (authError) {
                    console.log('Auth helper not available, using guest mode');
                }
            }
        } catch (error) {
            console.log('Using guest mode for chat:', error);
        }
        return 'guest';
    }
    
    // Get the chat storage key for the current user
    async function getChatStorageKey() {
        const userId = await getCurrentUserId();
        return `chatHistory_${userId}`;
    }
    
    // Load chat history from localStorage if available
    async function loadChatHistory() {
        try {
            const storageKey = await getChatStorageKey();
            const savedHistory = localStorage.getItem(storageKey);
            if (savedHistory) {
                chatHistory = JSON.parse(savedHistory);
                
                // Display saved messages
                chatHistory.forEach(message => {
                    appendMessage(message.role, message.content, message.timestamp);
                });
                
                // Scroll to bottom of chat
                scrollToBottom();
                
                // Focus input field if it exists - with safety check
                setTimeout(() => {
                    try {
                        if (chatInput && typeof chatInput.focus === 'function') {
                            chatInput.focus();
                        }
                    } catch (focusError) {
                        console.warn('Could not focus on chat input:', focusError);
                    }
                }, 100); // Small delay to ensure DOM is ready
            }
        } catch (error) {
            console.error('Error in loadChatHistory:', error);
        }
    }
    
    // Save chat history to localStorage
    async function saveChatHistory() {
        const storageKey = await getChatStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(chatHistory));
    }
    
    // Clear chat history
    async function clearChat(personaWelcomeMessage = null) {
        chatHistory = [];
        const storageKey = await getChatStorageKey();
        localStorage.removeItem(storageKey);
        chatMessages.innerHTML = '';
        
        // Add welcome message based on current persona or use default
        let welcomeMessage;
        
        if (personaWelcomeMessage) {
            welcomeMessage = personaWelcomeMessage;
        } else {
            welcomeMessage = "Welcome to ConnectSphere AI Advisor! I'm here to help with your relationship questions, dating advice, and interpersonal connections. Feel free to ask me anything about relationships, dating tips, or how to improve your connections with others.";
        }
        
        appendMessage('bot', welcomeMessage, new Date());
        chatHistory.push({
            role: 'bot',
            content: welcomeMessage,
            timestamp: new Date().toISOString()
        });
        await saveChatHistory();
    }
    
    // Format timestamp
    function formatTime(date) {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Append message to chat
    function appendMessage(role, content, timestamp) {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role === 'user' ? 'user-message' : 'bot-message');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        // Format the content with proper paragraphs and lists
        if (role === 'bot') {
            // Process content to handle formatting
            const formattedContent = formatBotResponse(content);
            messageContent.innerHTML = formattedContent;
        } else {
            // For user messages, just use text content
            messageContent.textContent = content;
        }
        
        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        messageTime.textContent = formatTime(timestamp);
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Format bot responses with proper paragraphs, lists, and styling
    function formatBotResponse(content) {
        if (!content) return '';
        
        // Convert line breaks to paragraphs
        let formatted = content
            .split('\n\n')
            .filter(para => para.trim() !== '')
            .map(para => `<p>${para.trim()}</p>`)
            .join('');
        
        // Handle single line breaks within paragraphs
        formatted = formatted.replace(/<p>([^<]+)\n([^<]+)<\/p>/g, '<p>$1</p><p>$2</p>');
        
        // Format bullet points
        formatted = formatted.replace(/<p>- ([^<]+)<\/p>/g, '<p class="bullet-point">• $1</p>');
        formatted = formatted.replace(/<p>\* ([^<]+)<\/p>/g, '<p class="bullet-point">• $1</p>');
        
        // Format numbered lists
        formatted = formatted.replace(/<p>(\d+)\. ([^<]+)<\/p>/g, '<p class="numbered-point">$1. $2</p>');
        
        // Add emphasis to key phrases
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        return formatted;
    }
    
    // Scroll to bottom of chat
    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            scrollToBottom();
        }
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.classList.add('hidden');
        }
    }
    
    // Send message to Gemini API
    async function sendToGemini(message) {
        try {
            // Create context from recent chat history (last 10 messages)
            const recentHistory = chatHistory.slice(-10);
            
            // Format chat history for context
            const historyText = recentHistory.map(msg => 
                `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
            ).join('\n');
            
            // Create system prompt with instructions
            let systemPrompt;
            
            // Check for current selected persona
            const currentPersona = window.currentAIPersona || 'default';
            
            // Check if we have a personalized system prompt
            if (window.chatbotSystemPromptPersonalized) {
                systemPrompt = window.chatbotSystemPromptPersonalized;
                console.log('Using personalized system prompt for chatbot');
            } else {
                // Select the appropriate system prompt based on the current persona
                switch(currentPersona) {
                    case 'emotional-coach':
                        systemPrompt = `You are an Emotional Coach AI for ConnectSphere, specialized in relationship advice with a focus on emotional well-being.

As an Emotional Coach, you should:
- Provide supportive, empathetic responses focused on emotional processing
- Help users identify and understand their feelings in relationships
- Offer validation and emotional support first, before strategic advice
- Focus on emotional health, self-care, and building emotional resilience
- Use a warm, nurturing tone that creates a safe space for emotional exploration
- Encourage self-reflection and emotional awareness
- Prioritize the user's emotional well-being over "fixing" their relationship problems

Your responses must ONLY relate to relationships and emotions in dating contexts.

FORMATTING INSTRUCTIONS:
1. Structure your responses with clear paragraphs separated by blank lines
2. Use bullet points (with - or *) for lists of tips or suggestions
3. Use numbered lists (1., 2., etc.) for step-by-step advice or processes
4. Bold key points with ** for emphasis
5. Keep your responses empathetic, validating, and supportive
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested`;
                        break;
                        
                    case 'relationship-therapist':
                        systemPrompt = `You are a Relationship Therapist AI for ConnectSphere, specialized in evidence-based relationship guidance.

As a Relationship Therapist, you should:
- Apply therapeutic frameworks and psychological principles to relationship questions
- Help users understand relationship patterns and attachment styles
- Offer structured approaches to resolving conflicts and improving communication
- Provide insightful observations about relationship dynamics
- Maintain professional boundaries while being supportive
- Ask thoughtful questions to guide users toward their own insights
- Reference established relationship therapy concepts when relevant

Your responses must ONLY relate to relationships from a therapeutic perspective.

FORMATTING INSTRUCTIONS:
1. Structure your responses with clear paragraphs separated by blank lines
2. Use bullet points (with - or *) for lists of tips or suggestions
3. Use numbered lists (1., 2., etc.) for step-by-step advice or processes
4. Bold key points with ** for emphasis
5. Keep your responses thoughtful, balanced, and grounded in relationship psychology
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested`;
                        break;
                        
                    case 'friendly-supporter':
                        systemPrompt = `You are a Friendly Supporter AI for ConnectSphere, specialized in casual, friendly relationship advice.

As a Friendly Supporter, you should:
- Respond as if you're a supportive friend having a casual conversation
- Use a conversational, upbeat, and sometimes humorous tone
- Share relatable perspectives and casual wisdom
- Be encouraging and positive without being overly formal
- Validate feelings while gently suggesting constructive approaches
- Avoid complex psychological terms in favor of everyday language
- Focus on being approachable and down-to-earth

Your responses must ONLY relate to relationships from a friendly, supportive perspective.

FORMATTING INSTRUCTIONS:
1. Structure your responses with clear paragraphs separated by blank lines
2. Use bullet points (with - or *) for lists of tips or suggestions
3. Use numbered lists (1., 2., etc.) for step-by-step advice or processes
4. Bold key points with ** for emphasis
5. Keep your responses casual, friendly, and conversational
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested`;
                        break;
                        
                    case 'tough-love':
                        systemPrompt = `You are a Tough-Love Advisor AI for ConnectSphere, specialized in direct, honest relationship guidance.

As a Tough-Love Advisor, you should:
- Provide straightforward, unfiltered feedback on relationship situations
- Challenge users to examine their own role in relationship problems
- Cut through excuses while still being respectful
- Focus on accountability and personal growth
- Deliver hard truths with compassion but without sugar-coating
- Push users outside their comfort zone when needed
- Balance directness with actionable advice

Your responses must ONLY relate to relationships from a direct, honest perspective.

FORMATTING INSTRUCTIONS:
1. Structure your responses with clear paragraphs separated by blank lines
2. Use bullet points (with - or *) for lists of tips or suggestions
3. Use numbered lists (1., 2., etc.) for step-by-step advice or processes
4. Bold key points with ** for emphasis
5. Keep your responses direct, honest, and to-the-point
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested`;
                        break;
                        
                    case 'reflective-listener':
                        systemPrompt = `You are a Reflective Listener AI for ConnectSphere, specialized in thoughtful relationship guidance.

As a Reflective Listener, you should:
- Mirror back the user's thoughts and feelings to help them gain clarity
- Ask insightful questions that promote deeper self-reflection
- Focus more on helping users explore their feelings than giving direct advice
- Create a contemplative space for users to process relationship situations
- Provide gentle guidance that helps users reach their own conclusions
- Notice patterns and themes in users' relationship experiences
- Emphasize awareness and mindfulness in relationships

Your responses must ONLY relate to relationships from a reflective, mindful perspective.

FORMATTING INSTRUCTIONS:
1. Structure your responses with clear paragraphs separated by blank lines
2. Use bullet points (with - or *) for lists of tips or suggestions
3. Use numbered lists (1., 2., etc.) for step-by-step advice or processes
4. Bold key points with ** for emphasis
5. Keep your responses thoughtful, reflective, and exploratory
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested`;
                        break;
                        
                    case 'dating-strategist':
                        systemPrompt = `You are a Dating Strategist AI for ConnectSphere, specialized in tactical relationship and dating advice.

As a Dating Strategist, you should:
- Provide practical, actionable strategies for dating success
- Focus on specific tactics for meeting people, creating connections, and developing relationships
- Give advice that's clear, concrete, and implementation-focused
- Help users understand dating as a skill that can be developed
- Offer specific scripts, approaches, and techniques
- Balance strategy with authenticity and ethics
- Emphasize measurable progress and results

Your responses must ONLY relate to relationships from a strategic, tactical perspective.

FORMATTING INSTRUCTIONS:
1. Structure your responses with clear paragraphs separated by blank lines
2. Use bullet points (with - or *) for lists of tips or suggestions
3. Use numbered lists (1., 2., etc.) for step-by-step advice or processes
4. Bold key points with ** for emphasis
5. Keep your responses practical, specific, and action-oriented
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested`;
                        break;
                        
                    default: // Default Relationship Advisor
                        systemPrompt = `You are the ConnectSphere AI Advisor, a specialized chatbot focused exclusively on relationship advice, dating tips, and interpersonal connections.

Your responses must ONLY relate to:
- Dating advice and relationship guidance
- Tips for improving communication with partners
- Advice on finding compatible matches
- Guidance on building healthy relationships
- Support for relationship challenges
- Dating profile improvement suggestions
- Interpersonal connection strategies

If asked about ANY other topic outside of relationships and dating, politely redirect the conversation back to relationship topics by saying: "I'm the ConnectSphere Relationship Advisor, so I focus on helping with dating and relationship questions. I'd be happy to help with any relationship concerns you have!"

FORMATTING INSTRUCTIONS:
1. Structure your responses with clear paragraphs separated by blank lines
2. Use bullet points (with - or *) for lists of tips or suggestions
3. Use numbered lists (1., 2., etc.) for step-by-step advice or processes
4. Bold key points with ** for emphasis
5. Keep your responses friendly, supportive, and thoughtful
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested
7. Always maintain a positive, encouraging tone`;
                        break;
                }
            }
            
            // Add conversation history and user's message
            systemPrompt += `

CURRENT CONVERSATION HISTORY:
${historyText}

User's latest message: ${message}

Your response (ONLY about relationships/dating):`;
            
            // Prepare request for Gemini API
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: systemPrompt }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API response error:', errorText);
                throw new Error(`API request failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Gemini API response:', data);
            
            // Extract response text
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && data.candidates[0].content.parts && 
                data.candidates[0].content.parts.length > 0) {
                return data.candidates[0].content.parts[0].text;
            }
            
            return "Sorry, I couldn't process your request at the moment.";
        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            return "I'm having trouble connecting to my AI services right now. Please try again in a moment.";
        }
    }
    
    // Function to send message
    async function sendMessage() {
        // Check if chatInput exists
        if (!chatInput) {
            console.error('Chat input element not found');
            return;
        }
        
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;
        
        // Clear input
        chatInput.value = '';
        
        // Add user message to chat
        const timestamp = new Date();
        appendMessage('user', userMessage, timestamp);
        
        // Add to history
        chatHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: timestamp.toISOString()
        });
        
        // Save chat history
        await saveChatHistory();
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Get response from Gemini
            const botResponse = await sendToGemini(userMessage);
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add bot response to chat
            const botTimestamp = new Date();
            appendMessage('bot', botResponse, botTimestamp);
            
            // Add to history
            chatHistory.push({
                role: 'bot',
                content: botResponse,
                timestamp: botTimestamp.toISOString()
            });
            
            // Save chat history
            await saveChatHistory();
        } catch (error) {
            console.error('Error in send message flow:', error);
            hideTypingIndicator();
            appendMessage('bot', "I'm sorry, I encountered an error while processing your message. Please try again.", new Date());
        }
    }
    
    // Initialize chat
    async function initChat() {
        try {
            // Check if all required elements exist
            if (!chatMessages) {
                console.error('Chat messages container not found');
                return;
            }
            
            // Get the storage key for the current user
            let storageKey;
            try {
                storageKey = await getChatStorageKey();
            } catch (keyError) {
                console.error('Error getting chat storage key:', keyError);
                storageKey = 'chatHistory_guest'; // Fallback to guest mode
            }
            
            // Check if chat history exists for this user
            let existingHistory = false;
            try {
                existingHistory = localStorage.getItem(storageKey) !== null;
            } catch (storageError) {
                console.error('Error accessing localStorage:', storageError);
            }
            
            if (existingHistory) {
                try {
                    await loadChatHistory();
                } catch (loadError) {
                    console.error('Error loading chat history:', loadError);
                    // If loading fails, start with a fresh welcome message
                    existingHistory = false;
                }
            }
            
            if (!existingHistory) {
                // Add welcome message if no history or if loading failed
                let welcomeMessage;
                
                // Get welcome message based on current persona if exists
                if (window.currentAIPersona) {
                    welcomeMessage = getPersonaWelcomeMessage(window.currentAIPersona);
                } else {
                    welcomeMessage = "Welcome to ConnectSphere AI Advisor! I'm here to help with your relationship questions, dating advice, and interpersonal connections. Feel free to ask me anything about relationships, dating tips, or how to improve your connections with others.";
                }
                
                try {
                    appendMessage('bot', welcomeMessage, new Date());
                    chatHistory.push({
                        role: 'bot',
                        content: welcomeMessage,
                        timestamp: new Date().toISOString()
                    });
                    await saveChatHistory();
                } catch (welcomeError) {
                    console.error('Error setting up welcome message:', welcomeError);
                }
            }
            
            // Focus input field if it exists
            if (chatInput) {
                try {
                    chatInput.focus();
                } catch (focusError) {
                    console.error('Error focusing on chat input:', focusError);
                }
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
        }
    }
    
    // Initialize speech recognition
    function initSpeechRecognition() {
        // Check if browser supports speech recognition
        if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
            console.log('Speech recognition not supported in this browser');
            if (micButton) {
                micButton.style.display = 'none';
            }
            return false;
        }
        
        // Create speech recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Set language
        
        // Handle results
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            // Update input field with transcript
            if (chatInput) {
                chatInput.value = transcript;
            }
        };
        
        // Handle end of speech recognition
        recognition.onend = () => {
            isListening = false;
            if (micButton) {
                micButton.innerHTML = '<i class="fas fa-microphone"></i>';
                micButton.classList.remove('recording');
            }
        };
        
        // Handle errors
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            isListening = false;
            if (micButton) {
                micButton.innerHTML = '<i class="fas fa-microphone"></i>';
                micButton.classList.remove('recording');
            }
        };
        
        // Add click event to mic button
        if (micButton) {
            micButton.addEventListener('click', toggleSpeechRecognition);
        }
        
        console.log('Speech recognition initialized');
        return true;
    }
    
    // Toggle speech recognition on/off
    function toggleSpeechRecognition() {
        if (!recognition) {
            initSpeechRecognition();
            if (!recognition) return;
        }
        
        if (isListening) {
            // Stop listening
            recognition.stop();
            isListening = false;
            micButton.innerHTML = '<i class="fas fa-microphone"></i>';
            micButton.classList.remove('recording');
        } else {
            // Start listening
            recognition.start();
            isListening = true;
            micButton.innerHTML = '<i class="fas fa-stop"></i>';
            micButton.classList.add('recording');
            
            // Clear input field when starting new recording
            chatInput.value = '';
        }
    }
    
    // Export chat history as markdown file
    async function exportChatHistory() {
        try {
            // Get username for the filename
            const userId = await getCurrentUserId();
            const username = userId === 'guest' ? 'guest' : userId.substring(0, 8);
            const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const filename = `connectsphere_chat_${username}_${currentDate}.md`;
            
            // Convert chat history to markdown
            let markdownContent = "# ConnectSphere AI Advisor Chat History\n\n";
            markdownContent += `Exported on: ${new Date().toLocaleString()}\n\n---\n\n`;
            
            chatHistory.forEach((message, index) => {
                const timestamp = new Date(message.timestamp).toLocaleString();
                const sender = message.role === 'user' ? '**You**' : '**AI Advisor**';
                markdownContent += `### ${sender} (${timestamp})\n\n${message.content}\n\n---\n\n`;
            });
            
            // Create and download the file
            const blob = new Blob([markdownContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log('Chat history exported successfully');
        } catch (error) {
            console.error('Error exporting chat history:', error);
            alert('There was an error exporting your chat history. Please try again.');
        }
    }
    
    // Initialize chat if we're on the chat page
    // Add a delay to ensure DOM is fully loaded
    setTimeout(() => {
        if (document.getElementById('chat-messages')) {
            // Refresh the element references after DOM is fully loaded
            const chatMessages = document.getElementById('chat-messages');
            const sendButton = document.getElementById('send-button');
            const chatInput = document.getElementById('prompt-input');
            const micButton = document.getElementById('mic-button');
            const typingIndicator = document.getElementById('typing-indicator');
            const clearChatButton = document.getElementById('clear-chat');
            const exportChatButton = document.getElementById('export-chat');
            const confirmModal = document.getElementById('confirm-clear-modal');
            const confirmClearBtn = document.getElementById('confirm-clear');
            const cancelClearBtn = document.getElementById('cancel-clear');
            
            console.log('Chat elements found:', {
                chatMessages: !!chatMessages,
                sendButton: !!sendButton,
                chatInput: !!chatInput,
                typingIndicator: !!typingIndicator
            });
            
            // Use async initialization with proper error handling
            (async function() {
                try {
                    await initChat();
                    console.log('Chat initialized successfully');
                    
                    // Initialize speech recognition
                    initSpeechRecognition();
                    
                    // Set up event listeners with null checks
                    if (sendButton) {
                        sendButton.addEventListener('click', function(e) {
                            e.preventDefault(); // Prevent form submission
                            sendMessage();
                        });
                        console.log('Send button event listener added');
                    }
                    
                    // Set up form submission handling
                    const chatForm = document.getElementById('chat-form');
                    if (chatForm) {
                        chatForm.addEventListener('submit', function(e) {
                            e.preventDefault(); // Prevent form submission
                            sendMessage();
                        });
                        console.log('Chat form event listener added');
                    }
                    
                    if (chatInput) {
                        chatInput.addEventListener('keydown', function(e) {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent form submission
                                sendMessage();
                            }
                        });
                        console.log('Chat input event listener added');
                        
                        // Focus on input field
                        setTimeout(() => {
                            try {
                                chatInput.focus();
                            } catch (e) {
                                console.warn('Could not focus chat input:', e);
                            }
                        }, 300);
                    }
                
                    if (clearChatButton) {
                        clearChatButton.addEventListener('click', function() {
                            confirmModal.style.display = 'flex';
                        });
                    }
                    
                    if (confirmClearBtn) {
                        confirmClearBtn.addEventListener('click', function() {
                            clearChat();
                            confirmModal.style.display = 'none';
                        });
                    }
                    
                    if (cancelClearBtn) {
                        cancelClearBtn.addEventListener('click', function() {
                            confirmModal.style.display = 'none';
                        });
                    }
                    
                    if (confirmModal) {
                        confirmModal.addEventListener('click', function(event) {
                            if (event.target === confirmModal) {
                                confirmModal.style.display = 'none';
                            }
                        });
                    }
                    
                // Add export chat functionality
                if (exportChatButton) {
                    exportChatButton.addEventListener('click', exportChatHistory);
                }
                    
                // Add AI persona selector functionality
                if (aiPersonaSelector) {
                    // Initialize the selector with saved preference if available
                    const savedPersona = localStorage.getItem('aiPersona');
                    if (savedPersona) {
                        aiPersonaSelector.value = savedPersona;
                        window.currentAIPersona = savedPersona;
                    } else {
                        window.currentAIPersona = 'default';
                    }
                        
                    // Add change event listener
                    aiPersonaSelector.addEventListener('change', handlePersonaChange);
                }
            
            } catch (error) {
                console.error('Error initializing chat:', error);
                // Show a fallback welcome message if initialization fails
                appendMessage('bot', 'Welcome to ConnectSphere AI Advisor! How can I help you today?', new Date());
            }
        })();
    }
});

// Get welcome message based on persona
function getPersonaWelcomeMessage(persona) {
    switch(persona) {
        case 'emotional-coach':
            return "You're now chatting with your Emotional Coach. I'm here to provide supportive guidance focused on your emotional well-being in relationships. Feel free to share your feelings and relationship experiences, and I'll help you process them in a healthy way.";
            
        case 'relationship-therapist':
            return "You're now connected with a Relationship Therapist. I'll apply evidence-based approaches to help you understand your relationship patterns and develop healthier connections. What relationship concern would you like to explore today?";
            
        case 'friendly-supporter':
            return "Hey there! I'm your Friendly Supporter, ready to chat about your relationship questions in a casual, down-to-earth way. Think of me as that supportive friend who's always ready with honest advice - so what's going on in your dating life?";
            
        case 'tough-love':
            return "I'm your Tough-Love Advisor now. I'll give you straightforward, honest feedback about your relationship situations - no sugar-coating, but always with your best interests at heart. Ready for some real talk about your relationships?";
            
        case 'reflective-listener':
            return "I'm your Reflective Listener now. Rather than just giving advice, I'll help you explore your own thoughts and feelings about relationships more deeply. What's on your mind that you'd like to reflect on together?";
            
        case 'dating-strategist':
            return "You're now working with a Dating Strategist. I'll provide practical, tactical advice to help you navigate the dating world more effectively. What specific dating challenge would you like strategies for today?";
            
        default: // Default Relationship Advisor
            return "Welcome to ConnectSphere AI Advisor! I'm here to help with your relationship questions, dating advice, and interpersonal connections. Feel free to ask me anything about relationships, dating tips, or how to improve your connections with others.";
    }
}

// Handle persona change
async function handlePersonaChange(event) {
    try {
        const newPersona = event.target.value;
        const oldPersona = window.currentAIPersona;
        
        // Only process if actually changed
        if (newPersona === oldPersona) return;
        
        // Update current persona
        window.currentAIPersona = newPersona;
        localStorage.setItem('aiPersona', newPersona);
        console.log(`Changing AI persona to: ${newPersona}`);
        
        // Create confirmation modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';
        modalContent.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
                <h3 class="text-xl font-bold text-purple-600 mb-4">Switching AI Persona</h3>
                <p class="mb-6">Switching to <strong>${aiPersonaSelector.options[aiPersonaSelector.selectedIndex].text}</strong> will clear your current conversation. Do you want to continue?</p>
                <div class="flex justify-end space-x-4">
                    <button id="cancel-persona-change" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Cancel</button>
                    <button id="confirm-persona-change" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:opacity-90 transition">Continue</button>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modalContent);
        
        // Add event listeners to buttons
        document.getElementById('cancel-persona-change').addEventListener('click', () => {
            // Reset selector to previous value
            aiPersonaSelector.value = oldPersona;
            window.currentAIPersona = oldPersona;
            document.body.removeChild(modalContent);
        });
        
        document.getElementById('confirm-persona-change').addEventListener('click', async () => {
            // Get welcome message for new persona
            const welcomeMessage = getPersonaWelcomeMessage(newPersona);
            
            // Clear chat with new welcome message
            await clearChat(welcomeMessage);
            
            // Remove modal
            document.body.removeChild(modalContent);
        });
        
    } catch (error) {
        console.error('Error changing AI persona:', error);
    }
}

// Initialize with a small delay to ensure DOM is fully loaded
setTimeout(() => {
    if (document.getElementById('chat-messages')) {
        initChat();
    }
}, 100);

});  // Close the main document.addEventListener function
