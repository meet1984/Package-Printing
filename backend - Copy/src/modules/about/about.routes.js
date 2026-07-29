const express = require('express');
const router = express.Router();
const ctrl = require('./about.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public aggregate
router.get('/', ctrl.getAboutPageData);

// ─── Team Members ────────────────────────────────────────
router.get('/team-members', ctrl.teamMembers.getAll);
router.post('/team-members', protect, admin, ctrl.teamMembers.create);
router.put('/team-members/:id', protect, admin, ctrl.teamMembers.update);
router.delete('/team-members/:id', protect, admin, ctrl.teamMembers.delete);

// ─── Stat Counters ───────────────────────────────────────
router.get('/stat-counters', ctrl.statCounters.getAll);
router.post('/stat-counters', protect, admin, ctrl.statCounters.create);
router.put('/stat-counters/:id', protect, admin, ctrl.statCounters.update);
router.delete('/stat-counters/:id', protect, admin, ctrl.statCounters.delete);

// ─── Value Props ─────────────────────────────────────────
router.get('/value-props', ctrl.valueProps.getAll);
router.post('/value-props', protect, admin, ctrl.valueProps.create);
router.put('/value-props/:id', protect, admin, ctrl.valueProps.update);
router.delete('/value-props/:id', protect, admin, ctrl.valueProps.delete);

// ─── Process Pillars ─────────────────────────────────────
router.get('/process-pillars', ctrl.processPillars.getAll);
router.post('/process-pillars', protect, admin, ctrl.processPillars.create);
router.put('/process-pillars/:id', protect, admin, ctrl.processPillars.update);
router.delete('/process-pillars/:id', protect, admin, ctrl.processPillars.delete);

// ─── Partner Brands ──────────────────────────────────────
router.get('/partner-brands', ctrl.partnerBrands.getAll);
router.post('/partner-brands', protect, admin, ctrl.partnerBrands.create);
router.put('/partner-brands/:id', protect, admin, ctrl.partnerBrands.update);
router.delete('/partner-brands/:id', protect, admin, ctrl.partnerBrands.delete);

module.exports = router;
