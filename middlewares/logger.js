const logger = (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const log = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            time: `${Date.now() - start}ms`
        };
        process.stdout.write(JSON.stringify(log) + "\n");
    });
    next();
};

module.exports = logger;
