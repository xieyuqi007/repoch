/**
 * 日志上报脚本
 * @author MrGalaxyn
 */
import getNetworkType from '@repoch/weibo-jsbridge/network-type';
import fromWeibo from '@repoch/is-weibo';

let lid, pid, tid;
let errSended = false;
let firstScreen = false;

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
    let stat = Object.assign({ 
        pv: 1,
        cache: $CONFIG['fromCache'] ? 1 : 0,
        network: false 
    }, extra);

    if (!firstScreen) {
        firstScreen = true;
        stat.first = 1;
    }

    send(stat);
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
}

export function getpid() {
    return lid + String(100 + pid % 100).substr(1);
}

export function gettid() {
    return getpid() + String(1000 + (tid++) % 1000).substr(1);
}

