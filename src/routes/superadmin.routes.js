const express = require('express');
const router = express.Router();

const {
  getDashboard,
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,
} = require('../controllers/superadmin.controller');

// Naya controller import kiya
const {
  getSubscriptions,
  createSubscription,
  getAnalytics,
  getSettings,
  updateSettings,
} = require('../controllers/superadminExtra.controller');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role.middleware');

router.use(protect, authorize('superadmin'));

// Purane Routes
router.get('/dashboard', getDashboard);
router.get('/schools', getSchools);
router.post('/schools', createSchool);
router.put('/schools/:id', updateSchool);
router.delete('/schools/:id', deleteSchool);

// Naye Routes
router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions', createSubscription);
router.get('/analytics', getAnalytics);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;