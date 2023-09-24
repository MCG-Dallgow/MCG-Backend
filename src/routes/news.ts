import express from 'express';
let router = express.Router();

import * as news from '../controllers/news';

// NEWS
router.get('/', news.getPosts);
router.post('/', news.addPost);

export default router;
