require('dotenv').config();

const express = require('express');
const path = require('node:path');
const { safePool, vulnerablePool, waitForDatabase } = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const LOCAL_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

if (process.env.NODE_ENV === 'production') {
  console.error('Neverend Lab contém endpoints intencionalmente vulneráveis e não roda em produção.');
  process.exit(1);
}

app.disable('x-powered-by');
app.use((req, res, next) => {
  if (!LOCAL_ADDRESSES.has(req.socket.remoteAddress)) {
    return res.status(403).send('Este laboratório só aceita conexões locais.');
  }
  next();
});
app.use(express.json({ limit: '5kb' }));
app.use(express.static(PUBLIC_DIR, { index: 'index.html' }));

app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await safePool.query('SELECT DATABASE() AS databaseName');
    res.json({ ok: true, database: rows[0].databaseName, labMode: process.env.LAB_MODE === 'true' });
  } catch (error) {
    res.status(503).json({ ok: false, message: 'MySQL não respondeu. Confira .env e se o servidor está ligado.' });
  }
});

app.use('/api', (_req, res, next) => {
  if (process.env.LAB_MODE !== 'true') {
    return res.status(403).json({ ok: false, message: 'Ative LAB_MODE=true apenas para testes locais.' });
  }
  next();
});

app.get('/api/users/vulnerable', async (req, res) => {
  const name = String(req.query.name ?? '');
  if (name.length > 120) return res.status(400).json({ ok: false, message: 'Limite de 120 caracteres.' });

  // INTENCIONALMENTE VULNERÁVEL: não copiar este padrão para aplicações reais.
  // A conexão separada habilita múltiplas instruções apenas para demonstrar stacked queries.
  const sql = `SELECT id, name, email, role, status FROM users WHERE name LIKE '%${name}%' ORDER BY id`;
  try {
    const [rawResults] = await vulnerablePool.query(sql);
    res.json({ ok: true, sql, resultSets: normalizeResultSets(rawResults) });
  } catch (error) {
    res.status(400).json({ ok: false, sql, message: error.sqlMessage || error.message });
  }
});

app.get('/api/users/fixed', async (req, res) => {
  const name = String(req.query.name ?? '').trim();
  if (name.length > 120) return res.status(400).json({ ok: false, message: 'Limite de 120 caracteres.' });
  try {
    const [rows] = await safePool.execute(
      'SELECT id, name, email, role, status FROM users WHERE name LIKE ? ORDER BY id',
      [`%${name}%`]
    );
    res.json({ ok: true, rows });
  } catch (_error) {
    res.status(500).json({ ok: false, message: 'Falha ao consultar usuários.' });
  }
});

app.get('/api/comments', async (_req, res) => {
  try {
    const [rows] = await safePool.execute(
      'SELECT id, author, comment, created_at AS createdAt FROM comments ORDER BY id DESC LIMIT 100'
    );
    res.json({ ok: true, rows });
  } catch (_error) {
    res.status(500).json({ ok: false, message: 'Falha ao carregar comentários.' });
  }
});

app.post('/api/comments', async (req, res) => {
  const author = String(req.body?.author ?? '').trim().slice(0, 80) || 'Visitante';
  const comment = String(req.body?.comment ?? '');
  if (!comment.trim()) return res.status(400).json({ ok: false, message: 'Escreva um comentário.' });
  if (comment.length > 2000) return res.status(400).json({ ok: false, message: 'Limite de 2.000 caracteres.' });
  try {
    await safePool.execute('INSERT INTO comments (author, comment) VALUES (?, ?)', [author, comment]);
    res.status(201).json({ ok: true, message: 'Comentário salvo no MySQL local.' });
  } catch (_error) {
    res.status(500).json({ ok: false, message: 'Falha ao salvar comentário.' });
  }
});

app.delete('/api/comments', async (req, res) => {
  if (req.body?.confirm !== 'CLEAR') return res.status(400).json({ ok: false, message: 'Confirmação inválida.' });
  try {
    await safePool.execute('DELETE FROM comments');
    res.json({ ok: true, message: 'Comentários apagados.' });
  } catch (_error) {
    res.status(500).json({ ok: false, message: 'Falha ao apagar comentários.' });
  }
});

app.use((req, res) => res.status(404).json({ ok: false, message: 'Rota não encontrada.' }));

function normalizeResultSets(rawResults) {
  const sets = Array.isArray(rawResults) && rawResults.length > 0 && Array.isArray(rawResults[0])
    ? rawResults
    : [rawResults];
  return sets.map((set, index) => ({
    statement: index + 1,
    rows: Array.isArray(set) ? set : [],
    affectedRows: Array.isArray(set) ? undefined : set?.affectedRows
  }));
}

async function start() {
  try {
    await waitForDatabase();
    app.listen(PORT, '127.0.0.1', () => {
      console.log(`Neverend Lab ativo apenas neste computador: http://127.0.0.1:${PORT}`);
      console.log('Rotas vulneráveis habilitadas:', process.env.LAB_MODE === 'true');
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

start();
