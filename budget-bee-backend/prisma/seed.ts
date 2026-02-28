import { PrismaClient, CategoryType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('TestPass123!', config.BCRYPT_ROUNDS);

    const user = await prisma.user.upsert({
        where: { email: 'test@budgetbee.lk' },
        update: {},
        create: {
            email: 'test@budgetbee.lk',
            password: passwordHash,
            firstName: 'Kumar',
            lastName: 'Test',
        },
    });

    const categoriesData = [
        {
            name: 'Food',
            icon: 'fork-knife',
            color: '#22C55E',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Transport',
            icon: 'car',
            color: '#F59E0B',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Rent',
            icon: 'house',
            color: '#EF4444',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Health',
            icon: 'stethoscope',
            color: '#14B8A6',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Gifts',
            icon: 'gift-box',
            color: '#3B82F6',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Beauty',
            icon: 'diamond',
            color: '#A855F7',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Donations',
            icon: 'hands-heart',
            color: '#EC4899',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Dress',
            icon: 'pants',
            color: '#8B5CF6',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Pet',
            icon: 'paw',
            color: '#78350F',
            type: CategoryType.EXPENSE,
            isDefault: true,
        },
        {
            name: 'Others',
            icon: 'dots',
            color: '#6B7280',
            type: CategoryType.BOTH,
            isDefault: true,
        },
    ];

    await Promise.all(
        categoriesData.map((cat) =>
            prisma.category.upsert({
                where: { name: cat.name },
                update: {},
                create: cat,
            })
        )
    );

    await prisma.account.createMany({
        data: [
            {
                userId: user.id,
                name: 'BOC',
                type: 'BANK',
                balance: 0,
                cardNumber: '4345',
                cardNetwork: 'MASTERCARD',
            },
            {
                userId: user.id,
                name: 'NSB',
                type: 'BANK',
                balance: 0,
                cardNumber: '4789',
                cardNetwork: 'VISA',
            },
            {
                userId: user.id,
                name: 'Oct Exp',
                type: 'CASH',
                balance: 0,
            },
            {
                userId: user.id,
                name: 'Sept Dep',
                type: 'CASH',
                balance: 0,
            },
        ],
        skipDuplicates: true,
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

