-- Empower D1 Schema: initial migration

CREATE TABLE clients (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  org_name      TEXT NOT NULL,
  org_type      TEXT,                 -- public | private | independent
  board         TEXT,                 -- TDSB | YRDSB | DDSB | PDSB | other | na
  contact_name  TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status        TEXT DEFAULT 'new',   -- new | contacted | engaged | closed
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(contact_email)
);

CREATE TABLE intakes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id        INTEGER NOT NULL REFERENCES clients(id),
  enrolment_range  TEXT,
  grade_range      TEXT,
  identified_range TEXT,              -- approx count range, NOT individuals
  exceptionalities TEXT,              -- JSON array of selected areas
  current_staffing TEXT,
  current_resources TEXT,
  challenges       TEXT,
  budget_range     TEXT,
  goals            TEXT,
  created_at       TEXT DEFAULT (datetime('now'))
);

CREATE TABLE program_plans (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id   INTEGER NOT NULL REFERENCES clients(id),
  intake_id   INTEGER NOT NULL REFERENCES intakes(id),
  plan_md     TEXT NOT NULL,          -- generated markdown
  model       TEXT,                   -- e.g. claude-sonnet-4-6
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE leads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT,
  role       TEXT,
  org        TEXT,
  email      TEXT NOT NULL,
  phone      TEXT,
  message    TEXT,
  source     TEXT DEFAULT 'contact_form',
  created_at TEXT DEFAULT (datetime('now'))
);
