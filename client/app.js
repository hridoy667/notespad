// Dynamic Base URL fallback
const API_BASE = window.APP_CONFIG?.API_BASE || 'https://notespad-production.up.railway.app/api';

// State management helpers
const getToken = () => localStorage.getItem('token');

const setSession = (token, role, name) => {
  if (token) localStorage.setItem('token', token);
  localStorage.setItem('role', role && role !== 'undefined' ? role : 'User');
  localStorage.setItem('name', name && name !== 'null' && name !== 'undefined' ? name : 'User');
  updateUI();
};

function logout() {
  localStorage.clear();
  updateUI();
}

function updateUI() {
  const token = getToken();
  const role = localStorage.getItem('role') || 'User';
  const name = localStorage.getItem('name') || 'User';

  if (token) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    document.getElementById('user-info').innerText = `Logged in as: ${name} (${role})`;

    // Hide Users Directory tab from non-Admin accounts
    const usersTab = document.getElementById('tab-users');
    if (role !== 'Admin') {
      usersTab.classList.add('hidden');
    } else {
      usersTab.classList.remove('hidden');
    }

    loadNotes();
  } else {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('logout-btn').classList.add('hidden');
    document.getElementById('user-info').innerText = 'Not logged in';
  }
}

// Auth Handlers
async function handleLogin(e) {
  e.preventDefault();
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      const token = data.token;
      let role = 'User';
      let name = 'User';

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          role = payload.role || 'User';
        } catch (err) {}
      }

      setSession(token, role, name);
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Network error during login');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const interestsRaw = document.getElementById('reg-interests').value;
  const interests = interestsRaw ? interestsRaw.split(',').map(s => s.trim()) : [];

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value,
        interests,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Registered successfully! Please login.');
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (err) {
    alert('Network error during registration');
  }
}

// Tab Switching
function switchTab(tabName) {
  ['notes', 'posts', 'users'].forEach(t => {
    document.getElementById(`view-${t}`).classList.add('hidden');
    document.getElementById(`tab-${t}`).classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    document.getElementById(`tab-${t}`).classList.add('text-gray-500');
  });

  document.getElementById(`view-${tabName}`).classList.remove('hidden');
  document.getElementById(`tab-${tabName}`).classList.add('border-b-2', 'border-blue-600', 'text-blue-600');

  if (tabName === 'notes') loadNotes();
  if (tabName === 'posts') loadPosts();
  if (tabName === 'users') {
    loadUsers();
    populateInterestDropdown(); // Load interests aggregation for the filter
  }
}

// Notes Handlers
async function loadNotes() {
  const res = await fetch(`${API_BASE}/notes?page=1&limit=10`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  const container = document.getElementById('notes-list');
  const notes = data.data || [];
  if (!Array.isArray(notes)) return;

  container.innerHTML = notes.map(n => `
    <div class="p-3 bg-gray-50 rounded border flex justify-between items-start cursor-pointer hover:bg-blue-50 transition-colors" onclick="getNoteById('${n._id || n.id}')">
      <div>
        <h4 class="font-bold text-gray-800">${n.title}</h4>
        <p class="text-gray-600 text-xs">${n.content || ''}</p>
        <div class="text-[10px] text-gray-400 mt-1">ID: ${n._id || n.id}</div>
      </div>
      <button onclick="event.stopPropagation(); deleteNote('${n._id || n.id}')" class="text-red-500 text-xs hover:underline">Delete</button>
    </div>
  `).join('');
}

async function getNoteById(overrideId) {
  const id = overrideId || document.getElementById('fetch-note-id').value.trim();
  const output = document.getElementById('note-by-id-output');
  if (!id) return alert('Enter Note ID');

  document.getElementById('fetch-note-id').value = id;
  output.innerText = 'Loading note details...';

  const res = await fetch(`${API_BASE}/notes/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();

  if (res.ok) {
    const note = data.note || data;
    output.innerText = `Title: ${note.title}\nContent: ${note.content || 'N/A'}\nID: ${note._id || note.id}`;
  } else {
    output.innerText = `Error: ${data.message || 'Note not found'}`;
  }
}

async function createNote() {
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;

  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ title, content }),
  });

  if (res.ok) {
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    loadNotes();
  }
}

async function deleteNote(id) {
  await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  loadNotes();
}

// Posts Handlers
async function loadPosts() {
  const res = await fetch(`${API_BASE}/posts?page=1&limit=10`);
  const responseData = await res.json();
  const posts = responseData.data?.posts || [];
  
  const container = document.getElementById('posts-list');
  container.innerHTML = Array.isArray(posts) ? posts.map(p => `
    <div class="p-3 bg-gray-50 rounded border flex justify-between items-start cursor-pointer hover:bg-blue-50 transition-colors" onclick="getPostById('${p._id || p.id}')">
      <div>
        <h4 class="font-bold text-gray-800">${p.title}</h4>
        <p class="text-gray-600 text-xs">${p.body || ''}</p>
        <div class="text-[10px] text-gray-400 mt-1">ID: ${p._id || p.id} | Author: ${p.userId?.name || 'Unknown'}</div>
      </div>
      <button onclick="event.stopPropagation(); deletePost('${p._id || p.id}')" class="text-red-500 text-xs hover:underline">Delete</button>
    </div>
  `).join('') : '';
}

async function getPostById(overrideId) {
  const id = overrideId || document.getElementById('fetch-post-id').value.trim();
  const output = document.getElementById('post-by-id-output');
  if (!id) return alert('Enter Post ID');

  document.getElementById('fetch-post-id').value = id;
  output.innerText = 'Loading post details...';

  const res = await fetch(`${API_BASE}/posts/${id}`);
  const data = await res.json();

  if (res.ok) {
    const post = data.data || data;
    output.innerText = `Title: ${post.title}\nBody: ${post.body || 'N/A'}\nAuthor: ${post.userId?.name || 'Unknown'}\nID: ${post._id || post.id}`;
  } else {
    output.innerText = `Error: ${data.message || 'Post not found'}`;
  }
}

async function createPost() {
  const title = document.getElementById('post-title').value;
  const body = document.getElementById('post-body').value;

  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ title, body }),
  });

  if (res.ok) {
    document.getElementById('post-title').value = '';
    document.getElementById('post-body').value = '';
    loadPosts();
  }
}

async function deletePost(id) {
  await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  loadPosts();
}

// Users & Integrated Aggregations

// 1. Fetch Users List
async function loadUsers() {
  const res = await fetch(`${API_BASE}/users?page=1&limit=10`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  const container = document.getElementById('users-list');

  if (!res.ok) {
    container.innerHTML = `<p class="text-red-500 text-xs">${data.message || 'Access Denied (Admin Only)'}</p>`;
    return;
  }

  const users = data.data || [];
  renderUsersList(users);
}

function renderUsersList(users) {
  const container = document.getElementById('users-list');
  container.innerHTML = users.map(u => `
    <div class="p-2.5 bg-gray-50 border rounded flex flex-col cursor-pointer hover:bg-blue-50 transition-colors" onclick="loadUserDetailWithLookup('${u._id || u.id}')">
      <strong class="text-gray-800 text-xs">${u.name}</strong>
      <span class="text-gray-500 text-[11px]">${u.email}</span>
      <span class="text-blue-600 text-[10px] font-semibold mt-1">${u.role || 'User'}</span>
    </div>
  `).join('');
}

// 2. Integrated $lookup Aggregation 
async function loadUserDetailWithLookup(userId) {
  const container = document.getElementById('user-details-pane');
  container.innerHTML = '<span class="text-gray-400">Executing $lookup aggregation for user...</span>';

  try {
    const res = await fetch(`${API_BASE}/users/${userId}/posts`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      container.innerHTML = `<span class="text-red-500">${result.message || 'User profile lookup failed.'}</span>`;
      return;
    }

    const userData = result.data || {};
    const posts = userData.userPosts || [];
    const interests = Array.isArray(userData.interests) ? userData.interests : [];

    container.innerHTML = `
      <div class="bg-white p-4 rounded border space-y-4">
        <div class="border-b pb-3 flex justify-between items-start">
          <div>
            <h4 class="font-bold text-sm text-gray-800">${userData.name}</h4>
            <p class="text-gray-500 text-xs">${userData.email} • <span class="text-blue-600 font-semibold">${userData.role || 'User'}</span></p>
            <p class="text-[10px] text-gray-400 mt-1">ID: ${userData._id}</p>
          </div>
          <div>
            <span class="font-semibold text-gray-600 block text-[11px] mb-1">Interests:</span>
            <div class="flex flex-wrap gap-1">
              ${interests.length > 0 
                ? interests.map(i => `<span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] border border-blue-200">${i}</span>`).join('')
                : '<span class="text-gray-400 text-[10px]">None</span>'
              }
            </div>
          </div>
        </div>

        <div>
          <h5 class="font-bold text-gray-700 text-xs mb-2">Joined User Posts (${posts.length})</h5>
          ${posts.length === 0 ? '<p class="text-gray-400 italic text-xs">No posts authored by this user.</p>' : `
            <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
              ${posts.map(p => `
                <div class="p-2.5 bg-gray-50 rounded border text-xs">
                  <div class="font-semibold text-gray-800">${p.title}</div>
                  <div class="text-gray-600 text-[11px] mt-0.5">${p.body || ''}</div>
                  <div class="text-[9px] text-gray-400 mt-1">ID: ${p._id}</div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = '<span class="text-red-500">Error running user lookup aggregation.</span>';
  }
}

// 3. Integrated $unwind + $group Aggregation
let cachedInterestsData = [];

async function populateInterestDropdown() {
  const select = document.getElementById('interest-filter');
  try {
    const res = await fetch(`${API_BASE}/users/interests`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const result = await res.json();

    if (res.ok && result.success) {
      cachedInterestsData = result.data || [];
      select.innerHTML = '<option value="ALL">All Interests</option>' + 
        cachedInterestsData.map(g => `<option value="${g.interest}">${g.interest} (${g.users?.length || 0})</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to populate interest dropdown', err);
  }
}

// 4. Filter Users by Interest using cached aggregation output
function filterUsersByInterest() {
  const selectedInterest = document.getElementById('interest-filter').value;
  if (selectedInterest === 'ALL') {
    loadUsers();
    return;
  }

  const group = cachedInterestsData.find(g => g.interest === selectedInterest);
  if (group) {
    renderUsersList(group.users || []);
  }
}

// Initialize application state
updateUI();