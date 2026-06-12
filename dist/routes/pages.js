"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Get all FAQs
router.get('/faqs', async (req, res) => {
    try {
        const faqs = await prisma_1.default.faq.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(faqs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get Privacy Policy
router.get('/privacy', async (req, res) => {
    try {
        const setting = await prisma_1.default.appSetting.findUnique({
            where: { key: 'privacy_policy' }
        });
        res.json({ privacyPolicy: setting ? setting.value : '' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get About Us parameters
router.get('/about', async (req, res) => {
    try {
        const setting = await prisma_1.default.appSetting.findUnique({
            where: { key: 'about_us' }
        });
        if (setting) {
            try {
                res.json(JSON.parse(setting.value));
            }
            catch (e) {
                res.json({ error: 'Invalid about_us format' });
            }
        }
        else {
            res.json(null);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get Subscription Pack details (mobile details page content)
router.get('/subscription-details', async (req, res) => {
    try {
        const setting = await prisma_1.default.appSetting.findUnique({
            where: { key: 'subscription_details' }
        });
        if (setting) {
            try {
                res.json(JSON.parse(setting.value));
            }
            catch (e) {
                res.json(null);
            }
        }
        else {
            res.json(null);
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get Locked Days
router.get('/locked-days', async (req, res) => {
    try {
        const setting = await prisma_1.default.appSetting.findUnique({
            where: { key: 'locked_days' }
        });
        res.json(setting ? JSON.parse(setting.value) : []);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
