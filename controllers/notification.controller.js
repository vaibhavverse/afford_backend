const notificationService = require('../services/notification.service');

const getTopNotifications = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const type = req.query.type || null;

        const topNotifications = await notificationService.fetchTopNotifications(limit, type);
        res.status(200).json({
            success: true,
            data: topNotifications
        });
    } catch (error) {
        process.stdout.write(JSON.stringify({ level: 'error', message: error.message }) + "\n");
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    getTopNotifications
};
