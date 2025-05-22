// Chatbot implementation using Gemini API
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('message-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const clearChatButton = document.getElementById('clear-chat');
    
    // Gemini API key
    const GEMINI_API_KEY = 'AIzaSyDSVv5tphwd1KbPDRZrVJ-FUhQ-cDTRWVo';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Chat history for context
    let chatHistory = [];
    
    // Load chat history from localStorage if available
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            
            // Display saved messages
            chatHistory.forEach(message => {
                appendMessage(message.role, message.content, message.timestamp);
            });
            
            // Scroll to bottom of chat
            scrollToBottom();
            
            // Focus input field
            chatInput.focus();
        }
    }
    
    // Save chat history to localStorage
    function saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    
    // Clear chat history
    function clearChat() {
        chatHistory = [];
        localStorage.removeItem('chatHistory');
        chatMessages.innerHTML = '';
        
        // Add welcome message
        const welcomeMessage = "Welcome to ConnectSphere AI Advisor! I'm here to help with your relationship questions, dating advice, and interpersonal connections. Feel free to ask me anything about relationships, dating tips, or how to improve your connections with others.";
        appendMessage('bot', welcomeMessage, new Date());
        chatHistory.push({
            role: 'bot',
            content: welcomeMessage,
            timestamp: new Date().toISOString()
        });
        saveChatHistory();
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
            const historyText = recentHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
            
            // Create system prompt with instructions
            const systemPrompt = `You are the ConnectSphere AI Advisor, a specialized chatbot focused exclusively on relationship advice, dating tips, and interpersonal connections.

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
4. Use **bold** for important points or headings
5. Use *italics* for emphasis on key words or phrases
6. Keep paragraphs concise (3-4 sentences maximum)
7. For longer responses, organize with clear sections and white space

Be compassionate, non-judgmental, and provide thoughtful advice that's tailored to the ConnectSphere dating platform context.

Chat history:
${historyText}

User's new message: ${message}`;
            
            // Prepare request body
            const requestBody = {
                contents: [
                    {
                        parts: [
                            {
                                text: systemPrompt
                            }
                        ]
                    }
                ]
            };
            
            console.log('Sending request to Gemini API:', requestBody);
            
            // Make API request
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
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
            } else {
                console.error('Unexpected API response format:', data);
                return "I'm sorry, I received an unexpected response format. Please try again.";
            }
            
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
        }
    }
    
    // Handle message sending
    if (sendButton) {
        // Function to send message
        const sendMessage = async () => {
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
            saveChatHistory();
            
            // Show typing indicator
            showTypingIndicator();
            
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
            saveChatHistory();
        };
        
        // Add click event listener to send button
        sendButton.addEventListener('click', sendMessage);
        
        // Add keypress event listener to input field (for Enter key)
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Handle clear chat button
    if (clearChatButton) {
        clearChatButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the chat history?')) {
                clearChat();
            }
        });
    }
    
    // Initialize chat
    function initChat() {
        // Check if chat history exists
        if (localStorage.getItem('chatHistory')) {
            loadChatHistory();
        } else {
            // Add welcome message if no history
            const welcomeMessage = "Welcome to ConnectSphere AI Advisor! I'm here to help with your relationship questions, dating advice, and interpersonal connections. Feel free to ask me anything about relationships, dating tips, or how to improve your connections with others.";
            appendMessage('bot', welcomeMessage, new Date());
            chatHistory.push({
                role: 'bot',
                content: welcomeMessage,
                timestamp: new Date().toISOString()
            });
            saveChatHistory();
        }
    }
    
    // Initialize chat if we're on the chat page
    if (chatMessages && sendButton) {
        initChat();
    }
});
