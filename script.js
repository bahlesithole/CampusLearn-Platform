// --- Login validation logic ---
const loginBtn = document.getElementById('loginBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');

if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        // Simple email regex
        const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
        // Password: at least 6 chars, at least 1 letter and 1 number
        const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
        if (!emailValid) {
            loginError.textContent = 'Please enter a valid email address.';
            return;
        }
        if (!passwordValid) {
            loginError.textContent = 'Password must be at least 6 characters and contain a letter and a number.';
            return;
        }
        loginError.textContent = '';
        showScreen('profileScreen');
    });
}
// --- Topic creation logic ---
let topics = [];
function bindTopicEvents() {
    const topicInput = document.getElementById('topicNameInput');
    const topicBtn = document.getElementById('createTopicBtn');
    const topicListDiv = document.getElementById('topicList');
    if (!topicBtn || !topicInput || !topicListDiv) return;
    topicBtn.onclick = function() {
        const name = topicInput.value.trim();
        if (!name) {
            topicListDiv.innerHTML = '<span style="color:red">Please enter a topic name.</span>';
            return;
        }
        topics.push(name);
        topicInput.value = '';
        renderTopics();
    };
    renderTopics();
}

function renderTopics() {
    const topicListDiv = document.getElementById('topicList');
    if (!topicListDiv) return;
    if (topics.length === 0) {
        topicListDiv.innerHTML = '<em>No topics created yet.</em>';
        return;
    }
    topicListDiv.innerHTML = '<h3>Topics:</h3><ul style="padding-left:20px;">' +
        topics.map(t => `<li>${t}</li>`).join('') + '</ul>';
}

// Ensure topic events are bound when topic screen is shown
document.addEventListener('DOMContentLoaded', function() {
    bindTopicEvents();
});
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Show selected screen
    document.getElementById(screenId).classList.add('active');
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) event.target.classList.add('active');
    // Re-bind topic events if topic screen is shown
    if (screenId === 'topicScreen') {
        bindTopicEvents();
    }
}

        // --- Upload logic ---
        let selectedFile = null;

        // Add click handlers for upload area
        document.querySelector('.upload-area').addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.doc,.docx,.txt,.jpg,.png';
            input.click();
            input.addEventListener('change', function(e) {
                if (e.target.files.length > 0) {
                    selectedFile = e.target.files[0];
                    const fileName = selectedFile.name;
                    document.querySelector('.upload-text').innerHTML = `Selected: ${fileName}<br>Click upload to proceed`;
                }
            });
        });

        // Add drag and drop functionality
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#007AFF';
            this.style.backgroundColor = '#f0f8ff';
        });
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ccc';
            this.style.backgroundColor = '#fafafa';
        });
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ccc';
            this.style.backgroundColor = '#fafafa';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                selectedFile = files[0];
                const fileName = selectedFile.name;
                document.querySelector('.upload-text').innerHTML = `Selected: ${fileName}<br>Click upload to proceed`;
            }
        });

        // Handle upload button click
        document.querySelector('.upload-btn').addEventListener('click', function() {
            const contentDiv = document.getElementById('uploadedContent');
            if (!selectedFile) {
                contentDiv.innerHTML = '<span style="color:red">No file selected.</span>';
                return;
            }
            // Only display text for text files
            if (selectedFile.type.startsWith('text') || selectedFile.name.match(/\.(txt|md|csv)$/i)) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    contentDiv.innerHTML = `<h3>File Content:</h3><pre style='white-space:pre-wrap;max-height:300px;overflow:auto;'>${e.target.result}</pre>`;
                };
                reader.readAsText(selectedFile);
            } else {
                contentDiv.innerHTML = `<span style='color:orange'>Preview not supported for this file type. File selected: ${selectedFile.name}</span>`;
            }
        });
