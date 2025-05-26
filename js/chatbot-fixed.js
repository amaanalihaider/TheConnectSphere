// Chatbot implementation using Gemini API
document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('message-input');
    const typingIndicator = document.getElementById('typing-indicator');
    const clearChatButton = document.getElementById('clear-chat');
    const exportChatButton = document.getElementById('export-chat');
    const confirmModal = document.getElementById('confirm-clear-modal');
    const confirmClearBtn = document.getElementById('confirm-clear');
    const cancelClearBtn = document.getElementById('cancel-clear');
    
    // Gemini API key
    const GEMINI_API_KEY = 'AIzaSyDSVv5tphwd1KbPDRZrVJ-FUhQ-cDTRWVo';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Chat history for context
    let chatHistory = [];
    
    // Get the current user ID from session
    async function getCurrentUserId() {
        try {
            // Check if we have Supabase client available
            if (typeof supabase !== 'undefined') {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error;
                return data?.session?.user?.id || 'guest';
            } else if (window.auth && typeof window.auth.getUserData === 'function') {
                // Try using our custom auth helper if available
                const userData = await window.auth.getUserData();
                return userData?.id || 'guest';
            }
        } catch (error) {
            console.error('Error getting current user:', error);
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
            
            // Focus input field
            chatInput.focus();
        }
    }
    
    // Save chat history to localStorage
    async function saveChatHistory() {
        const storageKey = await getChatStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(chatHistory));
    }
    
    // Clear chat history
    async function clearChat() {
        chatHistory = [];
        const storageKey = await getChatStorageKey();
        localStorage.removeItem(storageKey);
        chatMessages.innerHTML = '';
        
        // Add welcome message
        const welcomeMessage = "Welcome to ConnectSphere AI Advisor! I'm here to help with your relationship questions, dating advice, and interpersonal connections. Feel free to ask me anything about relationships, dating tips, or how to improve your connections with others.";
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
4. Bold key points with ** for emphasis
5. Keep your responses friendly, supportive, and thoughtful
6. Aim for 2-4 paragraphs in most responses unless a detailed explanation is requested
7. Always maintain a positive, encouraging tone

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
        // Get the storage key for the current user
        const storageKey = await getChatStorageKey();
        
        // Check if chat history exists for this user
        if (localStorage.getItem(storageKey)) {
            await loadChatHistory();
        } else {
            // Add welcome message if no history
            const welcomeMessage = "Welcome to ConnectSphere AI Advisor! I'm here to help with your relationship questions, dating advice, and interpersonal connections. Feel free to ask me anything about relationships, dating tips, or how to improve your connections with others.";
            appendMessage('bot', welcomeMessage, new Date());
            chatHistory.push({
                role: 'bot',
                content: welcomeMessage,
                timestamp: new Date().toISOString()
            });
            await saveChatHistory();
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
    if (chatMessages && sendButton) {
        // Use async initialization with proper error handling
        (async function() {
            try {
                await initChat();
                console.log('Chat initialized successfully');
                
                // Set up event listeners
                sendButton.addEventListener('click', sendMessage);
                chatInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
                
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
                
            } catch (error) {
                console.error('Error initializing chat:', error);
                // Show a fallback welcome message if initialization fails
                appendMessage('bot', 'Welcome to ConnectSphere AI Advisor! How can I help you today?', new Date());
            }
        })();
    }
});
