const express = require('express');
const schedulerRoutes = require('./routes/scheduler.routes');
const notificationRoutes = require('./routes/notification.routes');
const logger = require('./middlewares/logger');
const validate = require('./middlewares/validate');

const app = express();

app.use(express.json());

//  Logging Middleware Rule
app.use(logger);

// Input Validation Middleware
app.use(validate);

// Health check endpoint (quick win)
app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

// Routes
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;
