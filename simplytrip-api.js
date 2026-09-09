const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby8t8B-Lbl35v9n-x5DZGFOtNPSjP_OecHobKGHvz11meqOxF3EUzw5nO-egCJkd4v7mQ/exec';

function getTripData() {
    return JSON.parse(localStorage.getItem('simplytrip_data') || '{}');
}

function getTripId() {
    const data = getTripData();
    if (!data.teacherName || !data.teacherPhone || !data.startDate || !data.endDate) {
        return null;
    }
    return `${data.teacherName}_${data.teacherPhone}_${data.startDate}_${data.endDate}`.replace(/[/\\?%*:|"<>]/g, '-');
}

// Auto-save form data ONLY if it changed relative to cached state
async function autoSaveTripData(newData) {
    const currentData = getTripData();
    
    // Check for changes
    let hasChanges = false;
    for (let key in newData) {
        if (JSON.stringify(currentData[key]) !== JSON.stringify(newData[key])) {
            hasChanges = true;
            break;
        }
    }

    const updatedData = Object.assign({}, currentData, newData);
    localStorage.setItem('simplytrip_data', JSON.stringify(updatedData));

    // If no changes, skip network request
    if (!hasChanges) {
        console.log('אין שינוי בנתונים - נמנעה פנייה ל-Drive');
        return;
    }

    const tripId = getTripId();
    if (!tripId) return;

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                action: 'saveData',
                tripId: tripId,
                payload: newData
            })
        });
        console.log('נתונים שונו ונשמרו אוטומטית ב-Drive');
    } catch (e) {
        console.error('שגיאה בשמירה ל-Drive:', e);
    }
}