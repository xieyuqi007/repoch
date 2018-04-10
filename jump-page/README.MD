/**
 * 页面跳转功能函数
 * @name jumpPage
 * @function
 * @param {String} node
 * @param {Object} 
 *         {
 *             'force' : 强制使用window.location.href跳转
 *             'blank' : 新开页打开连接
 *             'replace':替换当前的url历史记录
 *         }
 * @author MrGalaxyn
 */

import browserHistory from 'utils/react-router/lib/browserHistory';
import isSameOrigin from 'utils/url/isSameOrigin';

export function jumpPage(url, opts = {}) {
    if (!process.env.BROWSER) return;

    let { force, replace, blank } = opts;
    //强制window.location.href跳转
    if (force) {
        if (replace) {
            window.location.replace(url);
        } else {
            window.location.href = url;
        }
        
        return;
    }

    if (blank) {
        window.open(url);
        return;
    }

    let method = replace ? 'replace' : 'push';
    let parsedUrl = isSameOrigin(url);
    if (parsedUrl === false) { 
        let realUrl = decodeURIComponent(url.split('sinaweibo://browser?url=')[1]);
        if (realUrl !== 'undefined') {
            // 临时的兼容代码
            if (realUrl.indexOf('cf.weibo.com') > -1) {
                realUrl = realUrl.split('cf.weibo.com')[1];
            }
            let parsedRealUrl = isSameOrigin(realUrl);
            if (parsedRealUrl !== false) {
                browserHistory[method](realUrl);
                return;
            }
        }
        url += url.indexOf('sinainternalbrowser') < 0 ? 
            ((url.indexOf('?') < 0 ? '?' : '&') + 'sinainternalbrowser=topnav') :
            '';

        if (replace) {
            window.location.replace(url);
        } else {
            window.location.href = url;
        }
    } else {
        let { pathname, search } = parsedUrl;
        browserHistory[method](pathname + (search ? '?' + search : ''));
    }
}

