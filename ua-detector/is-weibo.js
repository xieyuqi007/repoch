'use strict';

export default function fromWeibo() {
    return process.env.BROWSER ? /_weibo_/ig.test(window.navigator.userAgent) : false;
};
