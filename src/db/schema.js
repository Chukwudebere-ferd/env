// Drizzle schema. Mirrors sql/schema.sql + audit_logs per README vault spec.
// Tables: projects, api_keys (ciphertext/iv/auth_tag, never plaintext), otps, audit_logs.
const { pgTable, serial, text, integer, boolean, timestamp, index } = require('drizzle-orm/pg-core');

const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [index('idx_projects_user').on(t.userEmail)]);

const apiKeys = pgTable('api_keys', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  configName: text('config_name').notNull(),
  ciphertext: text('ciphertext').notNull(),
  iv: text('iv').notNull(),
  authTag: text('auth_tag').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [index('idx_keys_project').on(t.projectId)]);

const otps = pgTable('otps', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumed: boolean('consumed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [index('idx_otps_user_project').on(t.userEmail, t.projectId)]);

// Audit every view/copy per vault spec: user_id(email for v1), key_id (null = all), action, ip, timestamp.
const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  keyId: integer('key_id').references(() => apiKeys.id, { onDelete: 'set null' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [index('idx_audit_user_project').on(t.userEmail, t.projectId)]);

module.exports = { projects, apiKeys, otps, auditLogs };
