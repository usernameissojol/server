import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPixelSettings() {
    try {
        console.log('Seeding pixel tracking settings...\n');

        // Facebook Pixel Settings
        const fbSettings = [
            { key: 'fb_pixel_id', value: '', group: 'facebook_pixel' },
            { key: 'fb_access_token', value: '', group: 'facebook_pixel' },
            { key: 'fb_test_event', value: '0', group: 'facebook_pixel' },
        ];

        for (const setting of fbSettings) {
            await prisma.api_settings.upsert({
                where: { key: setting.key },
                update: { value: setting.value, group: setting.group },
                create: setting,
            });
        }

        console.log('✓ Seeded Facebook Pixel settings');

        // TikTok Pixel Settings (update if needed)
        const tiktokSettings = [
            { key: 'tiktok_pixel_id', value: '', group: 'tiktok_pixel' },
            { key: 'tiktok_access_token', value: '', group: 'tiktok_pixel' },
            { key: 'tiktok_test_event', value: '0', group: 'tiktok_pixel' },
        ];

        for (const setting of tiktokSettings) {
            await prisma.api_settings.upsert({
                where: { key: setting.key },
                update: { group: setting.group }, // Keep existing values
                create: setting,
            });
        }

        console.log('✓ Verified TikTok Pixel settings');

        // Google Tag Manager Settings
        const gtmSettings = [
            { key: 'gtm_id', value: '', group: 'google_analytics' },
            { key: 'ga4_measurement_id', value: '', group: 'google_analytics' },
        ];

        for (const setting of gtmSettings) {
            await prisma.api_settings.upsert({
                where: { key: setting.key },
                update: { group: setting.group },
                create: setting,
            });
        }

        console.log('✓ Verified Google Analytics settings');

        console.log('\n✅ All pixel tracking settings configured!');
        console.log('\nYou can now configure these at:');
        console.log('  - Facebook Pixel: /admin/settings/facebook-pixel');
        console.log('  - TikTok Pixel: /admin/settings/tiktok-pixel');
        console.log('  - Google Analytics: /admin/settings (if available)');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedPixelSettings();
