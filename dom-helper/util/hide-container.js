/**
 * 页面统一隐藏容器工具
 * @id STK.core.util.hideContainer
 * @author Finrila | wangzheng4@staff.sina.com.cn
 * @example 
 * STK.core.util.hideContainer.appendChild(STK.E('test'));
 * STK.core.util.hideContainer.removeChild(STK.E('test'));
 * @import STK.core.dom.isNode
 */
import isNode from '../dom/is-node';

var hideDiv;

var initDiv = function() {
    if(hideDiv) return;
    hideDiv = $.C("div");
    hideDiv.style.cssText = "position:absolute;top:-9999px;left:-9999px;";
    document.getElementsByTagName("head")[0].appendChild(hideDiv);
};

export default {
    /**
     * 向隐藏容器添加节点
     * @method appendChild
     * @param {Element} el 节点
     */
    appendChild: function(el) {
        if(isNode(el)) {
            initDiv();
            hideDiv.appendChild(el);
        }
    },
        /**
         * 向隐藏容器添加节点
         * @method removeChild
         * @param {Element} el 节点
         */
        removeChild: function(el) {
        if(isNode(el)) {
            hideDiv && hideDiv.removeChild(el);
        }
    }
};
