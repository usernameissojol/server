
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const settings = [
        // Steadfast
        { key: 'steadfast_api_key', value: '', group: 'courier' },
        { key: 'steadfast_secret_key', value: '', group: 'courier' },
        { key: 'steadfast_base_url', value: 'https://portal.packzy.com/api/v1', group: 'courier' },

        // Pathao
        { key: 'pathao_client_id', value: '', group: 'courier' },
        { key: 'pathao_client_secret', value: '', group: 'courier' },
        { key: 'pathao_username', value: '', group: 'courier' },
        { key: 'pathao_password', value: '', group: 'courier' },
        { key: 'pathao_access_token', value: '', group: 'courier' },
        { key: 'pathao_base_url', value: 'https://api-hermes.pathao.com', group: 'courier' },

        // Redx
        { key: 'redx_access_token', value: '', group: 'courier' },
        { key: 'redx_base_url', value: 'https://openapi.redx.com.bd/v1.0.0-beta', group: 'courier' },

        // Paperfly
        { key: 'paperfly_username', value: '', group: 'courier' },
        { key: 'paperfly_password', value: '', group: 'courier' },
        { key: 'paperfly_key', value: '', group: 'courier' },
        { key: 'paperfly_base_url', value: 'https://api.paperfly.com.bd/api/v1', group: 'courier' },

        // eCourier
        { key: 'ecourier_api_key', value: '', group: 'courier' },
        { key: 'ecourier_api_secret', value: '', group: 'courier' },
        { key: 'ecourier_user_id', value: '', group: 'courier' },
        { key: 'ecourier_base_url', value: 'https://backoffice.ecourier.com.bd/api', group: 'courier' }
    ];

    console.log('Seeding courier settings...');

    for (const setting of settings) {
        await prisma.delivery_settings.upsert({
            where: { key: setting.key },
            update: { value: setting.value, group: setting.group },
            create: { key: setting.key, value: setting.value, group: setting.group }
        });
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
