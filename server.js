const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;
const db = new Database('sales.db');

app.use(cors());
app.use(express.json());

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT DEFAULT '',
    contact TEXT DEFAULT '',
    amount REAL DEFAULT 0,
    stage TEXT DEFAULT 'lead',
    probability INTEGER DEFAULT 15,
    owner TEXT DEFAULT 'Hena Akter',
    source TEXT DEFAULT 'inbound',
    close_date TEXT DEFAULT '',
    created_at TEXT DEFAULT '',
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT DEFAULT '',
    title TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    tier TEXT DEFAULT 'cold',
    last_contact TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER,
    type TEXT DEFAULT 'note',
    subject TEXT DEFAULT '',
    date TEXT DEFAULT '',
    owner TEXT DEFAULT 'Hena Akter',
    done INTEGER DEFAULT 0
  );
`);

// Seed data if empty
const dealCount = db.prepare('SELECT COUNT(*) as c FROM deals').get().c;
if (dealCount === 0) {
  const seedDeals = [
    ['Enterprise Platform Migration', 'TechCorp Inc.', 'Sarah Chen', 85000, 'negotiation', 70, 'Hena Akter', 'inbound', '2026-07-30', '2026-06-01', 'Finalizing contract terms.'],
    ['Cloud Infrastructure Setup', 'DataFlow Ltd', 'Mike Ross', 120000, 'proposal', 55, 'Hena Akter', 'referral', '2026-08-15', '2026-06-10', 'Proposal sent, awaiting feedback.'],
    ['CRM Implementation', 'RetailMax', 'Anna White', 45000, 'qualified', 40, 'Hena Akter', 'outbound', '2026-09-01', '2026-06-20', ''],
    ['Security Audit Package', 'SecureNet', 'Tom Hardy', 65000, 'lead', 15, 'Hena Akter', 'event', '2026-10-10', '2026-07-01', 'Initial contact at security conference.'],
    ['Mobile App Development', 'AppNova', 'Lisa Park', 95000, 'won', 100, 'Hena Akter', 'inbound', '2026-06-15', '2026-05-01', 'Signed and onboarding.'],
    ['Data Analytics Platform', 'InsightIQ', 'Raj Patel', 75000, 'lost', 0, 'Hena Akter', 'partner', '2026-06-30', '2026-05-15', 'Lost to competitor.'],
    ['E-commerce Overhaul', 'ShopFlow', 'Emily Davis', 110000, 'proposal', 55, 'Hena Akter', 'inbound', '2026-08-20', '2026-06-25', ''],
  ];
  const insertDeal = db.prepare('INSERT INTO deals (name,company,contact,amount,stage,probability,owner,source,close_date,created_at,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  seedDeals.forEach(d => insertDeal.run(...d));

  const seedContacts = [
    ['Sarah Chen', 'TechCorp Inc.', 'CTO', 'sarah@techcorp.com', '+1 (415) 555-0101', 'hot', '2026-07-01'],
    ['Mike Ross', 'DataFlow Ltd', 'VP Engineering', 'mike@dataflow.io', '+1 (415) 555-0102', 'warm', '2026-06-28'],
    ['Anna White', 'RetailMax', 'Director of IT', 'anna@retailmax.com', '+1 (415) 555-0103', 'warm', '2026-06-25'],
    ['Tom Hardy', 'SecureNet', 'CISO', 'tom@securenet.com', '+1 (415) 555-0104', 'cold', '2026-06-15'],
    ['Lisa Park', 'AppNova', 'CEO', 'lisa@appnova.com', '+1 (415) 555-0105', 'hot', '2026-07-02'],
    ['Raj Patel', 'InsightIQ', 'Head of Data', 'raj@insightiq.com', '+1 (415) 555-0106', 'cold', '2026-06-10'],
    ['Emily Davis', 'ShopFlow', 'COO', 'emily@shopflow.com', '+1 (415) 555-0107', 'warm', '2026-06-30'],
  ];
  const insertContact = db.prepare('INSERT INTO contacts (name,company,title,email,phone,tier,last_contact) VALUES (?,?,?,?,?,?,?)');
  seedContacts.forEach(c => insertContact.run(...c));

  const seedActivities = [
    [1, 'call', 'Contract negotiation call', '2026-07-03', 'Hena Akter', 0],
    [1, 'email', 'Sent revised terms', '2026-07-01', 'Hena Akter', 1],
    [2, 'meeting', 'Proposal review meeting', '2026-07-05', 'Hena Akter', 0],
    [3, 'task', 'Prepare demo environment', '2026-07-04', 'Hena Akter', 0],
    [4, 'note', 'Follow up after conference', '2026-07-02', 'Hena Akter', 1],
    [7, 'call', 'Initial discovery call', '2026-07-06', 'Hena Akter', 0],
  ];
  const insertActivity = db.prepare('INSERT INTO activities (deal_id,type,subject,date,owner,done) VALUES (?,?,?,?,?,?)');
  seedActivities.forEach(a => insertActivity.run(...a));
  console.log('Database seeded with sample data');
}

// API Routes
app.get('/api/deals', (req, res) => {
  const deals = db.prepare('SELECT * FROM deals ORDER BY close_date ASC').all();
  res.json(deals);
});

app.post('/api/deals', (req, res) => {
  const { name, company, contact, amount, stage, probability, owner, source, close_date, notes } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  const stmt = db.prepare('INSERT INTO deals (name,company,contact,amount,stage,probability,owner,source,close_date,created_at,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  const result = stmt.run(name, company || '', contact || '', amount || 0, stage || 'lead', probability || 15, owner || 'Hena Akter', source || 'inbound', close_date || today, today, notes || '');
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/deals/:id', (req, res) => {
  const { stage, probability } = req.body;
  db.prepare('UPDATE deals SET stage = ?, probability = ? WHERE id = ?').run(stage, probability, req.params.id);
  res.json({ ok: true });
});

app.delete('/api/deals/:id', (req, res) => {
  db.prepare('DELETE FROM deals WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.get('/api/contacts', (req, res) => {
  const contacts = db.prepare('SELECT * FROM contacts ORDER BY id ASC').all();
  res.json(contacts);
});

app.get('/api/activities', (req, res) => {
  const activities = db.prepare('SELECT * FROM activities ORDER BY date ASC').all();
  res.json(activities);
});

app.put('/api/activities/:id', (req, res) => {
  const { done } = req.body;
  db.prepare('UPDATE activities SET done = ? WHERE id = ?').run(done ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
