let raf, cancelRaf;
if (process.env.BROWSER) {
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    const af = 'AnimationFrame';
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        const vendor = vendors[x];
        raf = window[`${vendor}Request${af}`];
        cancelRaf = window[`${vendor}Cancel${af}`] || 
            window[`${vendor}CancelRequest${af}`];
    }
}

if (!raf) {
    let lastTime = 0;
    raf = callback => {
        const currTime = Date.now ? Date.now() : new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = window.setTimeout(() => callback(currTime + timeToCall), timeToCall);

        lastTime = currTime + timeToCall;
        return id;
    }
}

if (!cancelRaf) {
    cancelRaf = id => clearTimeout(id);
}

export const RAF = raf;
export const cancelRAF = cancelRaf;

