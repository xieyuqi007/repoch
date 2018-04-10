/**
 * get animation event name
 */

var animationEvents = { 
    'animationstart': 'AnimationStart', 
    'animationiteration': 'AnimationIteration', 
    'animationend': 'AnimationEnd' 
};
var testNode = document.createElement('p');
var testProperty = 'animation';
var needPrefix = testNode.style[testProperty] == undefined;
var prefixes = ['o', 'MS', 'moz', 'webkit'];
var prefix = getPrefix();

/**
 * return the prefix for animation
 */

function getPrefix() {
    for (var i = prefixes.length - 1; i >= 0; i--) {
        if (testNode.style['-' + prefixes[i].toLowerCase() + '-' + testProperty] != undefined) {
            return prefixes[i];                
        };
    };
};

/**
 * prefix animation event name if needed
 *
 * @param {String} name
 * @return {String}
 * @api {public}
 */

export default function animationEventName(name) {
    return needPrefix ? prefix + animationEvents[name] : name;
};
