import { RequestHandler } from 'express';
import { eq } from 'drizzle-orm';

import * as auth from './auth';
import db from '../db/db';
import { posts, Post } from '../db/schema';

export const getPosts: RequestHandler = async (_, res) => {
    const result = await db.select().from(posts);
        
    res.json({ data: result });
}

export const addPost: RequestHandler = async (req, res) => {
    // authenticate and start WebUntis API session
    const [untis, user] = await auth.authenticate(req, res, true);
    if (!untis) return; // abort if authentication was unsuccessful

    const title = req.body['title'] ?? "";
    const data = req.body['data'] ?? "";
    const now = new Date();

    await db.insert(posts).values({ title: title, authorId: user.id, creationDate: now, editedDate: now, data: data });

    res.json({ message: "ok" });
}
