import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { json, urlencoded } from 'body-parser';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

// MIDDLEWARE
app.use(helmet());

app.use(json());
app.use(urlencoded({ extended: false }));

// ROUTER
import authRouter from './routes/auth';
import timetableRouter from './routes/timetable';
import teachersRouter from './routes/teachers';

app.use('/auth/', authRouter);
app.use('/timetable/', timetableRouter);
app.use('/teachers/', teachersRouter);

// ERROR MESSAGE
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: err.message });
});

// RUN
app.listen(port, () => {
    console.log(`MCG-App backend listening on port ${port}`);
});
