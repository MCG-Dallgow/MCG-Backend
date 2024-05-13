import { mysqlEnum, mysqlTable, varchar, tinyint } from 'drizzle-orm/mysql-core';

// --- USER ---

export const users = mysqlTable('users', {
    id: varchar('id', { length: 8 }).primaryKey(),
    firstname: varchar('firstname', { length: 50 }).notNull(),
    lastname: varchar('lastname', { length: 50 }).notNull(),
    type: mysqlEnum('type', ['student', 'teacher']).notNull(),
    grade: tinyint('grade'),
    group: varchar('group', { length: 3 }),
});
export type User = typeof users.$inferSelect;

// --- SUBJECT ---

export const subjects = mysqlTable('subject', {
    id: varchar('id', { length: 3 }).primaryKey(),
    name: varchar('name', { length: 30 }).notNull(),
});
export type Subject = typeof subjects.$inferSelect;

// --- STAFF ---

export const staff = mysqlTable('staff', {
    id: varchar('id', { length: 8 }).primaryKey(),
    firstname: varchar('firstname', { length: 50 }).notNull(),
    lastname: varchar('lastname', { length: 50 }).notNull(),
    gender: mysqlEnum('gender', ['M', 'F', 'D']),
    email: varchar('email', { length: 256 }),
});
export type Staff = typeof staff.$inferSelect;

export const staffToSubjects = mysqlTable('staff_to_subjects', {
    staffId: varchar('staff_id', { length: 8 }).notNull().references(() => staff.id),
    subjectId: varchar('subject_id', { length: 3 }).notNull().references(() => subjects.id),
});
