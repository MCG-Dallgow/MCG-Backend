import { RequestHandler } from 'express';

import { loginUser, createStudent } from './logic/users';
import { generateSessionToken } from './logic/sessions';

function getCredentialsFromAuthorizationHeader(authorizationHeader: string | undefined): [string, string] {
    const base64String: string = authorizationHeader?.split(' ')[1] ?? '';
    const credentials: string = Buffer.from(base64String, 'base64').toString();
    const credentialsSplit: string[] = credentials.split(':') ?? ['', ''];
    const username = credentialsSplit[0];
    const password = credentialsSplit[1];

    return [username, password];
}

// login user and generate session token
export const login: RequestHandler = async (req, res) => {
    const [username, password] = getCredentialsFromAuthorizationHeader(req.headers.authorization);

    const { user, error } = await loginUser(username, password);
    // abort if authentication was unsuccessful
    if (!user) {
        res.status(401).json({ success: false, message: error });
        return undefined;
    }

    const sessionToken = await generateSessionToken(user);

    // return user data
    res.json({
        success: true,
        user: {
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
        },
        sessionToken: sessionToken,
    });
};

// create new student user account
export const registerStudent: RequestHandler = async (req, res) => {
    const [username, password] = getCredentialsFromAuthorizationHeader(req.headers.authorization);
    const webuntisKey = req.body.webuntiskey;
    if (!username || !password || !webuntisKey) {
        res.status(401).json({ success: false, message: 'invalid credentials' });
        return;
    }

    console.log(username, password, webuntisKey);

    const user = await createStudent(username, password, webuntisKey);
    if (!user) {
        res.status(401).json({ success: false, message: 'user registration failed' });
        return;
    }

    res.json({ success: true, message: 'user registered' });
}
