const axios = require('axios');
const config = require('../config');
const { getCache, setCache } = require('./cache');

const mockNotificationsData = {
    "notifications": [
        { "ID": "N1", "Type": "General", "Message": "Welcome to the new semester", "Timestamp": "2026-04-20 10:00:00" },
        { "ID": "N2", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:51:30" },
        { "ID": "N3", "Type": "Placement", "Message": "Google Campus Drive", "Timestamp": "2026-04-25 09:30:00" },
        { "ID": "N4", "Type": "Result", "Message": "lab evaluation", "Timestamp": "2026-04-24 14:00:00" },
        { "ID": "N5", "Type": "General", "Message": "Library closed", "Timestamp": "2026-04-26 08:00:00" },
        { "ID": "N6", "Type": "Placement", "Message": "Microsoft Interview Shortlist", "Timestamp": "2026-04-26 11:15:00" },
    ]
};

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
        return mockData;
    }
}

const getPriorityWeight = (type) => {
    const typeLower = (type || "").toLowerCase();
    switch (typeLower) {
        case 'result': return 3;
        case 'placement': return 2;
        case 'general': return 1;
        default: return 0;
    }
};

const fetchTopNotifications = async (limit = 10, filterType = null) => {
    const data = await fetchData(config.NOTIFICATION_API, mockNotificationsData, 'notifications');
    let notifications = data.notifications || [];

    if (filterType) {
        notifications = notifications.filter(n => (n.Type || "").toLowerCase() === filterType.toLowerCase());
    }

    notifications.sort((a, b) => {
        const weightA = getPriorityWeight(a.Type);
        const weightB = getPriorityWeight(b.Type);

        if (weightA !== weightB) {
            return weightB - weightA; // higher weight first
        }

        const timeA = new Date(a.Timestamp).getTime();
        const timeB = new Date(b.Timestamp).getTime();

        return timeB - timeA;
    });

    return notifications.slice(0, limit);
};

module.exports = {
    fetchTopNotifications
};