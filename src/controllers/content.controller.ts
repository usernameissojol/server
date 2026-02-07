import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// Get all settings from the primary 'settings' table (usually for admin list)
// Get all settings from all tables for admin visibility
export const listSettings = async (req: Request, res: Response) => {
    try {
        const [gen, api, biz, del, pay, sms] = await Promise.all([
            prisma.settings.findMany(),
            prisma.api_settings.findMany(),
            prisma.business_settings.findMany(),
            prisma.delivery_settings.findMany(),
            prisma.payment_settings.findMany(),
            prisma.sms_settings.findMany()
        ]);

        const all = [
            ...gen.map(s => ({ ...s, source_table: 'settings' })),
            ...api.map(s => ({ ...s, source_table: 'api_settings' })),
            ...biz.map(s => ({ ...s, source_table: 'business_settings' })),
            ...del.map(s => ({ ...s, source_table: 'delivery_settings' })),
            ...pay.map(s => ({ ...s, source_table: 'payment_settings' })),
            ...sms.map(s => ({ ...s, source_table: 'sms_settings' }))
        ];

        res.json(all);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error listing settings", error: error.message });
    }
};

// Get settings merged from all possible tables (usually for public frontend or general app state)
export const getSettings = async (req: Request, res: Response) => {
    try {
        const [genSettings, apiSettings, bizSettings, deliverySettings, paySettings, smsSettings] = await Promise.all([
            prisma.settings.findMany(),
            prisma.api_settings.findMany(),
            prisma.business_settings.findMany(),
            prisma.delivery_settings.findMany(),
            prisma.payment_settings.findMany(),
            prisma.sms_settings.findMany()
        ]);

        const settings: Record<string, string> = {};

        const populate = (items: any[]) => {
            items.forEach(item => {
                if (item.key) settings[item.key] = item.value || "";
            });
        };

        // Merge all, with genSettings taking priority for overrides
        populate(apiSettings);
        populate(bizSettings);
        populate(deliverySettings);
        populate(paySettings);
        populate(smsSettings);
        populate(genSettings);

        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching settings", error: error.message });
    }
};

export const getSettingsByGroup = async (req: Request, res: Response) => {
    try {
        const group = req.params.group as string;

        const [
            genSettings,
            apiSettings,
            bizSettings,
            deliverySettings,
            paymentSettings,
            smsSettings
        ] = await Promise.all([
            prisma.settings.findMany({ where: { group } }),
            prisma.api_settings.findMany({ where: { group } }),
            prisma.business_settings.findMany({ where: { group } }),
            prisma.delivery_settings.findMany({ where: { group } }),
            prisma.payment_settings.findMany({ where: { group } }),
            prisma.sms_settings.findMany({ where: { group } })
        ]);

        const allSettings = [
            ...genSettings,
            ...apiSettings,
            ...bizSettings,
            ...deliverySettings,
            ...paymentSettings,
            ...smsSettings
        ];

        res.json(allSettings);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching settings for group: " + req.params.group, error: error.message });
    }
};

export const updateSetting = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        await prisma.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json({ status: "success", message: "Setting updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating setting", error: error.message });
    }
};

export const bulkUpdateSettings = async (req: Request, res: Response) => {
    try {
        let settings: Record<string, string> = {};

        // Handle FormData (fields)
        if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
            // Shallow copy req.body to settings
            for (const key in req.body) {
                settings[key] = req.body[key];
            }
        }

        // Handle file uploads for logo and favicon
        if (req.files && typeof req.files === 'object') {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (files.logo && files.logo[0]) {
                settings.logo = `uploads/settings/${files.logo[0].filename}`;
            }
            if (files.favicon && files.favicon[0]) {
                settings.favicon = `uploads/settings/${files.favicon[0].filename}`;
            }
        }

        // SMART UPDATE: Find which table each key belongs to
        const tables = ['settings', 'api_settings', 'business_settings', 'delivery_settings', 'payment_settings', 'sms_settings'];

        await Promise.all(
            Object.keys(settings).map(async (key) => {
                const val = settings[key]?.toString() || "";
                let updated = false;

                // Try to find and update in specific tables first
                for (const table of tables) {
                    // @ts-ignore
                    const exists = await prisma[table].findUnique({ where: { key } });
                    if (exists) {
                        // @ts-ignore
                        await prisma[table].update({ where: { key }, data: { value: val } });
                        updated = true;
                        break;
                    }
                }

                // If not found in any table, create in the main 'settings' table
                if (!updated) {
                    await prisma.settings.upsert({
                        where: { key },
                        update: { value: val },
                        create: { key, value: val }
                    });
                }
            })
        );

        res.json({ status: "success", message: "Settings updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating settings", error: error.message });
    }
};

export const getActivePopup = async (req: Request, res: Response) => {
    try {
        const popup = await prisma.popups.findFirst({
            where: { status: 'active' }
        });
        res.json(popup || {});
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching active popup", error: error.message });
    }
};

export const getFooterLinks = async (req: Request, res: Response) => {
    try {
        const links = await prisma.footer_links.findMany({
            where: { status: 'active' },
            orderBy: { order: 'asc' }
        });
        res.json(links);
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching footer links", error: error.message });
    }
};
