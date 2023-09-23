import { mysqlEnum, mysqlTable, varchar, text, tinyint, int, date } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

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

// --- STAFF ---

export const staff = mysqlTable('staff', {
  id: varchar('id', { length: 8 }).primaryKey(),
  firstname: varchar('firstname', { length: 50 }).notNull(),
  lastname: varchar('lastname', { length: 50 }).notNull(),
  email: varchar('email', { length: 256 }).primaryKey(),
});
export type Staff = typeof staff.$inferSelect;

// --- POST ---

export const posts = mysqlTable('posts', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  authorId: varchar('author_id', { length: 8 }).notNull().references(() => users.id),
  creationDate: date('creation_date'),
  editedDate: date('edited_date'),
  data: text('data').notNull(),
});
export type Post = typeof posts.$inferSelect;

export const postRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}))
