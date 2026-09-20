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

// better-auth core tables (Google + Email code login via sendlib).
// IDs are text to match better-auth expectations.
const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

module.exports = { projects, apiKeys, otps, auditLogs, user, session, account, verification };
