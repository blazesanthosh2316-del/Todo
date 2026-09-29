const API = '';                      // same server that sent this page
let token = localStorage.getItem('token');
let mode = 'login';

const $ = id => document.getElementById(id);

/* ---------- helpers ---------- */
async function call(path, options = {}) {
  const res = await fetch(API + path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function authHeaders(extra = {}) {
  return { Authorization: 'Bearer ' + token, ...extra };
}

function show(el, yes) { el.classList.toggle('hidden', !yes); }

/* ---------- auth ---------- */
function setMode(next) {
  mode = next;
  $('tabLogin').classList.toggle('on', next === 'login');
  $('tabSignup').classList.toggle('on', next === 'signup');
  show($('name'), next === 'signup');
  $('submitBtn').textContent = next === 'signup' ? 'Create account' : 'Log in';
  $('password').placeholder = next === 'signup' ? 'Password (6+ characters)' : 'Password';
  $('authMsg').textContent = '';
  $('name').value = $('email').value = $('password').value = '';
}

$('tabLogin').onclick = () => setMode('login');
$('tabSignup').onclick = () => setMode('signup');

$('submitBtn').onclick = async () => {
  const name = $('name').value.trim();
  const email = $('email').value.trim();
  const password = $('password').value;
  const msg = $('authMsg');
  msg.className = 'msg';

  if (!email || !password || (mode === 'signup' && !name)) {
    msg.textContent = 'Please fill in all fields';
    return;
  }

  $('submitBtn').disabled = true;
  $('submitBtn').textContent = 'Please wait…';

  try {
    if (mode === 'signup') {
      await call('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      msg.className = 'msg ok';
      msg.textContent = 'Account created 🎉 now log in';
      setTimeout(() => { setMode('login'); $('email').value = email; }, 1200);
    } else {
      const data = await call('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      token = data.token;
      localStorage.setItem('token', token);
      openTodos();
    }
  } catch (err) {
    msg.className = 'msg';
    msg.textContent = err.message;
  } finally {
    $('submitBtn').disabled = false;
    $('submitBtn').textContent = mode === 'signup' ? 'Create account' : 'Log in';
  }
};

$('logoutBtn').onclick = () => {
  localStorage.removeItem('token');
  token = null;
  show($('todoView'), false);
  show($('authView'), true);
  setMode('login');
};

/* ---------- todos ---------- */
function openTodos() {
  show($('authView'), false);
  show($('todoView'), true);
  loadTodos();
}

async function loadTodos() {
  const list = $('list');
  list.innerHTML = '<p class="empty">Loading…</p>';
  try {
    const todos = await call('/todos', { headers: authHeaders() });
    render(todos);
  } catch (err) {
    if (err.message.toLowerCase().includes('token')) return $('logoutBtn').click();
    list.innerHTML = '';
    $('todoMsg').textContent = err.message;
  }
}

function render(todos) {
  const list = $('list');
  list.innerHTML = '';

  if (!todos.length) {
    list.innerHTML = '<p class="empty">No todos yet. Add one above 👆</p>';
    return;
  }

  todos.forEach(todo => {
    const li = document.createElement('li');

    const box = document.createElement('span');
    box.className = 'check';
    box.textContent = todo.done ? '✅' : '⬜';
    box.onclick = () => toggle(todo);

    const title = document.createElement('span');
    title.className = 'title' + (todo.done ? ' done' : '');
    title.textContent = todo.title;
    title.onclick = () => toggle(todo);

    const edit = document.createElement('button');
    edit.className = 'icon';
    edit.textContent = '✏️';
    edit.onclick = () => startEdit(li, todo);

    const del = document.createElement('button');
    del.className = 'icon';
    del.textContent = '🗑️';
    del.onclick = () => remove(todo);

    li.append(box, title, edit, del);
    list.append(li);
  });
}

function startEdit(li, todo) {
  li.innerHTML = '';

  const input = document.createElement('input');
  input.className = 'edit';
  input.value = todo.title;

  const save = document.createElement('button');
  save.className = 'icon';
  save.textContent = '💾';
  save.onclick = () => saveEdit(todo, input.value);

  const cancel = document.createElement('button');
  cancel.className = 'icon';
  cancel.textContent = '✖️';
  cancel.onclick = loadTodos;

  input.onkeydown = e => {
    if (e.key === 'Enter') saveEdit(todo, input.value);
    if (e.key === 'Escape') loadTodos();
  };

  li.append(input, save, cancel);
  input.focus();
}

async function saveEdit(todo, value) {
  const title = value.trim();
  if (!title || title === todo.title) return loadTodos();
  await update(todo._id, { title });
}

async function toggle(todo) { await update(todo._id, { done: !todo.done }); }

async function update(id, changes) {
  try {
    await call('/todos/' + id, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(changes),
    });
    loadTodos();
  } catch (err) { $('todoMsg').textContent = err.message; }
}

async function remove(todo) {
  try {
    await call('/todos/' + todo._id, { method: 'DELETE', headers: authHeaders() });
    loadTodos();
  } catch (err) { $('todoMsg').textContent = err.message; }
}

$('addBtn').onclick = addTodo;
$('newTodo').onkeydown = e => { if (e.key === 'Enter') addTodo(); };

async function addTodo() {
  const title = $('newTodo').value.trim();
  if (!title) return;
  try {
    await call('/todos', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title }),
    });
    $('newTodo').value = '';
    $('todoMsg').textContent = '';
    loadTodos();
  } catch (err) { $('todoMsg').textContent = err.message; }
}

/* ---------- start ---------- */
if (token) openTodos(); else setMode('login');
