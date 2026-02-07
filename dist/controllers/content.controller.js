"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFooterLinks = exports.getActivePopup = exports.bulkUpdateSettings = exports.updateSetting = exports.getSettingsByGroup = exports.getSettings = exports.listSettings = void 0;
const prisma_1 = require("../lib/prisma");
// Get all settings from the primary 'settings' table (usually for admin list)
// Get all settings from all tables for admin visibility
const listSettings = async (req, res) => {
    try {
        const [gen, api, biz, del, pay, sms] = await Promise.all([
            prisma_1.prisma.settings.findMany(),
            prisma_1.prisma.api_settings.findMany(),
            prisma_1.prisma.business_settings.findMany(),
            prisma_1.prisma.delivery_settings.findMany(),
            prisma_1.prisma.payment_settings.findMany(),
            prisma_1.prisma.sms_settings.findMany()
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error listing settings", error: error.message });
    }
};
exports.listSettings = listSettings;
// Get settings merged from all possible tables (usually for public frontend or general app state)
const getSettings = async (req, res) => {
    try {
        const [genSettings, apiSettings, bizSettings, deliverySettings, paySettings, smsSettings] = await Promise.all([
            prisma_1.prisma.settings.findMany(),
            prisma_1.prisma.api_settings.findMany(),
            prisma_1.prisma.business_settings.findMany(),
            prisma_1.prisma.delivery_settings.findMany(),
            prisma_1.prisma.payment_settings.findMany(),
            prisma_1.prisma.sms_settings.findMany()
        ]);
        const settings = {};
        const populate = (items) => {
            items.forEach(item => {
                if (item.key)
                    settings[item.key] = item.value || "";
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching settings", error: error.message });
    }
};
exports.getSettings = getSettings;
const getSettingsByGroup = async (req, res) => {
    try {
        const group = req.params.group;
        const [genSettings, apiSettings, bizSettings, deliverySettings, paymentSettings, smsSettings] = await Promise.all([
            prisma_1.prisma.settings.findMany({ where: { group } }),
            prisma_1.prisma.api_settings.findMany({ where: { group } }),
            prisma_1.prisma.business_settings.findMany({ where: { group } }),
            prisma_1.prisma.delivery_settings.findMany({ where: { group } }),
            prisma_1.prisma.payment_settings.findMany({ where: { group } }),
            prisma_1.prisma.sms_settings.findMany({ where: { group } })
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
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching settings for group: " + req.params.group, error: error.message });
    }
};
exports.getSettingsByGroup = getSettingsByGroup;
const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        await prisma_1.prisma.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json({ status: "success", message: "Setting updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating setting", error: error.message });
    }
};
exports.updateSetting = updateSetting;
const bulkUpdateSettings = async (req, res) => {
    try {
        let settings = {};
        // Handle FormData (fields)
        if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
            // Shallow copy req.body to settings
            for (const key in req.body) {
                settings[key] = req.body[key];
            }
        }
        // Handle file uploads for logo and favicon
        if (req.files && typeof req.files === 'object') {
            const files = req.files;
            if (files.logo && files.logo[0]) {
                settings.logo = `uploads/settings/${files.logo[0].filename}`;
            }
            if (files.favicon && files.favicon[0]) {
                settings.favicon = `uploads/settings/${files.favicon[0].filename}`;
            }
        }
        // SMART UPDATE: Find which table each key belongs to
        const tables = ['settings', 'api_settings', 'business_settings', 'delivery_settings', 'payment_settings', 'sms_settings'];
        await Promise.all(Object.keys(settings).map(async (key) => {
            const val = settings[key]?.toString() || "";
            let updated = false;
            // Try to find and update in specific tables first
            for (const table of tables) {
                // @ts-ignore
                const exists = await prisma_1.prisma[table].findUnique({ where: { key } });
                if (exists) {
                    // @ts-ignore
                    await prisma_1.prisma[table].update({ where: { key }, data: { value: val } });
                    updated = true;
                    break;
                }
            }
            // If not found in any table, create in the main 'settings' table
            if (!updated) {
                await prisma_1.prisma.settings.upsert({
                    where: { key },
                    update: { value: val },
                    create: { key, value: val }
                });
            }
        }));
        res.json({ status: "success", message: "Settings updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating settings", error: error.message });
    }
};
exports.bulkUpdateSettings = bulkUpdateSettings;
const getActivePopup = async (req, res) => {
    try {
        const popup = await prisma_1.prisma.popups.findFirst({
            where: { status: 'active' }
        });
        res.json(popup || {});
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching active popup", error: error.message });
    }
};
exports.getActivePopup = getActivePopup;
const getFooterLinks = async (req, res) => {
    try {
        const links = await prisma_1.prisma.footer_links.findMany({
            where: { status: 'active' },
            orderBy: { order: 'asc' }
        });
        res.json(links);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching footer links", error: error.message });
    }
};
exports.getFooterLinks = getFooterLinks;
