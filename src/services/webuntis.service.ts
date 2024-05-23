import { WebUntis, WebUntisSecretAuth } from 'webuntis';
import { authenticator as Authenticator } from 'otplib';

export async function getStudentGroup(untis: WebUntis) {
    const groupId = untis.sessionInformation!.klasseId!;
    const schoolYearId = (await untis.getLatestSchoolyear()).id;
    const groups = await untis.getClasses(undefined, schoolYearId);
    const group = groups.filter((group) => group.id == groupId)[0];
    const groupName = group.name.replace('Jhg', '');
    return groupName;
}

export async function startWebUntisSession(username: string, webuntisKey: string) {
    if (username == '' || webuntisKey == '') {
        console.log('credentials empty');
        return undefined;
    }

    // check WebUntis credentials and start API session
    const untis: WebUntis = new WebUntisSecretAuth(
        'Marie-Curie-Gym',
        username,
        webuntisKey,
        'herakles.webuntis.com',
        undefined,
        Authenticator,
    );
    try {
        await untis.login();
    } catch (err) {
        console.log(err);
        return undefined;
    }

    return untis;
}

export async function getStudents(untisSession: WebUntis) {
    const userData = [];

    const students = await untisSession.getStudents();

    for (const student of students) {
        userData.push({
            username: student.name,
            firstname: student.foreName,
            lastname: student.longName,
        });
    }

    return userData;
}
