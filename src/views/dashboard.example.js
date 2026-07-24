const myProjects = [
  { name: 'Emby Media Scraper', url: 'http://localhost:8096', description: 'Metadata and asset sync tool', icon: '⚡' },
  { name: 'Local Media Server', url: 'http://localhost:8096', description: 'Jellyfin streaming node', icon: '🎬' },
  { name: 'File Storage', url: 'http://localhost:8080', description: 'Self-hosted Nextcloud instance', icon: '📁' },
  { name: 'Code Repository', url: 'https://github.com', description: 'Git organization workspace', icon: '💻' }
];

function renderDashboard(rows) {
  const renderColumn = (statusFilter, prevStatus, nextStatus) => {
    const filtered = rows.filter(t => t.status === statusFilter);
    if (filtered.length === 0) return '<div class="empty-msg">// empty queue</div>';

    return filtered.map(t => `
      <div class="task-card" x-data="{ editing: false, title: '${t.title.replace(/'/g, "\\'")}', content: '${(t.content || '').replace(/'/g, "\\'")}' }">
        
        <!-- VIEW MODE -->
        <div x-show="!editing">
          <div class="task-title" x-text="title"></div>
          <div class="task-desc" x-text="content"></div>
          <div class="task-actions">
            <button @click="editing = true" class="term-btn">edit</button>
            ${prevStatus ? `<button @click="moveTask(${t.id}, '${prevStatus}')" class="term-btn">⬅ move</button>` : ''}
            ${nextStatus ? `<button @click="moveTask(${t.id}, '${nextStatus}')" class="term-btn">move ➔</button>` : ''}
            <button @click="deleteTask(${t.id})" class="term-btn term-btn-danger">kill</button>
          </div>
        </div>

        <!-- EDIT MODE -->
        <div x-show="editing" style="display: none;">
          <input type="text" x-model="title" class="term-input">
          <input type="text" x-model="content" class="term-input" placeholder="notes...">
          <div class="task-actions" style="margin-top: 8px;">
            <button @click="updateTask(${t.id}, title, content); editing = false;" class="term-btn term-btn-success">save</button>
            <button @click="editing = false" class="term-btn">cancel</button>
          </div>
        </div>

      </div>
    `).join('');
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hoss Landing Zone</title>
      <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-base: #000000;
          --bg-panel: #0a0a0c;
          --bg-card: #121217;
          --border-color: #272733;
          --accent-purple: #a855f7;
          --accent-purple-glow: rgba(168, 85, 247, 0.25);
          --accent-green: #22c55e;
          --accent-red: #ef4444;
          --text-main: #f3f4f6;
          --text-dim: #9ca3af;
        }

        body {
          font-family: 'JetBrains Mono', monospace;
          background-color: var(--bg-base);
          color: var(--text-main);
          margin: 0;
          padding: 20px;
        }

        .container {
          width: 95%;
          max-width: 1650px;
          margin: 0 auto;
          background: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(168, 85, 247, 0.1);
        }

        .header-banner {
          display: flex;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
          margin-bottom: 25px;
        }

        .logo-container img, .logo-container .logo-fallback {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          border: 1px solid var(--accent-purple);
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--accent-purple);
          object-fit: cover;
        }

        .header-text h1 {
          margin: 0 0 5px 0;
          font-size: 24px;
          color: var(--accent-purple);
          letter-spacing: -0.5px;
          text-shadow: 0 0 15px var(--accent-purple-glow);
        }

        .status-line {
          font-size: 11px;
          color: var(--text-dim);
          margin-bottom: 8px;
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: var(--accent-green);
          border-radius: 50%;
          margin-right: 6px;
          box-shadow: 0 0 8px var(--accent-green);
        }

        .api-blurb {
          font-size: 11px;
          color: var(--text-dim);
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          padding: 6px 10px;
          border-radius: 4px;
          display: inline-block;
        }

        .api-blurb code {
          color: var(--accent-purple);
        }

        h2 {
          font-size: 15px;
          color: var(--accent-purple);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 35px;
          margin-bottom: 15px;
          border-left: 3px solid var(--accent-purple);
          padding-left: 10px;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 15px;
        }

        .project-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 15px;
          border-radius: 6px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease-in-out;
          display: block;
        }

        .project-card:hover {
          border-color: var(--accent-purple);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px var(--accent-purple-glow);
        }

        .project-card h4 {
          margin: 0 0 6px 0;
          font-size: 14px;
          color: var(--text-main);
        }

        .project-card p {
          margin: 0;
          font-size: 12px;
          color: var(--text-dim);
        }

        .kanban {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 15px;
        }

        .column {
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 15px;
          min-height: 280px;
        }

        .column h3 {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: var(--text-dim);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .task-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-left: 3px solid var(--accent-purple);
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 12px;
          font-size: 13px;
        }

        .task-title {
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .task-desc {
          font-size: 11px;
          color: var(--text-dim);
          margin-bottom: 10px;
          word-break: break-all;
        }

        .empty-msg {
          font-size: 11px;
          color: var(--border-color);
          font-style: italic;
        }

        .add-task-form {
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .term-input {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 8px 12px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .term-input:focus {
          outline: none;
          border-color: var(--accent-purple);
        }

        .add-task-form input[name="title"] { flex: 2; }
        .add-task-form input[name="content"] { flex: 2; }
        .add-task-form select { flex: 1; }

        .task-actions {
          display: flex;
          gap: 6px;
        }

        .term-btn {
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          color: var(--text-dim);
          padding: 4px 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.1s;
        }

        .term-btn:hover {
          border-color: var(--text-main);
          color: var(--text-main);
          background: var(--border-color);
        }

        .term-btn-success {
          border-color: var(--accent-green);
          color: var(--accent-green);
        }
        .term-btn-success:hover { background: rgba(34, 197, 94, 0.15); }

        .term-btn-danger {
          border-color: var(--accent-red);
          color: var(--accent-red);
        }
        .term-btn-danger:hover { background: rgba(239, 68, 68, 0.15); }

        .term-submit {
          background: var(--accent-purple-glow);
          border: 1px solid var(--accent-purple);
          color: var(--accent-purple);
          font-weight: bold;
          flex: 1;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          border-radius: 4px;
          padding: 8px;
          transition: background 0.2s;
        }
        .term-submit:hover { background: rgba(168, 85, 247, 0.35); color: #fff; }
      </style>
      <script>
        async function deleteTask(id) {
          if (!confirm('Delete task ID: ' + id + '?')) return;
          await fetch('/api/tasks/' + id, { method: 'DELETE' });
          window.location.reload();
        }

        async function moveTask(id, newStatus) {
          await fetch('/api/tasks/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          window.location.reload();
        }

        async function updateTask(id, title, content) {
          await fetch('/api/tasks/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
          });
          window.location.reload();
        }
      </script>
    </head>
    <body>
      <div class="container">
        
        <div class="header-banner">
          <div class="logo-container">
            <img src="/logo.png" alt="Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="logo-fallback" style="display:none;">⚡</div>
          </div>
          <div class="header-text">
            <h1>Hoss Landing Zone</h1>
            <div class="status-line"><span class="status-dot"></span>system online</div>
            <div class="api-blurb">
              API POST: <code>POST /api/tasks</code> (JSON body: <code>{"title": "...", "content": "...", "status": "todo|inprogress|done"}</code>)
            </div>
          </div>
        </div>

        <h2>Frequently Visited</h2>
        <div class="projects-grid">
          ${myProjects.map(p => `
            <a href="${p.url}" target="_blank" class="project-card">
              <h4>${p.icon} ${p.name}</h4>
              <p>${p.description}</p>
            </a>
          `).join('')}
        </div>

        <h2>Task List</h2>
        
        <!-- Wrap the form components in an x-data component -->
        <div x-data="{ title: '', content: '', status: 'todo', async addTask() {
          if (!this.title.trim()) return;
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: this.title, content: this.content, status: this.status })
          });
          if (res.ok) window.location.reload();
        }}">
          <div class="add-task-form">
            <input type="text" x-model="title" class="term-input" placeholder="task title..." required>
            <input type="text" x-model="content" class="term-input" placeholder="notes...">
            <select x-model="status" class="term-input" style="background:var(--bg-card)">
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Completed</option>
            </select>
            <button type="button" class="term-submit" @click="addTask()">+ Add Task</button>
          </div>
        </div>

        <div class="kanban">
          <div class="column">
            <h3>To Do</h3>
            ${renderColumn('todo', null, 'inprogress')}
          </div>
          <div class="column">
            <h3>In Progress</h3>
            ${renderColumn('inprogress', 'todo', 'done')}
          </div>
          <div class="column">
            <h3>Completed</h3>
            ${renderColumn('done', 'inprogress', null)}
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

module.exports = renderDashboard;