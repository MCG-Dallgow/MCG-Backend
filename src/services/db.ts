import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
    console.log('Database connected successfully');
}

main()
    .catch((e) => {
        console.error(e.message);
    })
    .finally(async () => {
        await db.$disconnect();
    });

export default db;
