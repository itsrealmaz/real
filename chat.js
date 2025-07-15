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
        const aiResponse = await fetchAIResponse(message);
        
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

// Fetch AI response
async function fetchAIResponse(userMessage) {
    const apiKey = "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";
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://maz.qzz.io",
            "X-Title": "MAZ",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "moonshotai/kimi-k2:free",
            "messages": [
                {
                    "role": "user",
                    "content": userMessage
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`MAZ error: API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
