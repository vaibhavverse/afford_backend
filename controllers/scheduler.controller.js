const schedulerService = require('../services/scheduler.service');

const getOptimalSchedule = async (req, res) => {
    try {
        const schedule = await schedulerService.calculateOptimalSchedule();
        res.status(200).json({
            success: true,
            data: schedule
        });
    } catch (error) {
        // No console.log allowed!
        process.stdout.write(JSON.stringify({ level: 'error', message: error.message }) + "\n");
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    getOptimalSchedule
};
