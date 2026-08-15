const API_BASE = '/api'; // Relative URL since frontend is served by Express

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    alert('Logged in successfully!');
    fetchNotes();
  } else {
    alert(data.message);
  }
}

async function fetchNotes() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/notes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const notes = await res.json();
  // Render notes to #app-content...
}