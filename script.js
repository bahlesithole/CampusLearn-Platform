// --- Profile menu item click info ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.profile-menu-item').forEach((item, idx) => {
    item.onclick = () => {
      let info = '';
      switch (idx) {
        case 0:
          info = 'Tasks: View and manage your assigned tasks.';
          break;
        case 1:
          info = 'Questions: See your submitted questions and their status.';
          break;
        case 2:
          info = 'Responses: Review responses to your questions.';
          break;
        case 3:
          info = 'Get Delegated Help: Request help from a tutor or peer.';
          break;
        case 4:
          info = 'Contact Tutor: Reach out to a tutor for direct support.';
          break;
        default:
          info = 'More information coming soon.';
      }
      alert(info);
    };
  });
});

// --- Navigation ---
function showScreen(id, event) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
}

// --- API & Auth ---
const API_URL = 'http://localhost:4000/api';
let authToken = localStorage.getItem('authToken') || null;

// --- Signup ---
async function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const errorDiv = document.getElementById('signupError');

  if (!name || !email || !password) {
    errorDiv.textContent = "All fields are required.";
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errorDiv.textContent = "Invalid email.";
    return;
  }
  if (password.length < 6) {
    errorDiv.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    errorDiv.textContent = "";
    alert("Signup successful! Please log in.");
    showScreen('loginScreen');
  } catch (err) {
    errorDiv.textContent = err.message;
  }
}

// --- Login ---
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify({ name: data.name, email: data.email }));
    errorDiv.textContent = "";
    loadProfile();
    showScreen('profileScreen');
  } catch (err) {
    errorDiv.textContent = err.message;
  }
}

// --- Profile ---
async function loadProfile() {
  authToken = localStorage.getItem('authToken');
  if (!authToken) return;
  try {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': 'Bearer ' + authToken }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load profile');
    document.getElementById('profileInfo').innerHTML = `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Academic Details:</strong> <span id="profileAcademicView">${data.academicDetails || ''}</span></p>
      <p><strong>Topics Needed:</strong> <span id="profileTopicsView">${(data.topicsNeeded||[]).join(', ')}</span></p>
    `;
    // Fill edit form fields
    document.getElementById('profileName').value = data.name || '';
    document.getElementById('profileAcademic').value = data.academicDetails || '';
    document.getElementById('profileTopics').value = (data.topicsNeeded||[]).join(', ');
  } catch (err) {
    document.getElementById('profileInfo').innerHTML = `<span style='color:#dc2626;'>${err.message}</span>`;
  }
}

// Profile edit logic
document.addEventListener('DOMContentLoaded', () => {
  const editBtn = document.getElementById('editProfileBtn');
  const form = document.getElementById('profileEditForm');
  const cancelBtn = document.getElementById('cancelProfileEdit');
  if (editBtn && form && cancelBtn) {
    editBtn.onclick = () => {
      form.style.display = '';
      editBtn.style.display = 'none';
    };
    cancelBtn.onclick = () => {
      form.style.display = 'none';
      editBtn.style.display = '';
    };
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('profileName').value.trim();
      const academicDetails = document.getElementById('profileAcademic').value.trim();
      const topicsNeededRaw = document.getElementById('profileTopics').value;
      const topicsNeeded = topicsNeededRaw.split(',').map(t => t.trim()).filter(Boolean);
      if (!academicDetails) {
        alert('Academic Details is required.');
        return;
      }
      if (!topicsNeededRaw || topicsNeeded.length === 0) {
        alert('Topics Needed is required.');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (authToken || localStorage.getItem('authToken'))
          },
          body: JSON.stringify({ name, academicDetails, topicsNeeded })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update profile');
        form.style.display = 'none';
        editBtn.style.display = '';
        loadProfile();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    };
  }
});

// --- Topics ---
let topics = [];
function createTopic() {
  const input = document.getElementById('topicNameInput');
  const name = input.value.trim();
  const list = document.getElementById('topicList');
  if (!name) {
    list.innerHTML = '<span style="color:#dc2626;">Please enter a topic name.</span>';
    return;
  }
  topics.push(name);
  input.value = '';
  list.innerHTML = `<span style='color:#16a34a;'>Topic added!</span>`;
  setTimeout(renderTopics, 700);
}
function renderTopics() {
  const list = document.getElementById('topicList');
  if (topics.length === 0) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = topics.map(t => `<div class='topic-pill'>${t}</div>`).join('');
}
// -Handle upload-
async function handleUpload() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const contentDiv = document.getElementById('uploadedContent');

  if (!file) {
    contentDiv.innerHTML = "<span style='color:#dc2626;'>No file selected.</span>";
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify({ uploadedBy: 'anonymous', module: 'WPR3781' }));

  try {
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      contentDiv.innerHTML = `<span style='color:#16a34a;'>Upload successful! File ID: ${data.id}</span>`;
    } else {
      contentDiv.innerHTML = `<span style='color:#dc2626;'>Upload failed: ${data.error}</span>`;
    }
  } catch (err) {
    console.error(err);
    contentDiv.innerHTML = `<span style='color:#dc2626;'>Upload error: ${err.message}</span>`;
  }
}

// --- Forgot Password ---
function showForgotPasswordModal(event) {
  event.preventDefault();
  document.getElementById('forgotPasswordModal').style.display = 'block';
  document.getElementById('forgotEmail').value = '';
  document.getElementById('forgotError').textContent = '';
}
function closeForgotPasswordModal() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
}
async function handleForgotPassword() {
  const email = document.getElementById('forgotEmail').value.trim();
  const errorDiv = document.getElementById('forgotError');
  if (!email) {
    errorDiv.textContent = 'Please enter your email.';
    return;
  }
  try {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    errorDiv.style.color = '#16a34a';
    errorDiv.textContent = `Your new password is: ${data.newPassword}`;
  } catch (err) {
    errorDiv.style.color = '#dc2626';
    errorDiv.textContent = err.message;
  }
}

// Close modal if clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('forgotPasswordModal');
  if (event.target === modal) {
    closeForgotPasswordModal();
  }
};
