/**
 * 获取照片
 * @param {Object} opts
 * @param {Boolean} camera - 是否拍照
 * @param {Function} opts.onSuccess - 执行成功回调
 * @param {Function} opts.onFail - 执行失败回调
 * @return 图片base64编码
 * @weibo >=4.3.0
 * @Auther MrGalaxyn
 * 错误码
    代码        Status Code           含义
    200         OK                  操作成功
    400         MISSING_PARAMS      缺少必须的参数
    403         ILLEGAL_ACCESS      非法调用
    500         INTERNAL_ERROR      客户端内部处理错误
    501         ACTION_NOT_FOUND    客户端未实现此 action
    550         NO_RESULT           客户端没有获取到结果
    550         USER_CANCELLED      用户取消了操作
    553         SERVICE_FORBIDDEN   相关服务未启用或被禁止 (如定位服务，相册权限)
 */
import addEventListener from 'dom-helpers/events/on';

export default function(opts) {
    opts = Object.assign({
        camera: false,
        onSuccess: function() {},
        onFail: function() {}
    }, opts);

    var bridgeReady = function() {
        window.WeiboJSBridge.invoke("pickImage", opts.camera ? {source: 'camera'} : null, function(params, success, code) {
            if (success) {
                opts.onSuccess('data:image/jpeg;base64,' + params.base64);
            } else {
                opts.onFail(code);
            }
        });
    }
    
    if (!window.WeiboJSBridge) {
        opts.onFail(550);
        addEventListener(document, 'WeiboJSBridgeReady', bridgeReady);
        return;
    }

    bridgeReady();
}
