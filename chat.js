// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2e5ZFUMY67KJsUrrflJpSIm1UpE4gn_Q",
    authDomain: "realauth-f47e3.firebaseapp.com",
    projectId: "realauth-f47e3",
    storageBucket: "realauth-f47e3.firebasestorage.app",
    messagingSenderId: "246570204070",
    appId: "1:246570204070:web:d89596de8b627467e66d67"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM elements
const userEmailEl = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

// Google Gemini API Key
const GEMINI_API_KEY = "AIzaSyCa4oS6AnLLRZJsC3HBIvEeAwzYRhGdUg4";

// Check authentication state
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        userEmailEl.textContent = user.email;
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
});

// Send message handler
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send message function
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = '60px'; // Reset height
    
    try {
        // Show loading indicator
        const loadingMsg = addMessage("Thinking...", 'ai', true);
        
        // Get API response
        const aiResponse = await fetchGeminiResponse(message);
        
        // Replace loading message with actual response
        chatMessages.removeChild(loadingMsg);
        addMessage(aiResponse, 'ai');
    } catch (error) {
        addMessage("MAZ error: Connection issue. Please try again later.", 'ai');
        console.error('API Error:', error);
    }
}

// Add message to chat
function addMessage(content, sender, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="avatar">
            ${sender === 'user' 
                ? '<i class="fas fa-user"></i>' 
                : '<i class="fas fa-robot"></i>'}
        </div>
        <div class="content">
            <div class="text">${isLoading ? '<i class="fas fa-spinner fa-spin"></i> ' + content : content}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight > 150 ? 150 : this.scrollHeight) + 'px';
});

// Fetch Gemini response
async function fetchGeminiResponse(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                role: "user",
                parts: [{
                    text: userMessage
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`MAZ error: Gemini API responded with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Extract the AI response text
    if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error("MAZ error: No response from AI");
}
