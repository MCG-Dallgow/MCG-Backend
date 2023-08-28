import { mysqlEnum, mysqlTable, varchar, tinyint, int } from 'drizzle-orm/mysql-core';
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
  authorId: varchar('author_id', { length: 8 }),
});
export type Post = typeof posts.$inferSelect;

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  content: many(contentBlocks),
}))

export const contentBlocks = mysqlTable('content_blocks', {
  id: int('id').autoincrement().primaryKey(),
  postId: int('post_id').notNull(),
  type: mysqlEnum('type', ['text']).notNull(),
});
export type ContentBlock = typeof contentBlocks.$inferSelect;

export const contentBlockRelations = relations(contentBlocks, ({ one }) => ({
  post: one(posts, {
    fields: [contentBlocks.postId],
    references: [posts.id],
  })
}));
