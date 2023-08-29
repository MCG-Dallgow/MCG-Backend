export function getSubjectId(name: string): string {
    // get first three letters of name
    var id = name.match(/.{3}/)![0];

    // handle special cases
    switch (id) {
        case 'Sem':
            id = 'SK';
            break;
        case 'Pol':
            id = 'PB';
            break;
        case 'Wir':
            id = 'WAT';
            break;
        case 'Leb':
            id = 'LER';
            break;
    }

    return id;
}
