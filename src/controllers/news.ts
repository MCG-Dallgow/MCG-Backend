import { RequestHandler } from 'express';

import * as auth from './auth';
import db from '../db/db';
import { posts } from '../db/schema';
import { desc } from 'drizzle-orm';

export const getPosts: RequestHandler = async (_, res) => {
    const result = await db.select().from(posts).orderBy(desc(posts.creationDate));

    res.json({ data: result });
};

export const addPost: RequestHandler = async (req, res) => {
    // authenticate and start WebUntis API session
    const [untis, user] = await auth.authenticate(req, res, true);
    if (!untis) return; // abort if authentication was unsuccessful

    const title = req.body['title'] ?? "";
    const data = req.body['data'] ?? "";
    const now = new Date(Date.now());

    await db.insert(posts).values({ title: title, authorId: user!.id, creationDate: now, editedDate: now, data: data });

    res.json({ message: "ok" });
};
