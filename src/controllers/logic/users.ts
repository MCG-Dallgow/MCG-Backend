import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import db from '../../db/db';
import { users, students } from '../../db/schema';
import { startWebUntisSession, getStudentGroup } from '../webuntis';

async function createBaseUser(username: string, password: string) {
    if (username == '' || password == '') {
        return undefined;
    }

    // check if user is in database
    var user = (await db.select().from(users).where(eq(users.username, username)))[0];

    // cancel if user is invalid or already registered
    if (!user || user.registered) {
        return undefined;
    }

    // generate salted password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // register user in database
    await db.update(users).set({
        registered: true,
        hashedPassword: hashedPassword,
    }).where(eq(users.username, username));

    // return user data
    return user;
}

export async function createStudent(username: string, password: string, webuntisKey: string) {
    // check WebUntis credentials and start API session
    const untisSession = await startWebUntisSession(username, webuntisKey);
    if (!untisSession) {
        return undefined;
    }

    // create base user
    const user = await createBaseUser(username, password);
    if (!user) {
        return undefined;
    }

    // get student data from WebUntis
    const group = await getStudentGroup(untisSession);
    const grade = parseInt(group.match(/[0-9]{2}/)![0]);  // TODO: handle grades 7-9

    // end WebUntis session
    await untisSession.logout();

    // add WebUntis key to user data
    await db.update(users).set({ webuntisKey: webuntisKey }).where(eq(users.username, username));

    // write student data to database
    await db.insert(students).values({
        id: user.id,
        grade: grade,
        group: group,
    });

    // get full student data
    const student = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .leftJoin(students, eq(users.id, students.id));

    return student;
}

export async function loginUser(username: string, password: string) {
    let error = '';

    if (username == '' || password == '') {
        error = 'invalid credentials';
        return { user: undefined, error: error };
    }

    // check if user is in database
    var user = (await db.select().from(users).where(eq(users.username, username)))[0];

    if (!user || !user.registered || !user.hashedPassword) {
        error = 'user does not exist';
        return { user: undefined, error: error };
    }

    // check if password matches
    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordMatches) {
        error = 'invalid credentials';
        return { user: undefined, error: error };
    }

    return { user: user, error: error };
}
