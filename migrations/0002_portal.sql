-- Empower portal: Google sign-in, roles, students, progress updates,
-- parent links and school program milestones.
--
-- Data minimisation: students are stored by first name + last initial only.
-- No diagnoses, OEN numbers, birthdates or addresses are collected.

CREATE TABLE users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name           TEXT,
  picture        TEXT,
  google_sub     TEXT UNIQUE,                 -- set on first Google sign-in
  role           TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
  invited_by     INTEGER REFERENCES users(id),
  disabled       INTEGER NOT NULL DEFAULT 0,  -- removed users keep their history
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at  TEXT
);

CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,               -- SHA-256 of the cookie token
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL,               -- unix ms
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE schools (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  board       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE milestones (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id   INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done')),
  due_date    TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_milestones_school ON milestones(school_id);

CREATE TABLE students (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  school_id     INTEGER REFERENCES schools(id) ON DELETE SET NULL,
  first_name    TEXT NOT NULL,
  last_initial  TEXT,
  grade         TEXT,
  goals         TEXT,                         -- one goal per line
  archived      INTEGER NOT NULL DEFAULT 0,
  created_by    INTEGER REFERENCES users(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Teachers assigned to a student
CREATE TABLE student_staff (
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, user_id)
);

-- Parents / guardians linked to a student
CREATE TABLE guardians (
  student_id    INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship  TEXT,
  PRIMARY KEY (student_id, user_id)
);
CREATE INDEX idx_guardians_user ON guardians(user_id);

CREATE TABLE updates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  author_id   INTEGER NOT NULL REFERENCES users(id),
  category    TEXT NOT NULL DEFAULT 'general',
  body        TEXT NOT NULL,
  visibility  TEXT NOT NULL DEFAULT 'parents' CHECK (visibility IN ('parents', 'staff')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_updates_student ON updates(student_id, created_at);

CREATE TABLE update_comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  update_id   INTEGER NOT NULL REFERENCES updates(id) ON DELETE CASCADE,
  author_id   INTEGER NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_comments_update ON update_comments(update_id);

CREATE TABLE audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   INTEGER,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
