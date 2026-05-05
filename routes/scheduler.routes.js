const express = require('express');
const schedulerController = require('../controllers/scheduler.controller');

const router = express.Router();

router.get('/plan', schedulerController.getOptimalSchedule);

module.exports = router;
