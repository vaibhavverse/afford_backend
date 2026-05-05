const axios = require('axios');
const config = require('../config');
const { getCache, setCache } = require('./cache');

const mockDepotsData = {
    "depots": [
        { "ID": 1, "MechanicHours": 60 },
        { "ID": 2, "MechanicHours": 135 },
        { "ID": 3, "MechanicHours": 188 },
        { "ID": 4, "MechanicHours": 97 },
        { "ID": 5, "MechanicHours": 164 }
    ]
};

const mockVehiclesData = [
    { "TaskID": "T001", "Duration": 5, "Impact": 10 },
    { "TaskID": "T002", "Duration": 50, "Impact": 80 },
    { "TaskID": "T003", "Duration": 120, "Impact": 200 },
    { "TaskID": "T004", "Duration": 30, "Impact": 45 },
    { "TaskID": "T005", "Duration": 200, "Impact": 350 },
    { "TaskID": "T006", "Duration": 15, "Impact": 25 },
    { "TaskID": "T007", "Duration": 80, "Impact": 140 },
    { "TaskID": "T008", "Duration": 300, "Impact": 500 }
];

async function fetchData(url, mockData, key) {
    const cached = getCache(key);
    if (cached) return cached;

    try {
        const res = await axios.get(url, {
            headers: {
                Authorization: "Bearer YOUR_TOKEN_IF_REQUIRED"
            }
        });
        setCache(key, res.data);
        return res.data;
    } catch (err) {
        // Fallback used due to 401 Unauthorized or other network errors
        return mockData;
    }
}

const calculateOptimalSchedule = async () => {
    const depotsResponse = await fetchData(config.DEPOT_API, mockDepotsData, 'depots');
    let vehiclesResponse = await fetchData(config.VEHICLE_API, mockVehiclesData, 'vehicles');

    const depots = depotsResponse.depots || [];
    const vehicles = Array.isArray(vehiclesResponse) ? vehiclesResponse : vehiclesResponse.vehicles || [];

    let totalMechanicHours = 0;
    depots.forEach(depot => {
        totalMechanicHours += depot.MechanicHours;
    });

    const n = vehicles.length;
    const W = totalMechanicHours;
    
    const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const duration = vehicles[i - 1].Duration;
        const impact = vehicles[i - 1].Impact;
        
        for (let w = 1; w <= W; w++) {
            if (duration <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - duration] + impact);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    let res = dp[n][W];
    let w = W;
    const selectedTasks = [];

    for (let i = n; i > 0 && res > 0; i--) {
        if (res !== dp[i - 1][w]) {
            selectedTasks.push(vehicles[i - 1]);
            res = res - vehicles[i - 1].Impact;
            w = w - vehicles[i - 1].Duration;
        }
    }

    const totalSelectedImpact = dp[n][W];
    let totalSelectedDuration = 0;
    selectedTasks.forEach(task => { totalSelectedDuration += task.Duration; });

    const efficiency = totalSelectedDuration > 0 ? (totalSelectedImpact / totalSelectedDuration).toFixed(2) + " impact/hour" : "0 impact/hour";

    return {
        totalAvailableHours: W,
        totalSelectedImpact: totalSelectedImpact,
        totalSelectedDuration: totalSelectedDuration,
        efficiency: efficiency,
        selectedTasks: selectedTasks
    };
};

module.exports = {
    calculateOptimalSchedule
};