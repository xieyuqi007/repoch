/**
 * bee - page data collection
 * @author MrGalaxyn
 */
import getNetworkType from '@repoch/weibo-jsbridge/network-type';
import fromWeibo from '@repoch/ua-detector/is-weibo';
import createBackgroundTask from '@repoch/create-backgroud-tasks';

let lid, pid, tid;
let errSended = false;
let firstScreen = false;
let startVisitTime = 0;
let stayTime = 0;

export function send(stat) {
    if (!window['__logger__']) {
        return;
    }

    if ($CONFIG['uid']) {
        stat.uid = $CONFIG['uid'];
    }

    if (!fromWeibo()) {
        window['__logger__'](stat);
    } else {
        getNetworkType({
            onSuccess: function(res) {
                stat.network = res;
                window['__logger__'](stat);
            },
            onFail: function(code) {
                if (code !== 100) {
                    window['__logger__'](stat);
                }
            }
        });
    }
}

export function pv(extra) {
    createBackgroundTask(() => {
        let stat = Object.assign({ 
            pv: 1,
            pid: getpid(),
            i_s_pd: pid,
            sr: $CONFIG["serverRender"] ? 1 : 0,
            cache: $CONFIG['fromCache'] ? 1 : 0,
            network: false
        }, extra);

        if (!firstScreen) {
            firstScreen = true;
            stat.first = 1;
        }

        if (pid > 1) {
            stat.i_s_vt = stayTime;
        }

        send(stat);
    });
}

export function initLogger() {
    lid = String(Date.now()).substr(5) + String(Math.random()).substr(2, 4);
    pid = 0;
    let oldOnError = window.onerror;

    window.onerror = function(message, file, line, column, error) {
        oldOnError && oldOnError.apply(this, arguments);
        if (errSended) { return; }
        errSended = true;
        let stat = { err: 1, pid: getpid() }
        send(stat);
    };
}

export function setpid() {
    errSended = false;
    pid++;
    tid = 0;
    let now = Date.now();
    if (pid > 1) {
        stayTime = now - startVisitTime;
    }
    startVisitTime = now;
}

export function getpid() {
    return lid + String(100 + pid % 100).substr(1);
}

export function gettid() {
    return getpid() + String(1000 + (tid++) % 1000).substr(1);
}

