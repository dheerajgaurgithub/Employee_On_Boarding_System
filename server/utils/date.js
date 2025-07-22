// utils/date.js

// Returns start and end range for today
function getTodayRange() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { today, tomorrow };
}

module.exports = {
    getTodayRange
};
