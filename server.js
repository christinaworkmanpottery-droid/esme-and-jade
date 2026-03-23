const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();

// Simple flat-file JSON blog (no DB dependency = free on Render)
const fs = require('fs');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Copy seed data on first run
const BLOG_FILE = path.join(DATA_DIR, 'blog.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SEED_BLOG = path.join(__dirname, 'seed', 'blog.json');
if (!fs.existsSync(BLOG_FILE) && fs.existsSync(SEED_BLOG)) {
  fs.copyFileSync(SEED_BLOG, BLOG_FILE);
}

function loadBlog() {
  try { return JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8')); }
  catch { return []; }
}
function saveBlog(posts) { fs.writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2)); }

function loadSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); }
  catch { return { adminPasswordHash: hashPw('esmejade13') }; }
}
function saveSettings(s) { fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2)); }

function hashPw(pw) { return crypto.createHash('sha256').update(pw).digest('hex'); }
function uuid() { return crypto.randomUUID(); }

// Init settings
const settings = loadSettings();
if (!settings.adminPasswordHash) { settings.adminPasswordHash = hashPw('esmejade13'); saveSettings(settings); }

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin auth middleware
function checkAdmin(req, res, next) {
  const pw = req.query.password || req.body.password;
  if (!pw || hashPw(pw) !== loadSettings().adminPasswordHash) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Blog API
app.get('/api/admin/blog', checkAdmin, (req, res) => {
  res.json(loadBlog());
});

app.post('/api/admin/blog', checkAdmin, (req, res) => {
  const { title, slug, content, excerpt, published } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const posts = loadBlog();
  const post = {
    id: uuid(),
    title,
    slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    content,
    excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200),
    published: published ? 1 : 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  posts.unshift(post);
  saveBlog(posts);
  res.json(post);
});

app.put('/api/admin/blog/:id', checkAdmin, (req, res) => {
  const posts = loadBlog();
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const { title, slug, content, excerpt, published } = req.body;
  if (title) posts[idx].title = title;
  if (slug) posts[idx].slug = slug;
  if (content) posts[idx].content = content;
  if (excerpt !== undefined) posts[idx].excerpt = excerpt;
  if (published !== undefined) posts[idx].published = published ? 1 : 0;
  posts[idx].updated_at = new Date().toISOString();
  saveBlog(posts);
  res.json(posts[idx]);
});

app.delete('/api/admin/blog/:id', checkAdmin, (req, res) => {
  let posts = loadBlog();
  posts = posts.filter(p => p.id !== req.params.id);
  saveBlog(posts);
  res.json({ success: true });
});

// Public blog API
app.get('/api/blog', (req, res) => {
  const posts = loadBlog().filter(p => p.published);
  res.json(posts.map(({ content, ...p }) => p));
});

app.get('/api/blog/:slug', (req, res) => {
  const post = loadBlog().find(p => p.slug === req.params.slug && p.published);
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

// Admin page
app.get('/admin', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'admin.html')); });

// Blog page
app.get('/blog', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'blog.html')); });
app.get('/blog/:slug', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'blog.html')); });

// SPA fallback
app.get('*', (req, res) => {
  const file = path.join(__dirname, 'public', req.path);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return res.sendFile(file);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Esme & Jade running on port ' + PORT));
