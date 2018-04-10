'use strict';

// This is a built-in polyfill for requestIdleCallback. It works by scheduling
// a requestAnimationFrame, storing the time for the start of the frame, then
// scheduling a postMessage which gets scheduled after paint. Within the
// postMessage handler do as much work as possible until time + frame rate.
// By separating the idle call into a separate event tick we ensure that
// layout, paint and other browser work is counted against the available time.
// The frame rate is dynamically adjusted.

import { RAF } from '../raf/index';

// TODO: There's no way to cancel
let rIC = (callback) => number;

if (!process.env.BROWSER) {
    rIC = function(frameCallback) {
        setTimeout(() => {
            frameCallback({
                timeRemaining() {
                    return Infinity;
                },
            });
        });
        return 0;
    };
} else if (typeof requestIdleCallback !== 'function') {
    // Polyfill requestIdleCallback.
    var scheduledRICCallback = null;

    var isIdleScheduled = false;
    var isAnimationFrameScheduled = false;

    var frameDeadline = 0;
    // We start out assuming that we run at 30fps but then the heuristic tracking
    // will adjust this value to a faster fps if we get more frequent animation
    // frames.
    var previousFrameTime = 16;
    var activeFrameTime = 16;

    var frameDeadlineObject = {
        timeRemaining: function() {
            // As a fallback we use Date.now.
            return frameDeadline - Date.now();
        }
    };

    // We use the postMessage trick to defer idle work until after the repaint.
    var messageKey = '__repochIdleCallback$' + Math.random().toString(36).slice(2);
    var idleTick = function(event) {
        if (event.source !== window || event.data !== messageKey) {
            return;
        }
        isIdleScheduled = false;
        var callback = scheduledRICCallback;
        scheduledRICCallback = null;
        if (callback !== null) {
            callback(frameDeadlineObject);
        }
    };
    // Assumes that we have addEventListener in this environment. Might need
    // something better for old IE.
    window.addEventListener('message', idleTick, false);

    var animationTick = function() {
        var rafTime = Date.now();
        isAnimationFrameScheduled = false;
        var nextFrameTime = rafTime - frameDeadline + activeFrameTime;
        if (
            nextFrameTime < activeFrameTime &&
            previousFrameTime < activeFrameTime
        ) {
            if (nextFrameTime < 8) {
                // Defensive coding. We don't support higher frame rates than 120hz.
                // If we get lower than that, it is probably a bug.
                nextFrameTime = 8;
            }
            // If one frame goes long, then the next one can be short to catch up.
            // If two frames are short in a row, then that's an indication that we
            // actually have a higher frame rate than what we're currently optimizing.
            // We adjust our heuristic dynamically accordingly. For example, if we're
            // running on 120hz display or 90hz VR display.
            // Take the max of the two in case one of them was an anomaly due to
            // missed frame deadlines.
            activeFrameTime = nextFrameTime < previousFrameTime
                ? previousFrameTime
                : nextFrameTime;
        } else {
            previousFrameTime = nextFrameTime;
        }
        frameDeadline = rafTime + activeFrameTime;
        if (!isIdleScheduled) {
            isIdleScheduled = true;
            window.postMessage(messageKey, '*');
        }
    };

    rIC = function(callback) {
        // This assumes that we only schedule one callback at a time
        scheduledRICCallback = callback;
        if (!isAnimationFrameScheduled) {
            // If rAF didn't already schedule one, we need to schedule a frame.
            // TODO: If this rAF doesn't materialize because the browser throttles, we
            // might want to still have setTimeout trigger rIC as a backup to ensure
            // that we keep performing work.
            isAnimationFrameScheduled = true;
            RAF(animationTick);
        }
        return 0;
    };
} else {
    rIC = requestIdleCallback;
}

export default rIC;

