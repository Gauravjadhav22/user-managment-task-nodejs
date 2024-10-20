import { PrismaClient } from '@prisma/client';
import {DATA} from "./data"
const prisma = new PrismaClient();

async function main() {

  for (const user of DATA.users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        password: user.password, 
        role: user.role as any 
      }
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
