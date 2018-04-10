import rIC from '@repoch/dom-helper/ric/index';
import warning from 'warning';

let tasks = [];
let isRequestIdleCallbackScheduled = false;

function schedulePendingEvents() {
    // Only schedule the rIC if one has not already been set.
    if (isRequestIdleCallbackScheduled) return;

    isRequestIdleCallbackScheduled = true;
    rIC(processPendingAnalyticsEvents);
}

function processPendingAnalyticsEvents(deadline) {
    // Go for as long as there is time remaining and work to do.
    while (deadline.timeRemaining() > 0 && tasks.length > 0) {
        let task = tasks.pop();
        task();
    }

    // Reset the boolean so future rICs can be set.
    isRequestIdleCallbackScheduled = false;

    // Check if there are more events still to send.
    if (tasks.length > 0) schedulePendingEvents();
}

export default function createBackgroundTask(task) {
    if (typeof task !== 'function') {
        warning(false, `[createBackgroundTask] must has a function as argument`);
        return;
    }

    tasks.push(task);
    schedulePendingEvents();
}

