import { mysqlEnum, mysqlTable, varchar, int, tinyint, boolean, timestamp } from 'drizzle-orm/mysql-core';

// --- USER ---

export const users = mysqlTable('users', {
    id: int('id').primaryKey().autoincrement().notNull(),
    username: varchar('username', { length: 8 }).notNull(),
    firstname: varchar('firstname', { length: 50 }).notNull(),
    lastname: varchar('lastname', { length: 50 }).notNull(),
    gender: mysqlEnum('gender', ['M', 'F', 'D']),
    registered: boolean('registered').default(false).notNull(),
    hashedPassword: varchar('hashed_password', { length: 64 }).default('').notNull(),
    webuntisKey: varchar('webuntis_key', { length: 16 }).default('').notNull(),
});
export type User = typeof users.$inferSelect;

// --- STUDENT ---

export const students = mysqlTable('students', {
    id: int('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }).notNull(),
    grade: tinyint('grade').notNull(),
    group: varchar('group', { length: 3 }).notNull(),
});
export type Student = typeof students.$inferSelect;

// --- TEACHER ---

export const teacher = mysqlTable('teacher', {
    id: int('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }).notNull(),
    email: varchar('email', { length: 256 }),
});
export type Teacher = typeof teacher.$inferSelect;

// --- SESSION ---

export const sessions = mysqlTable('sessions', {
    token: varchar('token', { length: 86 }).primaryKey().notNull(),
    userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
});
export type Session = typeof sessions.$inferSelect;

// --- SUBJECT ---

export const subjects = mysqlTable('subjects', {
    id: varchar('id', { length: 3 }).primaryKey(),
    name: varchar('name', { length: 30 }).notNull(),
});
export type Subject = typeof subjects.$inferSelect;

export const teacherToSubjects = mysqlTable('teacher_to_subjects', {
    teacherId: int('teacher_id').notNull().references(() => teacher.id),
    subjectId: varchar('subject_id', { length: 3 }).notNull().references(() => subjects.id),
});
