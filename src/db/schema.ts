import { mysqlEnum, mysqlTable, varchar, text, tinyint, int, date } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// --- USER ---

export const users = mysqlTable('users', {
  id: varchar('name', { length: 8 }).primaryKey(),
  firstname: varchar('firstname', { length: 50 }).notNull(),
  lastname: varchar('lastname', { length: 50 }).notNull(),
  type: mysqlEnum('type', ['student', 'teacher']).notNull(),
  grade: tinyint('grade'),
  group: varchar('group', { length: 3 })
});
export type User = typeof users.$inferSelect;

// --- POST ---

export const posts = mysqlTable('posts', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  authorId: varchar('author_id', { length: 8 }).notNull().references(() => users.id),
  creationDate: date('creation_date'),
  editedDate: date('edited_date'),
  data: varchar('data', { length: 500 }).notNull()
});
export type Post = typeof posts.$inferSelect;

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}))
