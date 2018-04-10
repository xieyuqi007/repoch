import axios from './lib/axios';
import jsonToQuery from '@repoch/format/json-to-query';
import { jumpPage } from '@repoch/jump-page';
import warning from 'warning';
import { gettid } from '@repoch/logger';

const ajLocks = {};
const callbacks = {};
const processResponse = (result) => {
    switch(result.status) {
        case 200:
            let res = result.data;
            switch(res.code) {
                case 100000:
                case '100000':
                    return { data: res.data, msg: res.msg };

                case 100002:
                case '100002':
                    if (callbacks[res.code]) {
                        callbacks[res.code](res);
                    } else {
                        jumpPage(
                            res.data.url ||
                            "http://passport.weibo.cn/signin/login?r=" +
                            encodeURIComponent(window.location.href),
                            { replace: true }
                        );
                    }

                    break;

                case 100004:
                case '100004':
                    if (callbacks[res.code]) {
                        callbacks[res.code](res);
                    } else {
                        jumpPage(
                            res.data.url || 
                            `/errpage?r=${encodeURIComponent(window.location.href)}`, 
                            { replace: true }
                        );
                    }

                    break;
                default:
                    break;
            }

            return Promise.reject(res);

        default:
            return Promise.reject('服务器错误');
    }
}

export const get = (url, data, options) => {
    let reqUrl = url;
    if (data) {
        if (data[0] === '?' || data[0] === '&') {
            warning(false, '[utils/io/ajax] ' +
                'do not put "?" or "$" as the first byte of data, "' + data + '"'
            );
        }
        reqUrl += reqUrl.indexOf('?') < 0 ? '?' : '&';
        reqUrl += typeof data === 'string' ? data : jsonToQuery(data);
    }

    reqUrl += reqUrl.indexOf('?') < 0 ? '?' : '&';
    reqUrl += '_lid=' + gettid();

    if (options) {
        delete options.cache;
    }

    if (ajLocks[reqUrl]) return;
    ajLocks[reqUrl] = true;

    return axios.get(reqUrl, options).then((result) => {
        delete ajLocks[reqUrl];
        return result;
    }).catch(result => {
        delete ajLocks[reqUrl];
        return Promise.reject('服务器错误');
    }).then(processResponse);
}

export const post = (url, data, options) => {
    if (ajLocks[url]) return;
    ajLocks[url] = true;

    if (options && options.raw) {
        data['_lid'] = gettid();
        delete options.raw;
    } else if (typeof data === 'string') {
        data += data === '' ? '' : '&';
        data += '_lid=' + gettid();
    } else if (typeof data === 'object') {
        data = data || {};
        data['_lid'] = gettid();
        data = jsonToQuery(data);
    }
        
    return axios.post(url, data, options).then((result) => {
        delete ajLocks[url];
        return result;
    }).catch(result => {
        delete ajLocks[url];
        return Promise.reject('服务器错误');
    }).then(processResponse);
}

export const isCommonError = res => {
    if (process.env.NODE_ENV === 'development') {
        console.error(res);
    }
    return res && (res.code == 100002 || res.code == 100004);
}

export const registerCallback = (code, callback) => {
    callbacks[code] = callback;
}

