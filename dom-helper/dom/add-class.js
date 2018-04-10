/**
 * Add classname(s) for an Element
 * @name dom#addClassName
 * @function
 * @param {Element} node
 * @param {String} className
 * @author MrGalaxyn
 */

import isWindow from "./is-window";
import hasClass from "./has-class";

export default function (node, className) {
    if (!node || !className || isWindow(node)) return;
    className.split(/\s+/g).forEach(function(klass) {
        if (hasClass(node, klass)) return;

        if (node.classList) node.classList.add(klass);
        else {
            if (node.className && node.className.baseVal !== undefined)
                node.className.baseVal = klass;
            else
                node.className = klass;
        }
    });
};
